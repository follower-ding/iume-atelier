# Release Notes

| Version | Date | Summary |
|---------|------|---------|
| v1.2.1 | 2026-06-06 | PV 埋点（公开路由）、文章编辑器系列关联、文档同步 |
| v1.2.0 | 2026-06-06 | Newsletter、媒体库、专题系列、阅读统计、全文搜索增强、多作者、catalog 单源 Console |
| v1.1.1 | 2026-06-06 | R2 对象存储、文章导入导出、移动端 E2E、首页快捷入口、搜索高亮、RSS discovery |
| v1.1.0 | 2026-06-06 | 独立搜索页、登录错误分级、生产 CORS 默认通配、v1.1 规划文档 |
| v1.0.0 | 2026-06-06 | 首版发布 — Josh 风格阅读体验、Studio/Console 双写作面、陪伴坞、偏好云端同步、SEO/CD 就绪 |

## v1.2.1 — 运营接线补全

- **页面浏览埋点**：`PageViewTracker` 追踪公开路由（`/`, `/series`, `/tools` 等）；文章详情仍由后端 `getBySlug` 写入 `page_views`
- **系列关联编辑**：Console + Studio 文章编辑器支持选择专题系列与系列内排序（`seriesApi.brief`）
- **文档同步**：README / PRD / ROADMAP 更新至 v1.2.x 状态

---

## v1.2.0 — 运营收敛 + 增长能力

### Phase 2

- **Console AI 工具箱**：只读 catalog 预览 + 链到 `iume-ai-catalog` 仓库（消除 DB/前台双轨）
- **catalog CI**：`.github/workflows/catalog-validate.yml`
- **媒体库** `/console/media`：上传记录列表、复制 URL、删除
- **Newsletter**：页脚订阅 + `/console/newsletter` 列表与 CSV 导出
- **首次登录改密**：`must_change_password` 标志 + 设置页强制引导

### Phase 3

- **专题系列** `/series`、`/series/:slug` + Console 管理
- **阅读统计** `/console/analytics`：7 日 PV 趋势、热门文章
- **全文搜索增强**：MySQL FULLTEXT（自然语言模式，LIKE 回退）
- **多作者**：`AUTHOR` 角色 + `/authors/:id` 公开页

### 数据库

- Flyway **V7**：media、newsletter、series、page_views、FULLTEXT 索引

---

## v1.1.1 — 生产稳定性 + 内容体验

### 读者端

- 首页快捷入口：最新文章 / AI 工具箱 / 搜索
- 搜索页关键词高亮（标题与摘要）
- RSS discovery：`<link rel="alternate">`（`index.html` + `PageMeta`）
- 移动端 E2E：底部导航 +「更多」菜单

### 后端 / 存储

- **对象存储抽象**：`FileStorage` + `LocalFileStorage` / `S3FileStorage`（Cloudflare R2 兼容）
- 环境变量：`IUME_STORAGE_TYPE`、`IUME_S3_*` — 见 [deploy/R2-SETUP.md](./deploy/R2-SETUP.md)
- Railway 生产可切换 `IUME_STORAGE_TYPE=s3`，解决上传图片重启丢失

### 运维 / 脚本

- `scripts/export-articles.mjs` — 备份全部文章（含草稿）
- `scripts/import-articles.mjs` — 按 slug  upsert 迁移
- CI 增加 `npm run tool:check` 校验 AI 工具箱 catalog

### 文档

- [deploy/R2-SETUP.md](./deploy/R2-SETUP.md) — R2 配置步骤
- 更新 [docs/v1.1-ROADMAP.md](./docs/v1.1-ROADMAP.md) Phase 0–1 进度

### 下一迭代（v1.1.2 计划）

- Newsletter 订阅
- Console 媒体库
- 首次登录强制改密

---

## v1.1.0 — 生产体验补全

### 读者端

- 独立搜索页 `/search?q=`，顶栏「查看全部结果」跳转搜索页
- 保留 `/articles?q=` 兼容
- **AI 工具箱** `/tools`：MCP / Skills / Prompt / 在线工具，搜索 + 一键复制配置

### 体验优化

- 登录失败分级提示：密码错误 / CORS 被拒绝 / 网络不可用
- API 错误解析支持纯文本响应（如 Spring CORS 403）

### 后端 / 部署

- 生产 CORS 默认允许 `https://*.netlify.app`、`https://*.vercel.app`
- `CorsConfig` 支持 origin pattern 通配

### 文档

- [docs/v1.1-ROADMAP.md](./docs/v1.1-ROADMAP.md) — v1.1 功能规划与上线复盘
- [deploy/PAAS-DEPLOY-BEGINNER-ZH.md](./deploy/PAAS-DEPLOY-BEGINNER-ZH.md)

### 下一迭代（v1.1.1 计划）

- Cloudflare R2 对象存储（PaaS 图片持久化）
- Newsletter 订阅
- Console 媒体库

---

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
