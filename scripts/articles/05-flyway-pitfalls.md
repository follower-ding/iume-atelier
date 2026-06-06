# Flyway 踩坑记：分类重构与 Checksum 修复

> 本篇是 **iume-atelier 踩坑系列**，记录两个真实的生产级问题：Flyway checksum 校验失败，以及分类体系从英文重构为中文。

## 一、背景：为什么要改分类

项目初期的种子数据用了英文分类：

| 旧名称 | slug | 问题 |
|--------|------|------|
| Technology | technology | 中文博客用英文大类，违和 |
| Design | design | 和「设计」标签混淆，且内容方向不对 |
| Life | life | 还行，但不够直观 |

产品决策：改为 **编程 / AI / 生活**，对应 slug `programming` / `ai` / `life`。

## 二、错误的做法（我们踩的坑）

最直接的想法：修改 `V1__init.sql` 里的 INSERT 语句，把英文改成中文。

```sql
-- ❌ 错误：修改了已执行的迁移文件
INSERT INTO categories (name, slug, description) VALUES
('编程', 'programming', '软件开发、架构、框架与工程实践'),
('AI', 'ai', '人工智能、大模型、智能体与 AI 开发工具'),
('生活', 'life', '随笔、效率、思考与日常记录');
```

然后重启后端，Flyway 报错：

```
FlywayValidateException: Migration checksum mismatch for migration version 1
-> Applied to database : 160632606
-> Resolved locally    : 1507440873
```

**后端完全无法启动。**

### 2.1 原因

Flyway 对每个迁移文件计算 checksum 并存入 `flyway_schema_history` 表。文件内容一旦变化，本地 checksum 和数据库记录不一致，校验失败。

### 2.2 Flyway 的铁律

> **已执行的迁移脚本，永远不要修改。只能新增。**

## 三、正确的修复方案

### 步骤 1：还原 V1__init.sql

把 V1 恢复为原始的英文种子数据，使 checksum 重新匹配：

```sql
-- ✅ 还原为原始内容
INSERT INTO categories (name, slug, description) VALUES
('Technology', 'technology', 'Articles about software development and tech trends'),
('Design', 'design', 'UI/UX, visual design and creative workflows'),
('Life', 'life', 'Personal essays and lifestyle notes');
```

### 步骤 2：新增 V5 迁移做 UPDATE

```sql
-- V5__reseed_categories_zh.sql
UPDATE categories
SET name = '编程', slug = 'programming',
    description = '软件开发、架构、框架与工程实践'
WHERE slug IN ('technology', 'Technology')
   OR name IN ('Technology', '编程');

UPDATE categories
SET name = 'AI', slug = 'ai',
    description = '人工智能、大模型、智能体与 AI 开发工具'
WHERE slug IN ('design', 'Design')
   OR name IN ('Design', 'AI');

UPDATE categories
SET name = '生活', slug = 'life',
    description = '随笔、效率、思考与日常记录'
WHERE slug IN ('life', 'Life')
   OR name IN ('Life', '生活');
```

WHERE 条件同时匹配旧 slug 和新 slug，保证幂等。

### 步骤 3：重启后端

```
Flyway: Successfully validated 5 migrations
Flyway: Migrating schema to version "5 - reseed categories zh"
Started IumeAtelierApplication in 2.4 seconds
```

## 四、迁移时间线总结

| 版本 | 文件 | 类型 | 说明 |
|------|------|------|------|
| V1 | init.sql | CREATE + INSERT | 建表 + 英文种子（**不可改**） |
| V2 | add_python_tag.sql | INSERT | 新增 Python/TS/React 标签 |
| V3 | admin_audit_logs.sql | CREATE | 审计日志表 |
| V4 | user_preferences.sql | ALTER | 添加 preferences JSON 列 |
| V5 | reseed_categories_zh.sql | UPDATE | 分类中文化 |

## 五、其他踩坑记录

### 5.1 目录锚点被 Header 遮挡

**现象**：点击文章目录，标题跳到 sticky header 后面，看不到。

**原因**：浏览器原生 `#hash` 跳转不考虑 fixed header 高度。

**修复**：手动 scroll 并减去 96px offset（详见产品篇）。

### 5.2 ScrollToTop 按钮被裁切

**现象**：「回到顶部」按钮左下角被裁切，几乎看不到。

**原因**：`.site-shell` 的 CSS `overflow: hidden` 破坏了 `position: fixed` 的定位上下文。

**修复**：直接移除 ScrollToTop 组件—— 现代浏览器都有原生滚动，且目录导航已提供更好的跳转体验。

### 5.3 前端分类不要写死

**现象**：早期前端 hardcode 了 `['Technology', 'Design', 'Life']`。

**问题**：后端改了分类名，前端不同步。

**修复**：

```typescript
// utils/categories.ts — 从 API 拉取，只负责排序和图标
const CATEGORY_ORDER = ['programming', 'ai', 'life']
const CATEGORY_META = {
  programming: { icon: '</>', hint: '代码、架构、工程' },
  ai: { icon: 'AI', hint: '大模型、智能体、工具' },
  life: { icon: '☕', hint: '随笔、思考、日常' },
}
export function sortCategories(categories) {
  return [...categories].sort((a, b) =>
    CATEGORY_ORDER.indexOf(a.slug) - CATEGORY_ORDER.indexOf(b.slug)
  )
}
```

名称从 API 来，前端只管展示顺序和图标。

## 六、Flyway 最佳实践清单

- [ ] **永远不要修改已执行的 migration 文件**
- [ ] 数据变更用 `UPDATE` / `INSERT` 新 migration
- [ ] Schema 变更用 `ALTER TABLE` 新 migration
- [ ] WHERE 条件写宽泛一些，保证幂等（可重复执行不出错）
- [ ] 本地开发：`spring.flyway.baseline-on-migrate=true`
- [ ] 生产环境：先备份数据库，再部署新 migration
- [ ] 如果 checksum 已经不一致：`mvn flyway:repair`（谨慎使用）

## 七、验证方法

```bash
# 1. 后端健康检查
curl http://127.0.0.1:8080/api/health
# → {"status":"UP","version":"1.0.0"}

# 2. 分类已中文化
curl http://127.0.0.1:8080/api/categories
# → 编程, AI, 生活

# 3. 偏好字段存在
curl -H "Authorization: Bearer <token>" \
  http://127.0.0.1:8080/api/users/me/preferences
```

## 八、系列完结

| # | 标题 | 视角 |
|---|------|------|
| 1 | 从 0 到 1：产品设计与搭建思路 | 产品 |
| 2 | 阅读体验：目录导航与陪伴坞 | 产品 |
| 3 | 全栈架构选型 | 技术 |
| 4 | 用户偏好云端同步与 JWT | 技术 |
| 5 | **本篇：Flyway 踩坑记** | 踩坑 |

---

*iume-atelier 系列 · 踩坑篇 · 完结*

> 记住 Flyway 的第一条铁律：**已执行的脚本，永远不要改。**
