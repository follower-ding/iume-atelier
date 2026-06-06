#!/usr/bin/env node
/**
 * 从 iume-ai-catalog 同步 JSON 条目到前端 catalog 目录
 *
 * 用法：
 *   npm run catalog:sync
 *   CATALOG_PATH=D:/other/iume-ai-catalog npm run catalog:sync
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const atelierRoot = join(__dirname, '..')
const defaultCatalog = join(atelierRoot, '..', 'iume-ai-catalog')
const catalogRoot = resolve(process.env.CATALOG_PATH || defaultCatalog)
const srcEntries = join(catalogRoot, 'entries')
const destDir = join(atelierRoot, 'iume-atelier-frontend', 'src', 'data', 'ai-tools', 'catalog')

if (!existsSync(srcEntries)) {
  console.error(`❌ 找不到 catalog 仓库: ${srcEntries}`)
  console.error('   请 clone iume-ai-catalog 到 iume-atelier 同级，或设置 CATALOG_PATH')
  process.exit(1)
}

mkdirSync(destDir, { recursive: true })

for (const f of readdirSync(destDir)) {
  if (f.endsWith('.json')) rmSync(join(destDir, f))
}

const files = readdirSync(srcEntries).filter((f) => f.endsWith('.json') && f !== '_template.json')
let count = 0

for (const file of files) {
  const src = join(srcEntries, file)
  const dest = join(destDir, file)
  copyFileSync(src, dest)
  JSON.parse(readFileSync(dest, 'utf8'))
  count++
}

console.log(`✅ 已同步 ${count} 条 → iume-atelier-frontend/src/data/ai-tools/catalog/`)
