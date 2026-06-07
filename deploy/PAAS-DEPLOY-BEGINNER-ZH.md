# iume-atelier 小白上线部署指南

> 本文档记录 **2026 年 6 月** 真实上线全过程，用大白话写，适合第一次部署网站的同学。  
> 技术细节另见 [PAAS-DEPLOY.md](./PAAS-DEPLOY.md)（偏配置速查）。

---

## 一、这个网站是什么？

**iume-atelier** 是一个个人技术博客 + 写作台，主要功能：

| 功能 | 说明 | 谁能用 |
|------|------|--------|
| **读文章** | 首页、分类、标签、搜索、RSS | 所有人 |
| **写作台 Studio** | Markdown 写文章、草稿、发布 | 登录用户 |
| **后台 Console** | 用户、文章、评论、分类标签、审计日志 | 管理员 |
| **账户设置** | 头像、主题、陪伴坞、音乐、密码 | 登录用户 |

**默认管理员账号**（本地和线上初始库一样）：

- 用户名：`admin`
- 密码：`admin123`  
- ⚠️ 上线后请尽快在「账户设置 → 安全」里改密码。

---

## 二、整体思路：为什么要拆成「前端 + 后端 + 数据库」？

可以把它想成一家餐厅：

```
顾客（访客浏览器）
    ↓ 看菜单、点菜
前台（前端网页）     ←  Netlify 托管，只负责展示页面
    ↓ 把订单转给厨房
厨房（后端 API）     ←  Railway 托管，处理登录、发文章、查数据
    ↓ 从仓库取食材
仓库（MySQL 数据库） ←  Railway MySQL，存文章、用户、评论
```

### 为什么不能全部放一个平台？

| 部分 | 技术 | 能放 Netlify 吗？ |
|------|------|------------------|
| 前端 | React 静态网页 | ✅ 可以 |
| 后端 | Java Spring Boot | ❌ 不行（要长期运行的服务器） |
| 数据库 | MySQL | ❌ 不行 |

所以我们采用 **PaaS 组合**（PaaS = 平台帮你管服务器，不用自己买 VPS）：

| 角色 | 我们用的平台 | 费用 |
|------|-------------|------|
| 前端 | **Netlify** | 免费 |
| 后端 + MySQL | **Railway** | 免费额度约 $5/月 |

> 也可以用 Vercel 代替 Netlify 做前端；我们当时 Vercel 要手机验证，所以选了 Netlify。

### 请求是怎么走的？

```
https://你的站点.netlify.app/          →  Netlify 返回网页
https://你的站点.netlify.app/api/xxx   →  Netlify 转发到 Railway 后端
```

浏览器地址栏始终是 Netlify 域名，用户感觉不到「后端在另一个网站」。

---

## 三、上线前你要准备什么？

1. **GitHub 账号**，代码在仓库里（我们是 `follower-ding/iume-atelier`）
2. **Railway 账号**（用 GitHub 登录）：https://railway.app
3. **Netlify 账号**（用 GitHub 登录）：https://netlify.com
4. 本地能 `git push` 到 GitHub（改配置后要推代码才会触发自动部署）

---

## 四、第一步：Railway 部署后端 + 数据库

### 4.1 创建项目

1. 打开 Railway → **New Project**
2. **Deploy from GitHub repo** → 选 `iume-atelier`
3. Railway 会读仓库里的 `railway.toml`，用 Docker 构建后端

### 4.2 添加 MySQL

在同一 Project 里：

1. **Add Service** → **Database** → **MySQL**
2. 等 MySQL 状态变成 **Online**

### 4.3 配置后端环境变量

选中 **后端服务**（不是 MySQL）→ **Variables**，添加：

```env
SPRING_PROFILES_ACTIVE=prod

SPRING_DATASOURCE_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC

SPRING_DATASOURCE_USERNAME=${{MySQL.MYSQLUSER}}
SPRING_DATASOURCE_PASSWORD=${{MySQL.MYSQLPASSWORD}}

IUME_JWT_SECRET=请改成至少32位的随机字符串
IUME_APP_VERSION=1.0.0
```

> `${{MySQL.xxx}}` 是 Railway 的写法，会自动引用同项目里 MySQL 服务的连接信息，**不要手填 IP**。

**前端域名先留空**，等 Netlify 部署完再补下面两个：

```env
IUME_SITE_URL=https://你的-netlify-域名.netlify.app
IUME_CORS_ORIGINS=https://你的-netlify-域名.netlify.app
```

### 4.4 生成公网域名

后端服务 → **Settings** → **Networking** → **Generate Domain**

我们得到的地址示例：

```
https://iume-atelier-production.up.railway.app
```

### 4.5 验证后端是否活着

浏览器打开：

```
https://iume-atelier-production.up.railway.app/api/health
```

应看到：

```json
{"status":"UP","version":"1.0.0"}
```

看到这就说明：**厨房开火了，数据库也连上了**。

### 4.6 后端第一次启动会自动建表

项目用 **Flyway** 迁移数据库，首次启动会：

- 建表（用户、文章、分类、标签、评论…）
- 插入 2 篇英文示例文章
- 创建 `admin` 账号

**注意**：这是 Railway 上的**新数据库**，和你电脑本地 MySQL **不是同一个库**，数据不会自动同步过去。

---

## 五、第二步：Netlify 部署前端

### 5.1 先改配置文件里的后端地址

仓库根目录 `netlify.toml` 里，把 Railway 域名写进反代规则：

```toml
[[redirects]]
  from = "/api/*"
  to = "https://iume-atelier-production.up.railway.app/api/:splat"
  status = 200
  force = true
```

同时确认：

```toml
[build]
  base = "iume-atelier-frontend"
  command = "npm run build"
  publish = "dist"          # ← 必须是 dist，不是 iume-atelier-frontend/dist
```

改完后 **push 到 GitHub**。

### 5.2 在 Netlify 创建站点

1. Netlify → **Add new site** → **Import an existing project**
2. 选 GitHub → 仓库 `iume-atelier`
3. 构建设置建议（**很重要**）：

| 设置项 | 填什么 | 说明 |
|--------|--------|------|
| Base directory | **留空** | 用根目录的 `netlify.toml` |
| Build command | **留空** | toml 里已有 |
| Publish directory | **留空** 或 `dist` | 不要填 `iume-atelier-frontend/dist` |

4. 点 **Deploy site**

### 5.3 我们上线的地址

```
https://startling-tiramisu-c5cb57.netlify.app
```

（Netlify 会自动生成类似「形容词-食物-随机码」的域名，可在 **Domain management** 里改自定义域名。）

### 5.4 验证前端

| 检查 | 地址 | 预期 |
|------|------|------|
| 首页 | `/` | 能看到博客首页 |
| 健康检查 | `/api/health` | `{"status":"UP",...}` |
| 文章列表 | `/articles` | 有文章卡片 |

---

## 六、第三步：补 Railway 的 CORS 配置（登录必做）

### 6.1 什么是 CORS？为什么要配？

浏览器有个安全规则：**网页只能随便访问「自己域名」下的接口**。

我们的情况是：

- 网页在 `xxx.netlify.app`
- 接口经 Netlify 转发到 Railway，但请求里仍带有 `Origin: https://xxx.netlify.app`
- 后端要显式说：「我允许这个 Netlify 域名访问我」

没配的话，登录会报：

```
403 Invalid CORS request
```

页面上显示「用户名或密码错误」（其实是 CORS 被挡了，前端把所有错误都显示成这一句）。

### 6.2 怎么配

Railway 后端 Variables 添加（域名换成你的）：

```env
IUME_CORS_ORIGINS=https://startling-tiramisu-c5cb57.netlify.app
IUME_SITE_URL=https://startling-tiramisu-c5cb57.netlify.app
```

保存后 **等 Railway 重新部署完成**（Deployments 里看到 Success），再试登录。

### 6.3 登录验证

1. 打开 `https://你的域名.netlify.app/login`
2. 输入 `admin` / `admin123`
3. 按 F12 → Network → 看 `login` 请求应是 **200**，不是 403

---

## 七、网站怎么用？（上线后日常操作）

### 7.1 访客：读文章

- **首页**：最新 / 最热门文章
- **文章** `/articles`：全部文章、按分类筛选
- **搜索**：顶栏搜索图标
- **RSS**：`/rss.xml` 或顶栏 RSS 图标
- **关于 / 项目 / 工具**：站点介绍页

### 7.2 作者：写作台 Studio

1. 登录后，顶栏进入 **写作台** `/studio`
2. 新建文章 → Markdown 编辑（支持预览、分栏）
3. 选分类、标签、封面图
4. 存草稿或 **发布**

### 7.3 管理员：后台 Console

管理员登录后会进 `/console`，可管理：

- 用户
- 全部文章（含他人草稿）
- 评论审核
- 分类 / 标签
- 操作审计日志

### 7.4 个人设置

`/settings` 可改：

- 昵称、邮箱、头像
- 深色 / 浅色主题
- 陪伴坞、背景音乐
- 修改密码

偏好会同步到云端（登录后跨设备生效）。

---

## 八、本地数据和线上数据：为什么不一样？

| | 本地开发 | 线上生产 |
|--|---------|---------|
| 数据库 | 你电脑的 MySQL | Railway MySQL |
| 数据 | 你本地写的文章 | Flyway 初始数据 + 你后来发到线上的 |

**上线后看不到本地文章是正常的**，需要把内容「再发一遍」到线上。

### 方法一：用脚本批量发（仓库里已有 5 篇系列文章）

```powershell
cd d:\cursor_project\iume-atelier
$env:IUME_API_BASE="https://startling-tiramisu-c5cb57.netlify.app/api"
node scripts/publish-series-articles.mjs
```

### 方法二：在 Studio 里在线写

登录线上站点 → 写作台 → 新建 → 发布。

### 方法三：用 Cursor MCP 技能发（见下一节）

---

## 九、用 Cursor 技能发布博客（AI 写文 → 一键上线）

项目配置了**全局 MCP + Skill**，在 Cursor 里任何项目都可以把 Markdown 发到 iume-atelier。

### 9.1 组件在哪

| 组件 | 路径 |
|------|------|
| MCP 服务 | `~/.cursor/mcp-servers/iume-atelier-blog/` |
| Skill 说明 | `~/.cursor/skills/iume-atelier-publish/` |
| 账号密码 | `~/.cursor/mcp.env` |
| MCP 注册 | `~/.cursor/mcp.json` → server 名 `iume-atelier` |

安装/更新脚本：

```powershell
& "$env:USERPROFILE\.cursor\scripts\install-iume-atelier-blog-mcp.ps1"
```

### 9.2 改成发到线上（不是 localhost）

编辑 `~/.cursor/mcp.env`：

```env
IUME_BLOG_API_URL=https://startling-tiramisu-c5cb57.netlify.app/api
IUME_BLOG_FRONTEND_URL=https://startling-tiramisu-c5cb57.netlify.app
IUME_BLOG_USERNAME=admin
IUME_BLOG_PASSWORD=admin123
```

改完后 **重启 Cursor**，让 MCP 重新加载。

### 9.3 在 Cursor 里怎么说

直接对 AI 说，例如：

> 帮我把这篇文档发布到 iume-atelier 博客，分类选 programming，标签 tutorial

AI 会按 Skill 流程：

1. `blog_health` — 检查 API 是否通
2. `blog_list_taxonomy` — 查分类、标签 slug
3. 撰写或整理 Markdown
4. `blog_screenshot`（可选）— 截图当封面
5. `blog_publish_article` — 发布
6. 返回文章公开链接

### 9.4 分类 slug 对照

| 内容类型 | categorySlug |
|----------|--------------|
| 技术 / 编程 | `programming` |
| AI 相关 | `ai` |
| 产品 / 体验 / 生活 | `life` |

标签从 `blog_list_taxonomy` 返回的列表里选，例如 `java`、`react`、`tutorial`。

### 9.5 MCP 发布示例（JSON 参数）

```json
{
  "title": "我的第一篇线上文章",
  "content": "# 标题\n\n## 背景\n\n正文 Markdown...",
  "categorySlug": "programming",
  "tagSlugs": ["tutorial"],
  "status": "PUBLISHED"
}
```

---

## 十、我们踩过的坑（问题 → 原因 → 解决）

### 坑 1：Netlify 部署失败「Initializing / Install dependencies」

| | |
|--|--|
| **现象** | Deploy failed，Install dependencies exit code 1 |
| **原因 1** | `netlify.toml` 里 `publish = "iume-atelier-frontend/dist"` 写错了，应为 `publish = "dist"` |
| **原因 2** | `react-helmet-async@2` 不支持 React 19，Netlify 严格安装依赖失败 |
| **原因 3** | Netlify 控制台 Base=`/` + Publish=`iume-atelier-frontend/dist`，和 toml 冲突 |
| **解决** | 修正 toml；升级 `react-helmet-async@3`；控制台 Base/Publish **留空** |

### 坑 2：git commit 失败「Author identity unknown」

| | |
|--|--|
| **现象** | commit 报错，但 push 可能把旧 commit 推上去了，新改动没进 GitHub |
| **解决** | 配置 git 用户（仅当前仓库）：<br>`git config user.name "你的名字"`<br>`git config user.email "你的邮箱"` |

### 坑 3：登录显示「用户名或密码错误」但密码没错

| | |
|--|--|
| **现象** | Network 里 `login` 是 **403**，响应 `Invalid CORS request` |
| **原因** | Railway 没配 `IUME_CORS_ORIGINS`，后端拒绝 Netlify 来源 |
| **解决** | Railway 加上前端域名，等 redeploy 完成 |

### 坑 4：命令行 curl 能登录，浏览器不能

| | |
|--|--|
| **原因** | curl 不带 `Origin` 头，不触发 CORS 检查；浏览器会带 |
| **解决** | 同上，配 CORS |

### 坑 5：登录成功但看不到本地之前的文章

| | |
|--|--|
| **原因** | 本地 MySQL ≠ Railway MySQL，两套库 |
| **解决** | 用脚本 / Studio / MCP 把文章发到线上 |

### 坑 6：Vercel 要手机验证

| | |
|--|--|
| **解决** | 换 Netlify，或完成 Vercel 短信验证后继续用 |

### 坑 7：Railway MySQL 变量名写错

| | |
|--|--|
| **错误** | `${{MySQL.MYSQL_DATABASE}}` |
| **正确** | `${{MySQL.MYSQLDATABASE}}`（无下划线） |

---

## 十一、上线后检查清单

- [ ] `/api/health` 返回 UP
- [ ] 首页能打开，文章列表有内容
- [ ] Railway 已配 `IUME_CORS_ORIGINS` 和 `IUME_SITE_URL`
- [ ] 登录 `admin` 成功，能进 Studio / Console
- [ ] 已修改默认 admin 密码
- [ ] 重要文章已从本地同步到线上（或在线重写）
- [ ] （可选）Netlify / Railway 绑定自定义域名

---

## 十二、当前生产环境地址（本次部署记录）

| 服务 | 地址 |
|------|------|
| 前端（Netlify） | https://startling-tiramisu-c5cb57.netlify.app |
| 后端（Railway） | https://iume-atelier-production.up.railway.app |
| 健康检查 | https://startling-tiramisu-c5cb57.netlify.app/api/health |
| GitHub 仓库 | https://github.com/follower-ding/iume-atelier |

---

## 十三、已知限制（演示环境）

| 限制 | 说明 |
|------|------|
| 上传图片 | Railway 磁盘不持久，重启可能丢 → 后续可接对象存储 |
| 冷启动 | Railway 免费档闲置后，第一次请求可能慢几秒 |
| 数据库 | 线上和本地完全独立，不会自动同步 |

---

## 十四、相关文档

| 文档 | 用途 |
|------|------|
| [PAAS-DEPLOY.md](./PAAS-DEPLOY.md) | 配置速查、Vercel/EdgeOne 备选 |
| [AUTO-DEPLOY.md](./AUTO-DEPLOY.md) | 自有 VPS + GitHub Actions 部署 |
| [../README.md](../README.md) | 项目总览、本地启动 |
| `~/.cursor/skills/iume-atelier-publish/SKILL.md` | MCP 发布技能详细说明 |

---

## 十五、一句话总结

> **前端放 Netlify，后端和数据库放 Railway，Netlify 把 `/api` 转给 Railway，Railway 要配好 CORS 才能登录，本地数据和线上数据是两套库，文章要用 Studio / 脚本 / MCP 再发一遍。**

有问题先查 **Netlify Deploy log** 和 **Railway Deploy log**，再对照本文「第十节 踩坑」。
