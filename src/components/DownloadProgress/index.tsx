import React from 'react';
import { Modal, Progress, Typography, Space, Button, Result } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import useDownloadStore from '../../store/downloadStore';
import { getDownloadFileUrl } from '../../api/video';
import { useSseProgress } from './useSseProgress';

const { Text } = Typography;

interface DownloadProgressProps {
  taskId: string | null;
  open: boolean;
  onClose: () => void;
}

const DownloadProgress: React.FC<DownloadProgressProps> = ({ taskId, open, onClose }) => {
  const { currentTask } = useDownloadStore();

  useSseProgress(taskId);

  if (!currentTask || !taskId) {
    return null;
  }

  const { status, progress, speed, eta, errorMsg } = currentTask;
  const isFinished = status === 'COMPLETED' || status === 'FAILED';

  const renderContent = () => {
    if (status === 'COMPLETED') {
      return (
        <Result
          status="success"
          title="下载完成"
          subTitle="视频已准备就绪，点击下方按钮保存到本地"
          extra={
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="large"
              href={getDownloadFileUrl(taskId)}
            >
              保存到本地
            </Button>
          }
        />
      );
    }

    if (status === 'FAILED') {
      return (
        <Result
          status="error"
          title="下载失败"
          subTitle={errorMsg || '未知错误，请稍后重试'}
        />
      );
    }

    return (
      <div style={{ padding: '24px 0' }}>
        <Progress
          percent={Math.round(progress * 100) / 100}
          status="active"
          strokeColor={{ from: '#108ee9', to: '#87d068' }}
        />
        <Space size={24} style={{ marginTop: 12 }}>
          {speed && <Text type="secondary">速度：{speed}</Text>}
          {eta && <Text type="secondary">预计剩余：{eta}</Text>}
        </Space>
      </div>
    );
  };

  const titleMap: Record<string, string> = {
    PENDING: '准备下载...',
    RUNNING: '下载中...',
    COMPLETED: '下载完成',
    FAILED: '下载失败',
  };

  return (
    <Modal
      title={titleMap[status] || '下载'}
      open={open}
      onCancel={onClose}
      footer={null}
      closable={isFinished}
      maskClosable={false}
      keyboard={false}
      destroyOnClose
      width="90%"
      style={{ maxWidth: 480 }}
    >
      {renderContent()}
    </Modal>
  );
};

export default DownloadProgress;
