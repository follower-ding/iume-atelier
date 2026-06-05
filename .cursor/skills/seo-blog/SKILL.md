---
name: seo-blog
description: >-
  博客/内容站 SEO 专项。创建博客项目、用户说 SEO/sitemap/RSS/meta 时使用。
  项目类型含「博客、写作、内容站」时自动启用。
---

# 博客 SEO（seo-blog）

## 自动启用条件

项目用途含：博客、写作、内容、资讯、文章 → **无需询问，自动挂载**。

## 新项目必生成

### 后端
- `GET /api/rss`（已有则跳过）
- `GET /api/sitemap.xml` 或静态 `public/sitemap.xml` 生成脚本

### 前端 `public/`
- `robots.txt`
- `sitemap.xml`（或构建时生成）

### 前端 SEO 组件 `src/components/seo/`
- `PageMeta.tsx` — title、description、og:image、canonical
- 文章详情页注入 JSON-LD `Article` 结构化数据

### 每页 meta 最低要求

| 页面 | title | description | og |
|------|-------|-------------|-----|
| 首页 | 站名 + slogan | 站点简介 | ✓ |
| 文章 | 文章标题 | 摘要前 160 字 | ✓ + 封面图 |
| 列表 | 文章列表 | 分类描述 | ✓ |

## 博客专用路由

- `/rss` 或链接到 `/api/rss`
- footer 放 RSS 订阅入口

## 与 ui-ux-pro-max 配合

博客默认风格关键词：`elegant editorial minimal writing`

## 禁止

- 禁止博客项目无 meta / 无 sitemap
- 禁止 SPA 所有页面同一 title
