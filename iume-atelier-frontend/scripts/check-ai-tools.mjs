#!/usr/bin/env node
/**
 * 校验 AI 工具箱数据完整性
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const entriesDir = join(root, 'src/data/ai-tools/entries')
const catalogDir = join(root, 'src/data/ai-tools/catalog')

const legacy = readFileSync(join(root, 'src/data/ai-tools-list.ts'), 'utf8')
const legacyIds = [...legacy.matchAll(/id: '([^']+)'/g)].map((m) => m[1])

const entryFiles = readdirSync(entriesDir).filter((f) => f.endsWith('.ts') && f !== '_template.ts')
const entryIds = entryFiles.map((f) => f.replace(/\.ts$/, ''))

let catalogIds = []
if (existsSync(catalogDir)) {
  catalogIds = readdirSync(catalogDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
}

const allIds = [...legacyIds, ...entryIds, ...catalogIds]
const dup = allIds.filter((id, i) => allIds.indexOf(id) !== i)

let ok = true

if (dup.length) {
  console.error('❌ 重复 id:', [...new Set(dup)].join(', '))
  ok = false
}

for (const file of entryFiles) {
  const text = readFileSync(join(entriesDir, file), 'utf8')
  if (!text.includes('defineAiTool(')) {
    console.error(`❌ ${file}: 必须使用 defineAiTool()`)
    ok = false
  }
  if (text.includes('mcp-foo') || text.includes('Foo MCP')) {
    console.warn(`⚠️  ${file}: 仍含模板占位符，请替换为真实内容`)
  }
}

const overlap = legacyIds.filter((id) => entryIds.includes(id))
if (overlap.length) {
  console.log(`ℹ️  entries 覆盖了 legacy 条目: ${overlap.join(', ')}（新文件优先）`)
}

if (ok) {
  console.log(`✅ 工具箱数据 OK — legacy ${legacyIds.length} 条，entries ${entryIds.length} 条，catalog ${catalogIds.length} 条，合计 ${new Set(allIds).size} 条`)
} else {
  process.exit(1)
}
