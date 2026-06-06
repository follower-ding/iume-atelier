# Release Notes

| Version | Date | Summary |
|---------|------|---------|
| v1.0.0 | 2026-06-06 | 首版发布 — Josh 风格阅读体验、Studio/Console 双写作面、陪伴坞、偏好云端同步、SEO/CD 就绪 |

## v1.0.0 — 首版发布

### 读者端

- Josh Comeau 风格文章排版：窄栏正文、右侧 sticky 目录、滚动高亮、阅读进度条
- 手机端横向 TOC chips
- 首页三栏布局：分类胶囊（编程 / AI / 生活）、标签云、热门/最新
- 文章详情：Markdown 渲染、代码高亮、GFM 表格、相关文章、评论
- 深色/浅色主题、简洁模式、UI 音效
- SEO：PageMeta、JSON-LD、sitemap.xml、robots.txt、RSS

### 作者端

- **Studio** 写作台：Markdown 编辑器（写/预览/分屏）、草稿/发布、封面与图片上传
- **Console** 管理后台：用户/文章/评论/分类标签/审计日志
- JWT 双令牌鉴权 + 无感 refresh

### 个性化

- 陪伴坞：可拖动头像、鼓励语、环境音/音乐播放器
- 设置页五分区：资料、陪伴个性、歌单、外观、安全
- 用户偏好云端同步（`users.preferences` JSON + V4 迁移）
- 写作台/设置页自动隐藏陪伴坞

### 后端

- Spring Boot 3.3 + MyBatis-Plus + MySQL 8
- Flyway V1–V5：审计日志、偏好字段、分类中文化（编程/AI/生活）
- 文章 CRUD、分类标签、评论、图片/音频上传
- OpenAPI / Swagger、统一 Result 响应

### 测试与工具

- Playwright E2E：auth、home、studio、companion、console
- 全局 MCP + Skill：`blog_publish_article` 一键发博客
- `scripts/check-secrets.ps1`、`scripts/sync-api-types.ps1`

### 部署

- Docker Compose + GitHub Actions CD（GHCR + SSH）
- `APP_VERSION=v1.0.0`，`/api/health` 可核对版本

### 已知限制（v1.1 计划）

- 独立搜索页路由（当前为 NavSearch 内嵌）
- Newsletter 订阅
- PRD 中 Elasticsearch 全文检索

---

## 升级说明

从 baseline 升级需执行 Flyway 迁移至 V5。若曾修改 V1 迁移文件导致 checksum 失败，还原 V1 并依赖 V5 UPDATE，详见博客系列文章「Flyway 踩坑记」。
