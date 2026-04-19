import React from 'react';
import { Card, Typography } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import UrlInput from '../../components/UrlInput';
import VideoCard from '../../components/VideoCard';
import DownloadProgress from '../../components/DownloadProgress';
import DownloadHistory from '../../components/DownloadHistory';
import { useHomeLogic } from './useHomeLogic';
import SEO from '../../components/SEO';

const { Paragraph } = Typography;

const Home: React.FC = () => {
  const {
    url,
    setUrl,
    platform,
    setPlatform,
    parseLoading,
    videoInfo,
    selectedFormat,
    setSelectedFormat,
    downloadLoading,
    currentTaskId,
    progressOpen,
    refreshTrigger,
    handleParse,
    handleDownload,
    handleProgressClose,
  } = useHomeLogic();

  return (
    <div>
      <SEO
        title="视频下载工具"
        description="支持抖音、B站、YouTube 等主流平台的在线视频解析与下载工具，免费、快速、无需安装。"
        canonical="/"
      />
      {/* URL输入区域 */}
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <VideoCameraOutlined style={{ fontSize: 32, color: '#6366f1' }} />
          <Paragraph type="secondary" style={{ marginTop: 8 }}>
            粘贴视频链接，即可解析并下载
          </Paragraph>
        </div>
        <UrlInput
          value={url}
          onChange={setUrl}
          onParse={handleParse}
          loading={parseLoading}
          platform={platform}
          onPlatformChange={setPlatform}
        />
      </Card>

      {/* 视频信息卡片 */}
      {videoInfo && (
        <VideoCard
          videoInfo={videoInfo}
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
          onDownload={handleDownload}
          downloadLoading={downloadLoading}
        />
      )}

      {/* 下载进度弹窗 */}
      <DownloadProgress
        taskId={currentTaskId}
        open={progressOpen}
        onClose={handleProgressClose}
      />

      {/* 下载历史 */}
      <DownloadHistory refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default Home;
