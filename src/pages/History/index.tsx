import React from 'react';
import { Typography } from 'antd';
import DownloadHistory from '../../components/DownloadHistory';
import SEO from '../../components/SEO';

const { Title } = Typography;

const History: React.FC = () => {
  return (
    <div>
      <SEO
        title="下载历史"
        description="查看你的视频下载任务历史记录。"
        canonical="/history"
        noindex
      />
      <Title level={4} style={{ marginBottom: 24 }}>下载历史</Title>
      <DownloadHistory />
    </div>
  );
};

export default History;
