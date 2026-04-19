# MediaHub Web

[MediaHub](https://github.com/xianlvexx/MediaHub) 的前端页面，提供视频下载与图像处理的 Web 操作界面。

[English Documentation](README.md)

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
npm run dev   # http://localhost:5173  (/api proxied to localhost:8080)
npm run build # Production build
```
> 需先启动后端服务，参见 [MediaHub](https://github.com/xianlvexx/MediaHub)。

## 开源协议

本项目基于 [MIT License](LICENSE) 开源。
