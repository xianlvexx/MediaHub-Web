import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Button, Popconfirm, message, Space, Grid, Modal, Tooltip } from 'antd';
import { DeleteOutlined, DownloadOutlined, ReloadOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DownloadTaskItem, TaskStatus } from '../../api/types';
import { getTaskList, deleteTask, getDownloadFileUrl } from '../../api/video';
import { formatFileSize } from '../../utils/formatSize';
import { getPlatformDisplayInfo } from '../../utils/urlParser';

const { useBreakpoint } = Grid;

const statusConfig: Record<TaskStatus, { color: string; text: string }> = {
  PENDING: { color: 'default', text: '等待中' },
  RUNNING: { color: '#6366f1', text: '下载中' },
  COMPLETED: { color: 'success', text: '已完成' },
  FAILED: { color: 'error', text: '失败' },
  CANCELLED: { color: 'warning', text: '已取消' },
};

interface DownloadHistoryProps {
  refreshTrigger?: number;
}

const DownloadHistory: React.FC<DownloadHistoryProps> = ({ refreshTrigger }) => {
  const [data, setData] = useState<DownloadTaskItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expiredVisible, setExpiredVisible] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const fetchData = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result = await getTaskList(p, 10);
      setData(result.list);
      setTotal(result.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page);
  }, [page, refreshTrigger, fetchData]);

  const handleDownload = async (taskId: string) => {
    const url = getDownloadFileUrl(taskId);
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (!res.ok) {
        setExpiredVisible(true);
        return;
      }
      const a = document.createElement('a');
      a.href = url;
      a.click();
    } catch {
      message.error('下载请求失败，请稍后重试');
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      message.success('删除成功');
      fetchData(page);
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<DownloadTaskItem> = [
    {
      title: '视频标题',
      dataIndex: 'videoTitle',
      key: 'videoTitle',
      ellipsis: true,
      ...(isMobile ? {} : { width: 250 }),
    },
    ...(!isMobile
      ? [
          {
            title: '视频来源',
            dataIndex: 'platform',
            key: 'platform',
            width: 90,
            render: (platform: string) => {
              const { label, color } = getPlatformDisplayInfo(platform || '');
              return platform ? <Tag color={color}>{label}</Tag> : '-';
            },
          } as const,
          {
            title: '画质',
            dataIndex: 'formatNote',
            key: 'formatNote',
            width: 100,
          } as const,
        ]
      : []),
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: isMobile ? 62 : 90,
      render: (status: TaskStatus) => {
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    ...(!isMobile
      ? [
          {
            title: '文件大小',
            dataIndex: 'fileSize',
            key: 'fileSize',
            width: 100,
            render: (size: number) => (size > 0 ? formatFileSize(size) : '-'),
          } as const,
          {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 170,
            render: (val: string) => val ? new Date(val).toLocaleString('zh-CN') : '-',
          } as const,
        ]
      : []),
    {
      title: '操作',
      key: 'action',
      width: isMobile ? 64 : 150,
      render: (_: unknown, record: DownloadTaskItem) => (
        <Space size={0}>
          {record.status === 'COMPLETED' && (
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record.taskId)}
            >
              {isMobile ? '' : '下载'}
            </Button>
          )}
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.taskId)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              {isMobile ? '' : '删除'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
    <Modal
      open={expiredVisible}
      onCancel={() => setExpiredVisible(false)}
      footer={null}
      width={360}
      centered
    >
      <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
        <ExclamationCircleOutlined style={{ fontSize: 40, color: '#faad14', marginBottom: 16 }} />
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>视频已失效，请重新解析下载</div>
      </div>
    </Modal>
    <Card
      style={{ marginTop: 16 }}
      title={
        <span>
          下载历史
          <Tooltip title="文件仅保留一个月，超期后将自动清除">
            <InfoCircleOutlined style={{ marginLeft: 6, color: '#999', fontSize: 13, cursor: 'default' }} />
          </Tooltip>
        </span>
      }
      extra={
        <Button icon={<ReloadOutlined />} size="small" onClick={() => fetchData(page)}>
          刷新
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="taskId"
        loading={loading}
        size="small"
        scroll={undefined}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage,
          showSizeChanger: false,
          showTotal: isMobile ? undefined : (t) => `共 ${t} 条`,
          size: isMobile ? 'small' : 'default',
        }}
      />
    </Card>
    </>
  );
};

export default DownloadHistory;
