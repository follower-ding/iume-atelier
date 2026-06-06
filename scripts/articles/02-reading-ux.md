# 阅读体验设计：目录导航、陪伴坞与个性化设置

> 本篇从 **产品 + 交互** 视角，拆解 iume-atelier 三个最有辨识度的体验功能：文章目录、陪伴坞、设置页云端同步。

## 一、文章目录（Table of Contents）

### 1.1 设计目标

长文阅读最大的痛点是「迷失」—— 读者不知道读到哪里、还剩多少、如何跳回某一节。

我们的方案：

- **桌面端**：正文右侧 sticky 目录，跟随滚动高亮当前章节
- **手机端**：顶部横向 chips，点击跳转
- **锚点偏移**：点击目录时自动减去 96px，避免标题被 sticky header 遮挡

### 1.2 实现思路

目录数据从 Markdown 正文中提取 `##` 和 `###` 标题：

```typescript
export function extractTocFromMarkdown(content: string): TocItem[] {
  const items: TocItem[] = []
  for (const line of content.split('\n')) {
    const match = line.match(/^(#{2,3})\s+(.+)/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text.toLowerCase()
        .replace(/[^\w\u4e00-\u9fff]+/g, '-')
        .replace(/^-|-$/g, '')
      items.push({ id, text, level })
    }
  }
  return items
}
```

渲染 Markdown 时，`MarkdownRenderer` 会给 h2/h3 加上相同的 `id`，保证目录链接和正文锚点一致。

### 1.3 滚动高亮（Scroll Spy）

`useActiveTocItem` hook 使用 `IntersectionObserver` 监听各 heading 的可见性：

```typescript
const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries.filter(e => e.isIntersecting)
    if (visible.length > 0) {
      setActiveId(visible[0].target.id)
    }
  },
  { rootMargin: '-120px 0px -60% 0px' }
)
```

当用户滚动时，当前进入视口的 heading 对应的目录项会加上 `--active` 样式。

### 1.4 点击跳转的偏移处理

这是实践中踩过的一个细节：直接用 `#hash` 跳转，标题会被 sticky header 遮住。

解决方案——手动计算 scroll 位置并减去 header 高度：

```typescript
const handleClick = (e: React.MouseEvent, id: string) => {
  e.preventDefault()
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo({ top, behavior: 'smooth' })
  history.replaceState(null, '', `#${id}`)
}
```

## 二、陪伴坞（Companion Dock）

### 2.1 它是什么

陪伴坞是博客右下角的一个 **可拖动浮动组件**，包含：

- **头像**：登录后显示用户真实头像；未登录显示默认形象
- **鼓励语**：单击随机弹出一句鼓励（可自定义）
- **音乐播放器**：点击音符图标展开，支持内置曲目 + 用户上传

### 2.2 场景感知

陪伴坞不是「永远显示」—— 它会根据当前页面智能隐藏：

```typescript
const isStudioWrite = /^\/studio(\/new|\/\d+\/edit)/.test(pathname)
const isSettings = pathname.startsWith('/settings')
const hidden = isStudioWrite || isSettings

// 阅读文章时切换为 reading 模式
if (isArticleRead) setMood('reading')
else setMood('idle')
```

| 页面 | 陪伴坞状态 |
|------|-----------|
| 首页 / 文章列表 / 文章详情 | 显示 |
| Studio 写作台 | **隐藏**（避免遮挡编辑器） |
| 设置页 | **隐藏**（避免与表单冲突） |

### 2.3 拖动与位置持久化

- 用户可拖动陪伴坞到屏幕任意位置
- 位置保存在 `localStorage`，刷新后恢复
- 双击头像重置到默认位置

## 三、设置页与云端偏好同步

### 3.1 五分区设计

| 分区 | 功能 | 数据字段 |
|------|------|---------|
| 资料 | 昵称、邮箱、头像 | users 表 |
| 陪伴个性 | 称呼、自定义鼓励语 | preferences.companionCallName, customQuotes |
| 歌单 | 上传/编辑/删除曲目 | preferences.customTracks |
| 外观 | 主题、音效、简洁模式 | localStorage（设备级） |
| 安全 | 修改密码 | users 表 |

### 3.2 云端同步流程

```
用户修改设置 → 保存到 localStorage → 调用 PUT /api/users/me/preferences
                                              ↓
下次登录 / 换设备 → GET /api/users/me/preferences → hydrate 到 Zustand store
```

前端核心代码：

```typescript
// 推送到云端
export async function syncUserPrefsToCloud() {
  return userApi.updatePreferences(getUserPrefsPayload())
}

// 从云端拉取
export function hydrateUserPrefsFromCloud(data: Partial<UserPreferences>) {
  useUserPrefsStore.getState().hydrateFromCloud({
    companionCallName: data.companionCallName ?? '',
    customQuotes: data.customQuotes ?? [],
    customTracks: data.customTracks ?? [],
  })
}
```

后端将偏好存储在 `users.preferences` JSON 字段（Flyway V4 迁移添加）。

### 3.3 音频上传

设置页支持上传 mp3/wav/ogg 等格式，走 `POST /api/upload/audio` 接口，单文件上限 15MB。

## 四、CSS 布局要点

文章详情页使用 CSS Grid 三栏布局：

```css
.article-layout {
  display: grid;
  grid-template-columns: 1fr min(680px, 100%) 220px;
  gap: 2rem;
}
.article-toc {
  position: sticky;
  top: 6rem; /* 与 header 高度对齐 */
}
```

手机端 `@media (max-width: 1024px)` 下目录移到正文上方，变为横向滚动 chips。

## 五、小结

| 功能 | 用户价值 | 技术关键 |
|------|---------|---------|
| 目录导航 | 长文不迷路 | Markdown 提取 + IntersectionObserver |
| 陪伴坞 | 阅读有温度 | 场景感知隐藏 + 拖动持久化 |
| 云端同步 | 换设备无缝 | JSON 字段 + Zustand hydrate |

下一篇进入 **技术架构**，讲前后端怎么搭起来。

---

*iume-atelier 系列 · 产品篇 · 第 2 篇*
