import React, { useState } from 'react';
import { Card, Tag, Space, Typography, Divider, Grid } from 'antd';
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { VideoInfo } from '../../api/types';
import { formatDuration } from '../../utils/formatSize';
import FormatSelector from './FormatSelector';

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const FALLBACK_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjEyMCIgeT0iNzUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4=';

interface VideoCardProps {
  videoInfo: VideoInfo;
  selectedFormat: string;
  onFormatChange: (formatId: string) => void;
  onDownload: () => void;
  downloadLoading: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({
  videoInfo,
  selectedFormat,
  onFormatChange,
  onDownload,
  downloadLoading,
}) => {
  const [imgSrc, setImgSrc] = useState(videoInfo.thumbnail);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Card style={{ marginTop: 16 }}>
      {/* 视频基本信息 */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 12 : 16,
          alignItems: isMobile ? 'stretch' : 'center',
        }}
      >
        <img
          src={imgSrc}
          alt={videoInfo.title}
          referrerPolicy="no-referrer"
          onError={() => setImgSrc(FALLBACK_SRC)}
          style={{
            width: isMobile ? '100%' : 200,
            height: isMobile ? 'auto' : 125,
            aspectRatio: '16 / 10',
            objectFit: 'cover',
            borderRadius: 8,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Title level={5} style={{ margin: 0, fontSize: isMobile ? 15 : undefined }}>
            {videoInfo.title}
          </Title>
          <Space size={isMobile ? 8 : 16} wrap style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: isMobile ? 12 : undefined }}>
              <UserOutlined /> {videoInfo.uploader}
            </Text>
            <Text type="secondary" style={{ fontSize: isMobile ? 12 : undefined }}>
              <ClockCircleOutlined /> {formatDuration(videoInfo.duration)}
            </Text>
            <Tag color="blue" style={{ fontSize: isMobile ? 11 : undefined }}>
              {videoInfo.videoId}
            </Tag>
          </Space>
        </div>
      </div>

      <Divider style={{ margin: '16px 0 12px' }} />

      {/* 画质选择 */}
      <FormatSelector
        formats={videoInfo.formats}
        selectedFormat={selectedFormat}
        onFormatChange={onFormatChange}
        onDownload={onDownload}
        downloadLoading={downloadLoading}
      />
    </Card>
  );
};

export default VideoCard;
