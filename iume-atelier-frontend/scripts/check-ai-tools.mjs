#!/usr/bin/env node
/**
 * 校验 AI 工具箱 catalog 数据完整性
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const catalogDir = join(root, 'src/data/ai-tools/catalog')

if (!existsSync(catalogDir)) {
  console.error('❌ catalog 目录不存在，请先运行 npm run catalog:sync')
  process.exit(1)
}

const files = readdirSync(catalogDir).filter((f) => f.endsWith('.json'))
const ids = files.map((f) => f.replace(/\.json$/, ''))
const dup = ids.filter((id, i) => ids.indexOf(id) !== i)

let ok = true

if (!files.length) {
  console.error('❌ catalog 为空，请从 iume-ai-catalog 同步')
  ok = false
}

if (dup.length) {
  console.error('❌ 重复 id:', [...new Set(dup)].join(', '))
  ok = false
}

const validCategories = new Set(['mcp', 'skill', 'prompt', 'online'])

for (const file of files) {
  const entry = JSON.parse(readFileSync(join(catalogDir, file), 'utf8'))
  const id = file.replace(/\.json$/, '')
  if (entry.id !== id) {
    console.error(`❌ ${file}: id 与文件名不一致`)
    ok = false
  }
  if (!entry.name?.trim() || !entry.description?.trim()) {
    console.error(`❌ ${file}: 缺少 name 或 description`)
    ok = false
  }
  if (!validCategories.has(entry.category)) {
    console.error(`❌ ${file}: category 无效`)
    ok = false
  }
  if (!entry.detail?.features?.length) {
    console.warn(`⚠️  ${file}: detail.features 为空`)
  }
}

if (ok) {
  console.log(`✅ 工具箱 catalog OK — ${ids.length} 条`)
} else {
  process.exit(1)
}
