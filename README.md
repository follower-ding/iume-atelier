# iume-atelier

iume 的写作工作室 — React + Spring Boot 博客。

## 技术栈

- 前端：React 18 + TypeScript + Vite
- 后端：Spring Boot 3 + MyBatis + JWT
- 数据库：MySQL
- 部署：Docker Compose + GitHub Actions CD

## 本地启动

### 数据库

```bash
mysql -u root -p < iume-atelier-backend/sql/init-mysql.sql
```

### 后端

```bash
cd iume-atelier-backend
mvn spring-boot:run
```

### 前端

```bash
cd iume-atelier-frontend
npm install
npm run dev
```

访问 http://localhost:5173

默认账号：`admin` / `admin123`

## GitHub CD

1. 复制 `deploy/repo.env.example` → `deploy/repo.env`
2. 服务器配置 `deploy/.env`
3. 配置 GitHub Secrets：`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH`, `GHCR_READ_TOKEN`
4. `git push origin main` 触发自动部署

## 健康检查

`GET /api/health` → `{ "status": "UP", "version": "1.0.0" }`
