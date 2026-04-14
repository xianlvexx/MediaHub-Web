import React from 'react';
import { Card, Tabs, Grid, Typography } from 'antd';
import { FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import CookieSettings from './CookieSettings';
import UserManagement from './UserManagement';

const { useBreakpoint } = Grid;

const Settings: React.FC = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const tabItems = [
    {
      key: 'cookie',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <FileTextOutlined />
          {isMobile ? 'Cookie' : 'Cookie 管理'}
        </span>
      ),
      children: <CookieSettings />,
    },
    {
      key: 'users',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <TeamOutlined />
          {isMobile ? '用户' : '用户管理'}
        </span>
      ),
      children: <UserManagement />,
    },
  ];

  return (
    <div>
      <Typography.Title level={4} style={{ margin: '0 0 16px' }}>系统设置</Typography.Title>
      <Card styles={{ body: { padding: 0 } }}>
        <Tabs
          tabPosition={isMobile ? 'top' : 'left'}
          items={tabItems}
          style={{ minHeight: 400 }}
          tabBarStyle={isMobile
            ? { margin: 0 }
            : { width: 160, marginRight: 0, paddingTop: 8 }}
        />
      </Card>
    </div>
  );
};

export default Settings;
