# MediaHub Web

**[English](#english) | [中文](#中文)**

---

<a id="english"></a>

The frontend of [MediaHub](../MediaHub) — a self-hosted video download and image processing service.

## Features

- Paste a video URL to parse title, thumbnail, and quality options, then download
- Real-time download progress, speed, and ETA via SSE
- Task history with re-download support
- Admin panel: cookie management, user accounts, system monitor

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| UI | Ant Design 5 |
| State | Zustand |

## Quick Start

```bash
npm install
npm run dev   # http://localhost:5173  (/api proxied to localhost:8080)
npm run build # Production build
```

> The backend must be running first. See [MediaHub](../MediaHub) for setup instructions.

## License

[MIT License](LICENSE) © 2025 xlvexx

---

<a id="中文"></a>

# MediaHub Web

**[English](#english) | [中文](#中文)**

[MediaHub](../MediaHub) 的前端页面，提供视频下载与图像处理的 Web 操作界面。

## 核心功能

- 粘贴视频链接，解析标题、封面与画质，按需下载
- 通过 SSE 实时展示下载进度、速度与剩余时间
- 任务历史记录，支持重复下载
- 管理后台：Cookie 管理、用户账户、系统监控

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 5 |
| UI | Ant Design 5 |
| 状态 | Zustand |

## 快速开始

```bash
npm install
npm run dev   # http://localhost:5173  (/api 代理至 localhost:8080)
npm run build # 生产构建
```

> 需先启动后端服务，参见 [MediaHub](../MediaHub)。

## 开源协议

本项目基于 [MIT License](LICENSE) 开源。
