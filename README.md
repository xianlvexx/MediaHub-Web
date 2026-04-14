<div align="center">

# VidSilo

**自托管视频下载服务 · Self-hosted Video Downloader**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ed.svg)](https://docs.docker.com/compose/)

粘贴链接，选择画质，一键下载。部署在自己的服务器上，数据完全自主掌控。

[快速开始](#快速开始) · [功能特性](#功能特性) · [配置说明](#配置说明) · [开发指南](#开发指南)

</div>

---

## 功能特性

- **视频解析与下载** — 粘贴视频链接，自动解析标题、封面、画质列表，按需选择格式下载
- **实时进度推送** — 基于 SSE（Server-Sent Events）实时展示下载进度、速度与预计剩余时间
- **下载历史管理** — 完整的任务历史记录，支持分页查询与文件重复下载
- **自动文件清理** — 下载完成后按配置时长自动清理本地文件，节省磁盘空间
- **管理员后台** — Cookie 上传管理、用户账户管理
- **系统监控面板** — 实时查看 CPU、内存、磁盘、JVM 使用率与任务统计
- **解析速率限制** — 未登录用户按 IP 限流，保护服务稳定性
- **一键 Docker 部署** — 三个容器，一条命令，开箱即用

## 快速开始

### 一键启动

```bash
# 克隆仓库
git clone https://github.com/your-username/media-hub.git
cd media-hub

# 配置环境变量（见下方说明）
cp .env.example .env

# 启动全部服务
docker compose up -d --build
```

启动完成后，打开浏览器访问 `http://localhost` 即可使用。

默认管理员账户请在首次启动后通过数据库或 API 自行创建。

### 环境变量

在项目根目录创建 `.env` 文件（可复制 `.env.example`）：

```dotenv
# 数据库配置
DB_USERNAME=mediahub_user
DB_PASSWORD=your_strong_password

# MySQL root 密码
MYSQL_ROOT_PASSWORD=your_root_password
```

## 配置说明

后端配置文件位于 `media-hub-server/src/main/resources/application.yml`，支持通过环境变量覆盖。

| 配置项 | 环境变量 | 默认值 | 说明 |
|---|---|---|---|
| `spring.datasource.url` | `DB_URL` | `jdbc:mysql://127.0.0.1:3306/media_hub` | 数据库连接地址 |
| `spring.datasource.username` | `DB_USERNAME` | `root` | 数据库用户名 |
| `spring.datasource.password` | `DB_PASSWORD` | _(空)_ | 数据库密码 |
| `app.ytdlp.path` | — | `/usr/local/bin/yt-dlp` | yt-dlp 可执行文件路径 |
| `app.ytdlp.cookies-file` | — | `/home/video/cookies.txt` | 视频网站Cookie 文件路径 |
| `app.download.dir` | `APP_DOWNLOAD_DIR` | `/home/video/downloads` | 视频下载存储目录 |
| `app.cleanup.file-retain-hours` | — | `168` | 文件保留时长（小时），超时自动删除 |
| `app.cache.video-info-ttl-minutes` | — | `60` | 视频信息缓存有效期（分钟） |
| `app.rate-limit.parse-per-ip-per-minute` | — | `3` | 未登录用户每分钟解析次数上限 |

## 开发指南

### 后端

```bash
cd media-hub-server

# 本地需要一个运行中的 MySQL，并提前创建 media_hub 数据库
# 执行 doc/sql/init.sql 初始化表结构

# 设置环境变量后启动
export DB_PASSWORD=your_password
mvn spring-boot:run
```

后端默认运行在 `http://localhost:8080`。

### 前端

```bash
cd media-hub-web
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`，已配置代理将 `/api` 转发至后端。

### 项目结构

```
media-hub/
├── media-hub-server/          # Spring Boot 后端
│   └── src/main/java/cn/xlvexx/media-hub/
│       ├── auth/            # 认证与 Token 管理
│       ├── config/          # 配置类
│       ├── controller/      # REST API 控制器
│       ├── dto/             # 请求/响应数据传输对象
│       ├── entity/          # 数据库实体
│       ├── manager/         # 数据库操作层
│       ├── service/         # 业务逻辑
│       ├── executor/        # yt-dlp 进程调用
│       └── scheduler/       # 定时任务
├── media-hub-web/             # React 前端
│   └── src/
│       ├── pages/           # 页面组件
│       ├── components/      # 通用组件
│       ├── api/             # API 请求封装
│       └── store/           # Zustand 状态管理
├── doc/
│   └── sql/init.sql         # 数据库初始化脚本
└── docker-compose.yml
```

## Cookie 配置（可选）

部分高画质视频需要登录视频网站才能下载。你可以通过以下步骤配置 Cookie：

1. 使用浏览器插件（如 [cookies.txt](https://chromewebstore.google.com/detail/cookies-txt/njabckikapfpffapmjgojcnbfjonfjfg)）导出视频网站站的 `cookies.txt`
2. 登录管理员后台 → 设置 → Cookie 管理，上传文件
3. 服务器会将 Cookie 传递给 yt-dlp，以解锁高画质下载

## 常见问题

**Q: 支持哪些视频平台？**
取决于你服务器上 yt-dlp 版本所支持的平台。项目本身无平台限制，URL 校验规则可按需修改。

**Q: 下载完成后文件在哪里？**
文件存储在 `app.download.dir` 指定的目录中，通过 `/api/tasks/{taskId}/file` 下载后，会在 `file-retain-hours` 小时后自动清理。

**Q: 如何修改并发下载数量？**
修改 `application.yml` 中的 `app.download.max-concurrent`（同时运行的任务数）和 `app.download.queue-capacity`（等待队列大小）。

## Contributing

欢迎提交 Issue 和 Pull Request。提交 PR 前请确保：

1. 代码风格与现有代码保持一致
2. 涉及后端改动已通过本地编译（`mvn clean package`）
3. 涉及前端改动已通过类型检查（`npm run build`）

## License

[MIT License](LICENSE) © 2025 xlvexx
