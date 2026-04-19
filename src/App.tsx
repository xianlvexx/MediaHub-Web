import React, { useState, useEffect } from 'react';
import { Layout, Menu, Grid, Drawer, Button, Dropdown, Avatar, Divider, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  VideoCameraOutlined, DownloadOutlined, SettingOutlined, DashboardOutlined,
  MenuOutlined, LogoutOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, LoginOutlined, DownOutlined,
  BgColorsOutlined, GithubOutlined,
} from '@ant-design/icons';
import Home from './pages/Home';
import History from './pages/History';
import Settings from './pages/Settings';
import Monitor from './pages/Monitor';
import LogoRemove from './pages/LogoRemove';
import LoginPage from './pages/AdminLogin';
import Logo from './components/Logo';
import { authStore } from './store/authStore';
import { logout } from './api/auth';

const { Sider, Header, Content } = Layout;
const { useBreakpoint } = Grid;

type PageKey = 'home' | 'history' | 'logoRemove' | 'settings' | 'monitor';

const PAGE_URL_MAP: Record<PageKey, string> = {
  home: '/',
  history: '/history',
  logoRemove: '/logo-remove',
  settings: '/settings',
  monitor: '/monitor',
};

const URL_PAGE_MAP: Record<string, PageKey> = {
  '/': 'home',
  '/history': 'history',
  '/logo-remove': 'logoRemove',
  '/settings': 'settings',
  '/monitor': 'monitor',
};

const isLoginPath = () => ['/admin', '/login'].includes(window.location.pathname);

function getPageFromPath(): PageKey {
  return URL_PAGE_MAP[window.location.pathname] ?? 'home';
}

/** 根据用户名生成稳定的头像背景色 */
function usernameToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 48%)`;
}

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageKey>(getPageFromPath);
  const [user, setUser] = useState(authStore.getUser());
  const [showLogin, setShowLogin] = useState(isLoginPath);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'ADMIN';

  const navigateTo = (page: PageKey) => {
    const url = PAGE_URL_MAP[page];
    window.history.pushState(null, '', url);
    setCurrentPage(page);
  };

  useEffect(() => {
    const onPopState = () => {
      if (isLoginPath()) {
        setShowLogin(true);
      } else {
        setShowLogin(false);
        setCurrentPage(getPageFromPath());
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const handler = () => {
      authStore.clear();
      setUser(null);
      navigateTo('home');
      message.warning('登录已过期，请重新登录');
    };
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, []);

  const goHome = () => {
    window.history.pushState(null, '', '/');
    setShowLogin(false);
  };

  const handleLoginSuccess = () => {
    setUser(authStore.getUser());
    if (authStore.isAdmin()) {
      navigateTo('settings');
      setShowLogin(false);
    } else {
      goHome();
    }
  };

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    authStore.clear();
    setUser(null);
    navigateTo('home');
    message.success('已退出登录');
  };

  if (showLogin) {
    return <LoginPage onSuccess={handleLoginSuccess} onBack={goHome} />;
  }

  const menuItems = [
    { key: 'home',       icon: <VideoCameraOutlined />, label: '视频下载' },
    { key: 'history',    icon: <DownloadOutlined />,    label: '下载历史' },
    { key: 'logoRemove', icon: <BgColorsOutlined />,      label: '水印去除' },
    ...(isAdmin ? [
      { key: 'monitor',  icon: <DashboardOutlined />, label: '系统监控' },
      { key: 'settings', icon: <SettingOutlined />,   label: '系统设置' },
    ] : []),
  ];

  const pageMap: Record<PageKey, React.ReactNode> = {
    home: <Home />, history: <History />, logoRemove: <LogoRemove />,
    settings: <Settings />, monitor: <Monitor />,
  };

  /* 右上角用户控件 */
  const avatarColor = isLoggedIn ? usernameToColor(user.username) : '';
  const avatarLetter = isLoggedIn ? user.username.charAt(0).toUpperCase() : '';

  const githubIcon = (
    <a
      href="https://github.com/xianlvexx/MediaHub"
      target="_blank"
      rel="noopener noreferrer"
      className="header-user-btn"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <GithubOutlined style={{ fontSize: 17, color: '#595959' }} />
      {!isMobile && <span style={{ fontSize: 14, color: '#595959' }}>GitHub</span>}
    </a>
  );

  const userWidget = isLoggedIn ? (
    <Dropdown
      menu={{
        items: [
          { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
        ] as MenuProps['items'],
      }}
      placement="bottomRight"
    >
      <div className="header-user-btn">
        <Avatar size={22} style={{ background: avatarColor, fontSize: 12, fontWeight: 700, flexShrink: 0, cursor: 'pointer' }}>
          {avatarLetter}
        </Avatar>
        {!isMobile && (
          <>
            <span style={{ fontSize: 14, color: '#262626', fontWeight: 500, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.username}
            </span>
            <DownOutlined style={{ fontSize: 10, color: '#8c8c8c' }} />
          </>
        )}
      </div>
    </Dropdown>
  ) : (
    <div
      className="header-user-btn"
      onClick={() => { window.history.pushState(null, '', '/login'); setShowLogin(true); }}
    >
      <LoginOutlined style={{ fontSize: 15, color: '#595959' }} />
      {!isMobile && <span style={{ fontSize: 14, color: '#595959' }}>登录</span>}
    </div>
  );

  // ── 移动端 ──────────────────────────────────────────────────
  if (isMobile) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <div style={styles.mobileHeader}>
          <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
          <Logo size={22} collapsed={false} />
          <div style={{ flex: 1 }} />
          {githubIcon}
          <Divider type="vertical" style={{ height: 20, margin: '0 4px' }} />
          {userWidget}
        </div>
        <Drawer placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}
          width={200} styles={{ body: { padding: 0 } }}>
          <div style={styles.drawerLogo}><Logo size={22} collapsed={false} /></div>
          <Menu mode="inline" selectedKeys={[currentPage]} items={menuItems}
            onClick={({ key }) => { navigateTo(key as PageKey); setDrawerOpen(false); }}
            style={{ borderRight: 0 }} />
        </Drawer>
        <Content style={{ padding: 12, background: '#f0f2f5', flex: 1, overflow: 'auto' }}>
          {pageMap[currentPage]}
        </Content>
      </Layout>
    );
  }

  // ── 桌面端 ──────────────────────────────────────────────────
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}
        style={{ background: '#fff' }} theme="light">
        <div style={styles.siderLogo}>
          <Logo size={26} collapsed={collapsed} />
        </div>
        <Menu mode="inline" selectedKeys={[currentPage]} items={menuItems}
          onClick={({ key }) => navigateTo(key as PageKey)}
          style={{ borderRight: 0 }} />
      </Sider>

      <Layout style={{ background: '#f0f2f5' }}>
        <Header style={styles.header}>
          <div className="header-collapse-btn" onClick={() => setCollapsed(!collapsed)} style={styles.collapseBtn}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <div style={{ flex: 1 }} />
          {githubIcon}
          <Divider type="vertical" style={{ height: 20, margin: '0 4px' }} />
          {userWidget}
        </Header>
        <Content style={{ padding: 24, overflow: 'auto' }}>
          {pageMap[currentPage]}
        </Content>
      </Layout>
    </Layout>
  );
};

const styles = {
  header: {
    height: 48, lineHeight: '48px', background: '#fff',
    padding: '0 16px 0 0', display: 'flex', alignItems: 'center',
    borderBottom: '1px solid #f0f0f0',
    boxShadow: '0 1px 4px rgba(0,21,41,0.06)',
  } as React.CSSProperties,
  collapseBtn: { width: 48, height: 48, fontSize: 16, borderRadius: 0, justifyContent: 'center', padding: 0 } as React.CSSProperties,
  siderLogo: {
    height: 48, display: 'flex', alignItems: 'center',
    justifyContent: 'center', borderBottom: '1px solid #f0f0f0',
  } as React.CSSProperties,
  mobileHeader: {
    height: 48, display: 'flex', alignItems: 'center',
    padding: '0 12px', background: '#fff',
    borderBottom: '1px solid #f0f0f0', flexShrink: 0, gap: 10,
  } as React.CSSProperties,
  drawerLogo: {
    height: 48, display: 'flex', alignItems: 'center',
    justifyContent: 'center', borderBottom: '1px solid #f0f0f0',
  } as React.CSSProperties,
};

export default App;
