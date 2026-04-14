import React, { useEffect, useState } from 'react';
import {
  Table, Button, Tag, Space, Modal, Form, Input, Select,
  Switch, message, Popconfirm, Typography, Grid,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/auth';

const { useBreakpoint } = Grid;
const { Text } = Typography;

interface UserItem {
  id: number;
  username: string;
  role: string;
  enabled: boolean;
  createdAt: string;
}

type ModalMode = 'create' | 'edit-role' | 'reset-pwd';

const roleLabel = (role: string) =>
  role === 'ADMIN'
    ? <Tag color="blue">管理员</Tag>
    : <Tag color="green">会员</Tag>;

const UserManagement: React.FC = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [list, setList] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState<{ open: boolean; mode: ModalMode; user?: UserItem }>({
    open: false, mode: 'create',
  });
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchList = async (p = page) => {
    setLoading(true);
    try {
      const data = await getUsers(p, 20);
      setList(data.list);
      setTotal(data.total);
    } catch (err: any) {
      message.error('获取用户列表失败：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(1); }, []);

  const openCreate = () => {
    form.resetFields();
    setModal({ open: true, mode: 'create' });
  };

  const openEditRole = (user: UserItem) => {
    form.setFieldsValue({ role: user.role });
    setModal({ open: true, mode: 'edit-role', user });
  };

  const openResetPwd = (user: UserItem) => {
    form.resetFields();
    setModal({ open: true, mode: 'reset-pwd', user });
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      if (modal.mode === 'create') {
        await createUser({ username: values.username, password: values.password, role: values.role });
        message.success('用户创建成功');
      } else if (modal.mode === 'edit-role' && modal.user) {
        await updateUser(modal.user.id, { role: values.role, enabled: values.enabled });
        message.success('修改成功');
      } else if (modal.mode === 'reset-pwd' && modal.user) {
        await updateUser(modal.user.id, { password: values.password });
        message.success('密码已重置');
      }
      setModal({ open: false, mode: 'create' });
      fetchList(1);
      setPage(1);
    } catch (err: any) {
      message.error(err.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      message.success('已删除');
      fetchList(1);
      setPage(1);
    } catch (err: any) {
      message.error(err.message || '删除失败');
    }
  };

  const handleToggleEnabled = async (user: UserItem) => {
    try {
      await updateUser(user.id, { enabled: !user.enabled });
      fetchList(page);
    } catch (err: any) {
      message.error(err.message || '操作失败');
    }
  };

  const modalTitle = { create: '新建用户', 'edit-role': '编辑用户', 'reset-pwd': '重置密码' }[modal.mode];

  const columns = [
    ...(!isMobile ? [{ title: 'ID', dataIndex: 'id', width: 64 }] : []),
    {
      title: '用户名', dataIndex: 'username',
      render: (v: string) => <Text strong>{v}</Text>,
    },
    { title: '角色', dataIndex: 'role', width: 80, render: roleLabel },
    {
      title: '状态', dataIndex: 'enabled', width: 80,
      render: (v: boolean, record: UserItem) => (
        <Switch
          size="small"
          checked={v}
          onChange={() => handleToggleEnabled(record)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    ...(!isMobile ? [{ title: '创建时间', dataIndex: 'createdAt', width: 160 }] : []),
    {
      title: '操作', width: isMobile ? 96 : 160,
      render: (_: any, record: UserItem) => (
        <Space size={0}>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditRole(record)}>
            {!isMobile && '编辑'}
          </Button>
          <Button type="link" size="small" icon={<KeyOutlined />} onClick={() => openResetPwd(record)}>
            {!isMobile && '密码'}
          </Button>
          <Popconfirm title="确认删除该用户？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: isMobile ? '16px 12px 20px' : '20px 24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建用户</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={list}
        columns={columns}
        loading={loading}
        size="small"
        scroll={{ x: 'max-content' }}
        pagination={{
          current: page, total, pageSize: 20,
          showTotal: isMobile ? undefined : (t) => `共 ${t} 条`,
          onChange: (p) => { setPage(p); fetchList(p); },
          simple: isMobile,
        }}
      />

      <Modal
        title={modalTitle}
        open={modal.open}
        onCancel={() => setModal({ open: false, mode: 'create' })}
        onOk={form.submit}
        confirmLoading={submitting}
        width={400}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}
          style={{ marginTop: 16 }} requiredMark={false}>

          {modal.mode === 'create' && (
            <>
              <Form.Item name="username" label="用户名"
                rules={[{ required: true }, { min: 2, max: 32, message: '2-32 个字符' }]}>
                <Input placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item name="password" label="密码"
                rules={[{ required: true }, { min: 6, message: '至少 6 位' }]}>
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
              <Form.Item name="role" label="角色" initialValue="MEMBER" rules={[{ required: true }]}>
                <Select options={[
                  { label: '会员', value: 'MEMBER' },
                  { label: '管理员', value: 'ADMIN' },
                ]} />
              </Form.Item>
            </>
          )}

          {modal.mode === 'edit-role' && (
            <>
              <Form.Item name="role" label="角色" rules={[{ required: true }]}>
                <Select options={[
                  { label: '会员', value: 'MEMBER' },
                  { label: '管理员', value: 'ADMIN' },
                ]} />
              </Form.Item>
              <Form.Item name="enabled" label="状态" valuePropName="checked" initialValue={modal.user?.enabled}>
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
              </Form.Item>
            </>
          )}

          {modal.mode === 'reset-pwd' && (
            <Form.Item name="password" label={`为 "${modal.user?.username}" 设置新密码`}
              rules={[{ required: true }, { min: 6, message: '至少 6 位' }]}>
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
