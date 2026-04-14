import React, { useEffect, useState } from 'react';
import {
  Alert, Button, Descriptions, Divider, message,
  Spin, Typography, Upload,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined,
  ExclamationCircleOutlined, InboxOutlined, ReloadOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { uploadCookieFile, getCookieInfo } from '../../api/auth';

const { Text, Paragraph } = Typography;
const { Dragger } = Upload;

interface CookieInfo {
  configured: boolean;
  path?: string;
  exists?: boolean;
  size?: number;
  lastModified?: number;
}

const formatSize = (bytes?: number) => {
  if (!bytes) return '—';
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
};

const formatDate = (ms?: number) =>
  ms ? new Date(ms).toLocaleString('zh-CN') : '—';

const CookieSettings: React.FC = () => {
  const [info, setInfo] = useState<CookieInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      setInfo(await getCookieInfo());
    } catch (err: any) {
      message.error('获取状态失败：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInfo(); }, []);

  const handleUpload = async () => {
    const file = fileList[0]?.originFileObj as File;
    if (!file) return;
    setUploading(true);
    try {
      await uploadCookieFile(file);
      message.success('Cookie 文件已更新，立即生效');
      setFileList([]);
      fetchInfo();
    } catch (err: any) {
      message.error('上传失败：' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const alertProps = (() => {
    if (!info) return null;
    if (!info.configured)
      return { type: 'warning' as const, icon: <ExclamationCircleOutlined />, message: '服务端未配置 Cookie 路径，请检查 application.yml' };
    if (!info.exists)
      return { type: 'error' as const, icon: <CloseCircleOutlined />, message: 'Cookie 文件不存在，yt-dlp 将无法携带认证，请上传文件' };
    return { type: 'success' as const, icon: <CheckCircleOutlined />, message: 'Cookie 文件正常，yt-dlp 已加载' };
  })();

  return (
    <div style={{ padding: '20px 24px 28px' }}>

      {/* ── 当前状态 ─────────────────────────── */}
      <div style={s.blockHeader}>
        <Text strong>当前状态</Text>
        <Button
          type="text" size="small" icon={<ReloadOutlined />}
          loading={loading} onClick={fetchInfo}
          style={{ color: '#8c8c8c' }}
        >
          刷新
        </Button>
      </div>

      <Spin spinning={loading}>
        {alertProps && (
          <Alert
            showIcon
            icon={alertProps.icon}
            type={alertProps.type}
            message={alertProps.message}
            style={{ marginBottom: 16, borderRadius: 8 }}
          />
        )}

        {info?.configured && (
          <Descriptions
            bordered
            size="small"
            column={1}
            labelStyle={{ width: 90, color: '#8c8c8c', background: '#fafafa' }}
            contentStyle={{ background: '#fff' }}
            style={{ borderRadius: 8, overflow: 'hidden' }}
          >
            <Descriptions.Item label="文件路径">
              <Text code copyable style={{ fontSize: 12 }}>{info.path}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="文件状态">
              {info.exists
                ? <Text type="success"><CheckCircleOutlined /> 存在</Text>
                : <Text type="danger"><CloseCircleOutlined /> 不存在</Text>}
            </Descriptions.Item>
            {info.exists && (
              <>
                <Descriptions.Item label="文件大小">
                  <Text type="secondary">{formatSize(info.size)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="最后修改">
                  <Text type="secondary">{formatDate(info.lastModified)}</Text>
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Spin>

      <Divider style={{ margin: '24px 0' }} />

      {/* ── 更新 Cookie ──────────────────────── */}
      <div style={s.blockHeader}>
        <Text strong>更新 Cookie</Text>
      </div>

      <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
        当 yt-dlp 提示需要登录或解析失败时，从浏览器重新导出
        <Text code style={{ fontSize: 12, margin: '0 4px' }}>cookies.txt</Text>
        后上传即可覆盖服务端文件，无需重启服务。
      </Paragraph>

      <Dragger
        beforeUpload={() => false}
        fileList={fileList}
        onChange={({ fileList: list }) => setFileList(list.slice(-1))}
        accept=".txt"
        maxCount={1}
        style={{ borderRadius: 8, marginBottom: 16 }}
      >
        <p className="ant-upload-drag-icon" style={{ marginBottom: 8 }}>
          <InboxOutlined style={{ fontSize: 36, color: '#6366f1' }} />
        </p>
        <p style={{ fontSize: 14, color: '#262626', marginBottom: 4 }}>
          点击或将 <Text code style={{ fontSize: 12 }}>cookies.txt</Text> 拖拽到此处
        </p>
        <p style={{ fontSize: 12, color: '#8c8c8c' }}>仅支持 .txt 格式</p>
      </Dragger>

      <Button
        type="primary"
        onClick={handleUpload}
        loading={uploading}
        disabled={fileList.length === 0}
      >
        上传并覆盖
      </Button>
    </div>
  );
};

const s = {
  blockHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  } as React.CSSProperties,
};

export default CookieSettings;
