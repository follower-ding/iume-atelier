---
name: release-notes
description: >-
  发版备注与 RELEASE.md 维护。merge 到 main、git push 触发 CD 前使用。
  配合 deploy-iteration-notes.mdc。
---

# 发版备注（release-notes）

## 何时使用（强制）

- merge 到 `main` 之前
- `git push` 触发 CD 之前
- 完成一个可发布功能后

## 必须更新

1. **`RELEASE.md`** — 新增版本行：`| vX.Y.Z | 日期 | 摘要 |`
2. **`deploy/.env.example`** — `APP_VERSION=vX.Y.Z`（供 `/api/health` 核对）
3. **commit message** — 第一行 `release(vX.Y.Z): 摘要`，正文分模块

## commit 模板

```
release(v1.0.1): 博客搜索与 SEO 优化

迭代内容：
- 后端：全文搜索接口
- 前端：搜索页 UI
- 部署：APP_VERSION 更新
- SEO：sitemap + meta
```

## 版本号规则

- 修 bug → patch `v1.0.x`
- 新功能 → minor `v1.x.0`
- 大改版 → major `vX.0.0`

## 与 deploy-iteration-notes.mdc 关系

- `deploy-iteration-notes.mdc` = 规则约束
- 本 skill = 具体操作步骤和模板

## 禁止

- 禁止无 RELEASE.md 更新就 push 到 main
- 禁止 commit message 只有「update」「fix」无版本信息
