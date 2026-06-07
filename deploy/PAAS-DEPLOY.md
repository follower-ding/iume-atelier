# iume-atelier PaaS 一键部署（无需自有服务器）

> **架构**：前端 → Vercel / Netlify / EdgeOne Pages · 后端+MySQL → Railway  
> Vercel/Netlify/EdgeOne 只能托管静态前端；Spring Boot + MySQL 需 Railway 等 PaaS。

---

## 总览（约 15 分钟）

```
┌─────────────────┐     /api 反代      ┌──────────────────┐
│ Vercel/Netlify  │ ─────────────────► │ Railway          │
│ EdgeOne Pages   │                    │ Spring Boot + MySQL│
└─────────────────┘                    └──────────────────┘
```

| 步骤 | 平台 | 费用 |
|------|------|------|
| 1 | Railway：后端 + MySQL | 免费额度约 $5/月 |
| 2 | Vercel / Netlify / EdgeOne：前端 | 免费 |

---

## 第一步：Railway 部署后端 + 数据库

1. 打开 [railway.app](https://railway.app) → **Login with GitHub**
2. **New Project** → **Deploy from GitHub repo** → 选择 `follower-ding/iume-atelier`
3. 在同一 Project 内 **Add Service** → **Database** → **MySQL**
4. 选中 **backend 服务** → **Variables**，添加：

```env
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=true&requireSSL=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=${{MySQL.MYSQLUSER}}
SPRING_DATASOURCE_PASSWORD=${{MySQL.MYSQLPASSWORD}}
IUME_JWT_SECRET=请替换为至少32位随机字符串
IUME_APP_VERSION=1.0.0
IUME_SITE_URL=https://你的前端域名
IUME_CORS_ORIGINS=https://你的前端域名
```

5. **Settings** → **Networking** → **Generate Domain**  
   得到类似：`https://iume-atelier-backend-production-xxxx.up.railway.app`

6. 验证：`https://你的后端域名/api/health` → `{"status":"UP","version":"1.0.0"}`

> Railway 使用 `railway.toml` + `deploy/Dockerfile.backend` 自动构建。

---

## 第二步 A：Vercel 部署前端（推荐）

1. [vercel.com](https://vercel.com) → **Add New Project** → 导入 GitHub 仓库
2. **Root Directory** 设为：`iume-atelier-frontend`
3. Framework Preset：**Vite**（自动识别）
4. 编辑仓库内 `iume-atelier-frontend/vercel.json`，将  
   `REPLACE_WITH_RAILWAY_BACKEND_URL` 换成 Railway 后端域名（**不含** `/api` 路径）  
   例如：`iume-atelier-backend-production-xxxx.up.railway.app`
5. **Deploy**

访问 Vercel 域名即可。`/api/*` 由 Vercel 反代到 Railway，无需额外 CORS 配置。

---

## 第二步 B：Netlify 部署前端

1. [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. **Base directory**：留空（使用根目录 `netlify.toml`）
3. 编辑 `netlify.toml` 中 `REPLACE_WITH_RAILWAY_BACKEND_URL`
4. Deploy

---

## 第二步 C：EdgeOne Pages 部署前端（腾讯云）

1. 登录 [腾讯云 EdgeOne 控制台](https://console.cloud.tencent.com/edgeone) → **Pages**
2. **新建项目** → 关联 GitHub 仓库 `iume-atelier`
3. 构建设置（参考 `deploy/edgeone-pages.yaml`）：
   - 安装：`cd iume-atelier-frontend && npm ci`
   - 构建：`cd iume-atelier-frontend && npm run build`
   - 输出目录：`iume-atelier-frontend/dist`
4. **路由规则**（控制台）：
   - `/api/*` → 反向代理 → `https://你的Railway后端/api/$1`
   - `/*` → `/index.html`（200，SPA）
5. 后端 `IUME_CORS_ORIGINS` 加入 EdgeOne 分配的域名

---

## 环境变量速查

### Railway（后端）

| 变量 | 示例 |
|------|------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_DATASOURCE_URL` | 见上文 MySQL 引用 |
| `IUME_JWT_SECRET` | 随机长字符串 |
| `IUME_CORS_ORIGINS` | 前端完整 URL，逗号分隔 |
| `IUME_SITE_URL` | 前端 URL（RSS/sitemap 用） |
| `IUME_STORAGE_TYPE` | `local`（默认）或 `s3` |
| `IUME_S3_*` | R2 配置，见 [R2-SETUP.md](./R2-SETUP.md) |

### 文章迁移

```bash
# 导出（含草稿）
IUME_API_BASE=https://你的后端/api node scripts/export-articles.mjs

# 导入到生产（按 slug upsert）
IUME_API_BASE=https://你的后端/api node scripts/import-articles.mjs scripts/backup/articles-2026-06-06.json
```

### Git push（443 受限时）

```bash
node scripts/push-via-gh-api.mjs HEAD [parentSha]
```

### 前端（仅直连模式需要）

若平台**不支持** `/api` 反代，在平台环境变量设：

```env
VITE_API_BASE=https://你的后端.railway.app/api
```

并在 Railway 的 `IUME_CORS_ORIGINS` 加入前端域名。

---

## 一键脚本（本地预检）

```powershell
# 替换后端 URL 并写入各平台配置
.\deploy\scripts\setup-paas-urls.ps1 -BackendUrl "iume-atelier-backend-production-xxxx.up.railway.app"
```

---

## 已知限制（PaaS 演示环境）

| 项 | 说明 |
|----|------|
| 上传文件 | Railway 磁盘非持久，重启后 uploads 丢失 → v1.1 接对象存储 |
| 冷启动 | Railway 免费档闲置后首次请求较慢 |
| 自定义域名 | 各平台控制台均可绑定自己的域名 |

---

## 故障排查

| 现象 | 处理 |
|------|------|
| 前端 API 404 | 检查 vercel.json / netlify.toml 中后端 URL |
| CORS 错误 | 更新 Railway `IUME_CORS_ORIGINS` |
| 后端 502 | Railway 日志查看 Flyway/MySQL 连接 |
| 登录失败 | 确认 JWT_SECRET 已设置且后端已启动完成 |

---

## 与自有服务器 CD 的关系

- **PaaS 方案**：本指南，适合先上线演示
- **生产 CD**：见 [AUTO-DEPLOY.md](./AUTO-DEPLOY.md)（GitHub Actions + 自有 VPS）

两者可并行：演示用 Vercel+Railway，正式流量切到 VPS。
