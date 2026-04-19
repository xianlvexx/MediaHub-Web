import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#6366f1', colorLink: '#6366f1', colorLinkHover: '#818cf8', colorLinkActive: '#4f46e5' } }}>
        <App />
      </ConfigProvider>
    </HelmetProvider>
  </React.StrictMode>
);
