# iume-atelier 产品设计文档（PRD）

> 最后更新：2026-06-06 | 当前进度：**v1.2.1** | 版本目标：**v1.3.0**
>
> 关联：[技术规划](./iume-atelier-ai-code-plan.md) · [设计系统](./design-system/MASTER.md) · [发版记录](./RELEASE.md)

---

## 1. 产品概述

**一句话**：iume 的个人写作工作室 — 优雅地写作、发布与分享。

**愿景**：打造一个属于 iume 的线上文字空间，兼顾阅读美感与写作效率，可持续迭代为多人协作内容平台。

**项目类型**：博客 / 内容站 | **规模**：中型

**技术栈**：React 19 + Spring Boot 3 + MySQL 8 | **仓库**：follower-ding/iume-atelier

---

## 2. 目标用户

| Persona | 描述 | 核心诉求 |
|---------|------|----------|
| **iume（作者）** | 项目主人，主要写作与管理者 | 高效写 Markdown、管理文章、看数据 |
| **读者** | 访问公开页面的访客 | 舒适阅读、搜索、订阅更新 |

---

## 3. 功能清单与进度

### P0 — v1.0 必须

| 状态 | 功能 | 说明 | 页面/模块 |
|------|------|------|-----------|
| [x] | 用户登录 | JWT + refresh | `/login` |
| [x] | 文章 CRUD | Markdown 编写、草稿/发布 | `/studio` |
| [x] | 文章列表与详情 | 公开阅读 + TOC | `/` `/article/:slug` |
| [x] | 标签分类 | 大类 + 标签 | 前台 + Console taxonomy |
| [x] | 健康检查 | CD 部署探活 | `/api/health` |
| [x] | GitHub CD | push main 自动部署 | deploy/ |
| [x] | 评论 | 登录用户评论 | 文章详情页 |
| [x] | 搜索 | NavSearch + `/search` | SiteHeader + SearchPage | [x] |
| [x] | RSS | 订阅源 | `/api/rss` + Footer |

### P1 — v1.0 应有

| 状态 | 功能 | 说明 |
|------|------|------|
| [x] | SEO 优化 | sitemap、meta、JSON-LD、robots |
| [x] | 多用户/权限 | USER / ADMIN，Console 后台 |
| [x] | Markdown 实时预览 | Studio 分屏编辑器 |
| [x] | E2E 测试 | Playwright 多场景 |
| [x] | API 类型同步 | sync-api-types.ps1 |

### P1+ — v1.0 额外交付

| 状态 | 功能 | 说明 |
|------|------|------|
| [x] | 陪伴坞 | 头像、鼓励语、音乐 |
| [x] | 设置页 | 五分区 + 云端偏好同步 |
| [x] | 分类中文化 | 编程 / AI / 生活 |
| [x] | 全局 MCP 发博客 | iume-atelier-publish skill |

### P2 — 后续版本（v1.1+）

| 版本 | 功能 | 说明 |
|------|------|------|
| v1.1 | 独立搜索页 | `/search` 路由 | [x] |
| v1.1 | 登录错误提示 | CORS/网络/密码分级 | [x] |
| v1.1 | 生产 CORS 默认 | Netlify/Vercel 通配 | [x] |
| v1.1 | Newsletter | 邮箱收集 + Console 导出 | [x] |
| v1.1 | 媒体库 | 图片统一管理 | [x] |
| v1.1 | 首次登录改密 | admin 强制改密 | [x] |
| v1.1 | 对象存储 R2 | PaaS 上传持久化 | [x] |
| v1.1 | 文章导入导出 | export/import 脚本 | [x] |
| v1.1 | 首页快捷入口 | 文章/工具/搜索 | [x] |
| v1.1 | 搜索高亮 | 关键词 mark | [x] |
| v1.1 | 移动端 E2E | 底部导航 + 更多菜单 | [x] |
| v1.2 | 全文搜索 | MySQL FULLTEXT + LIKE 回退 | [x] |
| v1.2 | 专题系列 | `/series` + Console 管理 | [x] |
| v1.2 | 阅读统计 | PV 趋势 + 热门文章 | [x] |
| v1.2 | 多作者轻量 | AUTHOR 角色 + 作者页 | [x] |
| v1.2.1 | 系列编辑接线 | Studio/Console 选择系列 | [x] |
| v1.2.1 | 公开路由 PV 埋点 | PageViewTracker | [x] |
| v1.3 | Newsletter 发信 | Resend / Mailgun 等 | [ ] |
| v2.0 | 多作者协作 | 审核流、作者工作台 | [ ] |

---

## 4. 页面清单

| 页面 | 路由 | 权限 | 状态 |
|------|------|------|------|
| 首页 | `/` | 公开 | [x] |
| 文章列表 | `/articles` | 公开 | [x] |
| 文章详情 | `/article/:slug` | 公开 | [x] |
| 登录/注册 | `/login` `/register` | 公开 | [x] |
| Studio 写作台 | `/studio` | 登录 | [x] |
| Console 后台 | `/console` | ADMIN | [x] |
| 设置 | `/settings` | 登录 | [x] |
| 搜索 | `/search` | 公开 | [x] |
| 专题系列 | `/series` `/series/:slug` | 公开 | [x] |
| 作者页 | `/authors/:id` | 公开 | [x] |
| 媒体库 | `/console/media` | ADMIN | [x] |
| Newsletter | `/console/newsletter` | ADMIN | [x] |
| 阅读统计 | `/console/analytics` | ADMIN | [x] |
| 关于/项目/工具 | `/about` 等 | 公开 | [x] |

---

## 5. 里程碑

| 里程碑 | 目标 | 交付标准 | 状态 |
|--------|------|----------|------|
| **v1.0.0 MVP** | 2026-06 | P0+P1 全部完成，可上线 | **[x] 已发布** |
| **v1.1.x** | 2026-06 | 搜索/R2/导入导出/体验补全 | **[x] 已发布** |
| **v1.2.x** | 2026-06 | 运营能力（系列/统计/Newsletter） | **[x] 已发布** |
| v1.3.0 | 2026-Q3 | Newsletter 发信 + 内容矩阵 + 性能基线 | [ ] |

---

## 6. 进度总览

| 类别 | 完成 | 总计 | 进度 |
|------|------|------|------|
| P0 功能 | 9 | 9 | 100% |
| P1 功能 | 5 | 5 | 100% |
| 页面 | 8 | 8 | 100% |
| **综合** | — | — | **100%（v1.0 范围）** |

---

## 7. 非功能需求

- [x] 响应式布局
- [x] `/api/health` + APP_VERSION
- [x] SEO 完整（sitemap/meta/JSON-LD/RSS）
- [x] Docker + GitHub CD
- [x] E2E 自动化测试
- [~] 首屏加载 < 3s（待生产环境实测）

---

## 8. 变更记录

| 日期 | 变更 | 作者 |
|------|------|------|
| 2026-06-06 | 初稿 | AI |
| 2026-06-06 | **v1.0.0 发布**：TOC、陪伴坞、Console、偏好同步、分类中文化 | AI |

---

## 9. 下一步行动（v1.3.0）

1. ~~v1.2 运营功能开发~~ ✅
2. ~~系列编辑接线 + 公开路由 PV 埋点~~ ✅（v1.2.1）
3. Railway 生产部署 v1.2 + 配置 R2 + 导入文章
4. Newsletter 发信 MVP（新文通知）
5. 首批专题系列内容上线
6. Lighthouse 首屏性能基线

详见 [docs/v1.1-ROADMAP.md](./docs/v1.1-ROADMAP.md)
