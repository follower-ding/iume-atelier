# iume-atelier

A distinctive editorial blog — Josh Comeau–inspired reading + personal writing studio.

**Stack**: React 19 + TypeScript + Tailwind · Spring Boot 3 + MyBatis-Plus · MySQL 8

**Version**: v1.2.2 — see [RELEASE.md](./RELEASE.md) · [v1.1 规划](./docs/v1.1-ROADMAP.md)

## Features

### Reading
- Josh-style layout: sticky TOC, scroll spy, reading progress bar
- Categories: 编程 / AI / 生活 · tag cloud · dark/light theme
- Comments, RSS, sitemap, SEO meta + JSON-LD
- Series `/series` · authors `/authors/:id` · search highlight · page analytics

### Writing
- **Studio** — Markdown editor (write/preview/split), draft/publish, series assignment
- **Console** — admin: users, articles, comments, taxonomy, media, newsletter, series, analytics

### Personalization
- Companion dock: avatar, quotes, ambient music
- Settings: profile, companion, playlist, appearance, security
- Cloud-synced user preferences (cross-device)

### DevOps
- Docker Compose + GitHub Actions CD (GHCR + SSH)
- Playwright E2E · global MCP for AI doc publishing

## Quick Start (Local)

### Prerequisites

- Java 17+, Maven 3.9+
- Node.js 20+
- MySQL 8

### 1. Database

```sql
CREATE DATABASE iume_atelier_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend

```bash
cd iume-atelier-backend
mvn spring-boot:run
```

- API: http://localhost:8080/api
- Swagger: http://localhost:8080/api/swagger-ui.html
- Health: http://localhost:8080/api/health

**Default admin**: `admin` / `admin123`

### 3. Frontend

```bash
cd iume-atelier-frontend
npm install
npm run dev
```

Visit: http://localhost:5173

### One-click start

```powershell
.\start.ps1
```

## Deploy

### PaaS 一键部署（无需自有服务器，推荐先上线）

前端：**Vercel** / **Netlify** / **EdgeOne Pages**  
后端 + MySQL：**Railway**

详见 **[deploy/PAAS-DEPLOY.md](./deploy/PAAS-DEPLOY.md)**（约 15 分钟）  
**新手推荐阅读**：[deploy/PAAS-DEPLOY-BEGINNER-ZH.md](./deploy/PAAS-DEPLOY-BEGINNER-ZH.md)（大白话全流程 + 踩坑 + MCP 发博）

### 自有服务器 CD

See [deploy/AUTO-DEPLOY.md](./deploy/AUTO-DEPLOY.md). Set `APP_VERSION=v1.0.0` in `deploy/.env`.

## Publish docs to blog (MCP)

Global skill: `~/.cursor/skills/iume-atelier-publish/`  
Install: `& "$env:USERPROFILE\.cursor\scripts\install-iume-atelier-blog-mcp.ps1"`

## Project docs

- [PRD](./iume-atelier-PRD.md) · [Tech plan](./iume-atelier-ai-code-plan.md) · [Design system](./design-system/MASTER.md)
