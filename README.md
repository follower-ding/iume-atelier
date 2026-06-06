# iume-atelier

A distinctive editorial blog — Josh Comeau–inspired reading + personal writing studio.

**Stack**: React 19 + TypeScript + Tailwind · Spring Boot 3 + MyBatis-Plus · MySQL 8

**Version**: v1.0.0 — see [RELEASE.md](./RELEASE.md)

## Features

### Reading
- Josh-style layout: sticky TOC, scroll spy, reading progress bar
- Categories: 编程 / AI / 生活 · tag cloud · dark/light theme
- Comments, RSS, sitemap, SEO meta + JSON-LD

### Writing
- **Studio** — Markdown editor (write/preview/split), draft/publish
- **Console** — admin: users, articles, comments, taxonomy, audit logs

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

See [deploy/AUTO-DEPLOY.md](./deploy/AUTO-DEPLOY.md). Set `APP_VERSION=v1.0.0` in `deploy/.env`.

## Publish docs to blog (MCP)

Global skill: `~/.cursor/skills/iume-atelier-publish/`  
Install: `& "$env:USERPROFILE\.cursor\scripts\install-iume-atelier-blog-mcp.ps1"`

## Project docs

- [PRD](./iume-atelier-PRD.md) · [Tech plan](./iume-atelier-ai-code-plan.md) · [Design system](./design-system/MASTER.md)
