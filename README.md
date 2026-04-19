# MediaHub Web

The frontend of [MediaHub](https://github.com/xianlvexx/MediaHub) — a self-hosted video download and image processing service.

[中文文档](README.zh-CN.md)

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