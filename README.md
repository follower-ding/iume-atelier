# iume-atelier

A distinctive editorial blog — Swiss modernism meets personal writing.

**Stack**: React 18 + TypeScript + Tailwind · Spring Boot 3 + MyBatis-Plus · MySQL 8

## Features

- Editorial magazine layout with Libre Bodoni + Public Sans typography
- Dark / light theme toggle
- Reading progress bar & auto-generated table of contents
- Articles, categories, tags, full-text search
- Comments, RSS feed, sitemap, SEO meta + JSON-LD
- Admin studio with draft / publish workflow
- Docker Compose deployment + GitHub Actions CD

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
# Edit src/main/resources/application-dev.yml if needed
mvn spring-boot:run
```

API: http://localhost:8080/api  
Swagger: http://localhost:8080/api/swagger-ui.html  
Health: http://localhost:8080/api/health

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

See [deploy/AUTO-DEPLOY.md](deploy/AUTO-DEPLOY.md)

Deploy path: `/opt/iume-atelier/deploy` on `49.235.172.214`

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/sync-api-types.ps1` | Sync OpenAPI → frontend TS types |
| `scripts/check-secrets.ps1` | Pre-push secrets scan |
| `scripts/github-push.ps1` | Init git + push to GitHub |

## Design System

See [design-system/MASTER.md](design-system/MASTER.md)
