# iume-atelier AI 代码规划

## 项目定位

中型个人博客，支持 Markdown、标签、评论、搜索、RSS、多用户后台。

## 模块划分

| 模块 | 路径 | 说明 |
|------|------|------|
| 鉴权 | `/api/auth` | 注册、登录、JWT |
| 公开文章 | `/api/public/articles` | 列表、搜索、详情 |
| 后台文章 | `/api/admin/articles` | CRUD |
| 标签 | `/api/public/tags` | 标签列表 |
| 评论 | `/api/comments` | 列表、发表 |
| RSS | `/api/rss` | XML 订阅 |
| 健康检查 | `/api/health` | CD 探活 |

## 后续迭代建议

1. Markdown 编辑器增强（预览、图片上传）
2. 评论审核、反垃圾
3. 全文搜索（Elasticsearch 可选）
4. 主题切换、RSS 链接前端暴露
