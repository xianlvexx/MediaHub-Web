import React from 'react';
import { Button, Space, Grid } from 'antd';
import { DownloadOutlined, RedoOutlined, UploadOutlined } from '@ant-design/icons';

const { useBreakpoint } = Grid;

interface ResultPreviewProps {
  originalUrl: string;
  resultUrl: string;
  onReselect: () => void;
  onReupload: () => void;
}

const ResultPreview: React.FC<ResultPreviewProps> = ({
  originalUrl,
  resultUrl,
  onReselect,
  onReupload,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `logo-removed-${Date.now()}.png`;
    a.click();
  };

  const imgStyle: React.CSSProperties = {
    maxWidth: '100%',
    maxHeight: '55vh',
    width: 'auto',
    height: 'auto',
    display: 'block',
    margin: '0 auto',
    borderRadius: 8,
    border: '1px solid #f0f0f0',
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 16,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 8, textAlign: 'center' }}>
            原图
          </div>
          <img src={originalUrl} alt="原图" style={imgStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 8, textAlign: 'center' }}>
            处理后
          </div>
          <img src={resultUrl} alt="处理后" style={imgStyle} />
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Space wrap>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            size={isMobile ? 'small' : 'middle'}
          >
            下载结果图
          </Button>
          <Button
            icon={<RedoOutlined />}
            onClick={onReselect}
            size={isMobile ? 'small' : 'middle'}
          >
            重新框选
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={onReupload}
            size={isMobile ? 'small' : 'middle'}
          >
            重新上传
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ResultPreview;
