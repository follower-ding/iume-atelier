# 全栈架构选型：React + Spring Boot 博客系统搭建

> 本篇是 **iume-atelier 技术系列** 第一篇，从架构视角讲清楚：技术栈怎么选、项目怎么分层、API 怎么设计。

## 一、整体架构

```
┌─────────────────────────────────────────────────┐
│                   浏览器                         │
│  React 19 + Vite + Tailwind + Zustand           │
│  http://localhost:5173                          │
└──────────────────┬──────────────────────────────┘
                   │ /api/* (Vite proxy)
                   ▼
┌─────────────────────────────────────────────────┐
│              Spring Boot 3.3.5                   │
│  context-path: /api  │  port: 8080              │
│  Security + JWT │ Controllers │ Services        │
└──────────────────┬──────────────────────────────┘
                   │ JDBC
                   ▼
┌─────────────────────────────────────────────────┐
│              MySQL 8 + Flyway                    │
│  iume_atelier_db                                │
└─────────────────────────────────────────────────┘
```

## 二、前端架构

### 2.1 目录结构

```
iume-atelier-frontend/src/
├── api/index.ts          # 所有 API 封装
├── routes/index.tsx      # 路由 + 权限守卫
├── layouts/              # AppLayout, ConsoleLayout
├── pages/                # 页面组件
├── components/
│   ├── common/           # TOC, Markdown, Header
│   ├── business/         # ArticleCard, BlogSidebar
│   ├── companion/        # 陪伴坞
│   └── seo/              # PageMeta, JSON-LD
├── store/                # Zustand 状态
├── hooks/                # 自定义 hooks
└── utils/                # request, auth, categories
```

### 2.2 状态管理

使用 Zustand（轻量、无 boilerplate）：

| Store | 职责 |
|-------|------|
| `useAuthStore` | 登录态、用户信息 |
| `useThemeStore` | 深色/浅色主题 |
| `useCompanionStore` | 陪伴坞状态、鼓励语 |
| `useMusicStore` | 音乐播放状态 |
| `useUserPrefsStore` | 用户偏好（本地 + 云端） |

### 2.3 API 请求层

`utils/request.ts` 封装 axios：

- 自动附加 `Authorization: Bearer <token>`
- 401 时自动 refresh token（队列机制，避免并发刷新）
- 统一解包 `Result<T>` 响应格式

开发环境 Vite 代理 `/api` → `http://localhost:8080`，生产环境 nginx 反代。

## 三、后端架构

### 3.1 分层结构

```
com.iumeatelier/
├── controller/     # REST 接口（@Valid 校验）
├── service/        # 业务逻辑
├── mapper/         # MyBatis-Plus 数据访问
├── entity/         # 数据库实体
├── dto/            # Request / Response DTO
├── common/         # Result<T>, PageResult
├── security/       # JwtFilter, SecurityUtils
└── config/         # SecurityConfig, OpenApiConfig
```

### 3.2 核心 API 一览

| 模块 | 方法 | 路径 | 权限 |
|------|------|------|------|
| 认证 | POST | `/auth/login` | 公开 |
| 认证 | POST | `/auth/register` | 公开 |
| 文章 | GET | `/articles` | 公开（仅已发布） |
| 文章 | POST | `/articles` | 登录 |
| 文章 | PUT | `/articles/{id}` | 作者或 ADMIN |
| 分类 | GET | `/categories` | 公开 |
| 上传 | POST | `/upload/image` | 登录 |
| 偏好 | PUT | `/users/me/preferences` | 登录 |
| SEO | GET | `/rss`, `/sitemap.xml` | 公开 |

### 3.3 统一响应格式

```java
public class Result<T> {
    private int code;       // 200 = 成功
    private String message;
    private T data;
}
```

分页列表使用 `PageResult<T>`，包含 `records`、`total`、`page`、`size`。

### 3.4 安全模型

```java
// SecurityConfig.java — 公开路径
private static final String[] PUBLIC_GET_PATHS = {
    "/health", "/rss", "/sitemap.xml", "/robots.txt",
    "/uploads/**", "/swagger-ui/**"
};

// GET 文章/分类/标签/评论 → permitAll
// POST 注册/登录/刷新 → permitAll
// 其余 → authenticated（需 JWT）
```

JWT 配置：`application.yml` 中 access token 24h、refresh token 7d。

## 四、数据库设计

### 4.1 核心表

| 表 | 用途 |
|----|------|
| `users` | 用户（含 preferences JSON 字段） |
| `articles` | 文章（Markdown 正文、状态、软删除） |
| `categories` | 大类 |
| `tags` | 标签 |
| `article_tags` | 文章-标签多对多 |
| `comments` | 评论 |
| `admin_audit_logs` | 管理操作审计 |

### 4.2 Flyway 迁移

```
db/migration/
├── V1__init.sql              # 建表 + 种子数据
├── V2__add_python_tag.sql    # 新增标签
├── V3__admin_audit_logs.sql  # 审计日志表
├── V4__user_preferences.sql  # users.preferences JSON
└── V5__reseed_categories_zh.sql  # 分类中文化
```

**铁律：已执行的迁移文件永远不要修改**，只能新增 V(n+1)。

## 五、Markdown 渲染链路

```
作者写作 (TechBlogEditor)
    ↓ POST /api/articles { content: "# markdown..." }
后端存储 (articles.content LONGTEXT)
    ↓ GET /api/articles/slug/{slug}
前端渲染 (react-markdown + remark-gfm + rehype-highlight)
    ↓
HTML 输出（代码高亮、GFM 表格、heading id）
    ↓
extractTocFromMarkdown → 目录导航
```

## 六、部署架构

```
GitHub Push (main)
    ↓
GitHub Actions (cd.yml)
    ↓ build Docker image → push GHCR
    ↓ SSH deploy to server
    ↓
docker compose up -d
    ├── frontend (nginx + static)
    ├── backend (Spring Boot jar)
    └── mysql (volume persist)
```

## 七、本地开发命令

```bash
# 1. 创建数据库
mysql -e "CREATE DATABASE iume_atelier_db CHARACTER SET utf8mb4;"

# 2. 启动后端（Flyway 自动迁移）
cd iume-atelier-backend && mvn spring-boot:run

# 3. 启动前端
cd iume-atelier-frontend && npm install && npm run dev

# 4. 访问
# 前端: http://localhost:5173
# API:  http://localhost:8080/api/health
# Swagger: http://localhost:8080/api/swagger-ui.html
```

## 八、系列导航

| 篇目 | 视角 | 状态 |
|------|------|------|
| 产品设计 | 产品 | 已发布 |
| 阅读体验 | 产品 | 已发布 |
| **本篇** | 技术 | 当前 |
| 偏好同步 | 技术 | 见下一篇 |
| Flyway 踩坑 | 踩坑 | 见第五篇 |

---

*iume-atelier 系列 · 技术篇 · 第 1 篇*
