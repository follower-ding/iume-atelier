# iume-atelier AI Code Plan

> 关联文档：[产品设计 PRD](./iume-atelier-PRD.md) · [设计系统](./design-system/MASTER.md) · [发版记录](./RELEASE.md)

## Architecture

```
iume-atelier/
├── iume-atelier-frontend/   React + Vite + Tailwind
├── iume-atelier-backend/    Spring Boot 3 + MyBatis-Plus
├── deploy/                  Docker + nginx + CI/CD
├── design-system/           UI tokens & MASTER.md
└── scripts/                 Automation
```

## Layer Conventions

### Backend (com.iumeatelier)

| Layer | Responsibility |
|-------|----------------|
| controller | REST endpoints, @Valid input |
| service | Business logic |
| mapper | MyBatis-Plus data access |
| entity | DB models |
| dto | Request/Response with @Schema |
| common | Result<T>, PageResult |
| security | JWT filter, SecurityUtils |

### Frontend (src/)

| Directory | Responsibility |
|-----------|----------------|
| api/ | API call wrappers |
| pages/ | Route-level views |
| components/ | Reusable UI |
| store/ | Zustand state |
| utils/ | request.ts, auth.ts |
| types/ | TypeScript interfaces |

## Development Workflow

1. Backend change → restart → `.\scripts\sync-api-types.ps1`
2. UI change → follow `design-system/MASTER.md`
3. Before push → `.\scripts\check-secrets.ps1` + update `RELEASE.md`
4. Merge to main → CD auto-deploys

## Phase 2 Ideas

- Multi-author collaboration & permissions
- Media library with image upload
- Newsletter subscription
- Full-text search with Elasticsearch
- Markdown editor with live preview
