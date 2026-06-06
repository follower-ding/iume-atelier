#!/usr/bin/env node
/**
 * @deprecated 工具箱已迁至 iume-ai-catalog，请在该仓库新增条目后 catalog:sync
 */
console.log(`
AI 工具箱数据源已迁至 iume-ai-catalog 仓库。

新增条目：
  cd ../iume-ai-catalog
  npm run add -- <id> "<名称>" <category> [icon]
  # 编辑 entries/<id>.json
  npm run validate && git add . && git commit -m "feat: add <id>"

同步到博客：
  cd iume-atelier-frontend && npm run catalog:sync
`)

process.exit(1)
