import React from 'react';
import { Typography } from 'antd';
import DownloadHistory from '../../components/DownloadHistory';

const { Title } = Typography;

const History: React.FC = () => {
  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>下载历史</Title>
      <DownloadHistory />
    </div>
  );
};

export default History;
