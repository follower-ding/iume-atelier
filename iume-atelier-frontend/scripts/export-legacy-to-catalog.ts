/**
 * 一次性导出：legacy 列表 + 详情 + snippets → iume-ai-catalog/entries/*.json
 *
 * 用法（在 iume-atelier-frontend 目录）：
 *   npx tsx --tsconfig tsconfig.app.json scripts/export-legacy-to-catalog.ts
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildLegacyEntries } from '@/data/ai-tools/legacy'
import type { AiToolEntry } from '@/data/ai-tools/types'

const __dirname = dirname(fileURLToPath(import.meta.url))
const catalogRoot = resolve(__dirname, '../../../iume-ai-catalog')
const entriesDir = join(catalogRoot, 'entries')

mkdirSync(entriesDir, { recursive: true })

function loadExistingCatalogEntries(): AiToolEntry[] {
  const out: AiToolEntry[] = []
  for (const file of readdirSync(entriesDir)) {
    if (!file.endsWith('.json') || file === '_template.json') continue
    const entry = JSON.parse(readFileSync(join(entriesDir, file), 'utf8')) as AiToolEntry
    out.push(entry)
  }
  return out
}

const map = new Map<string, AiToolEntry>()
for (const entry of buildLegacyEntries()) map.set(entry.id, entry)
for (const entry of loadExistingCatalogEntries()) map.set(entry.id, entry)

const ids = [...map.keys()].sort()
for (const id of ids) {
  const entry = map.get(id)!
  const path = join(entriesDir, `${id}.json`)
  writeFileSync(path, `${JSON.stringify(entry, null, 2)}\n`, 'utf8')
  console.log(`  ✓ ${id}.json`)
}

const catalog = {
  version: 1,
  name: 'iume-ai-catalog',
  description: '精选 MCP、Cursor Skill、Prompt 与在线工具',
  updatedAt: new Date().toISOString().slice(0, 10),
  entries: ids,
}

writeFileSync(join(catalogRoot, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')
console.log(`\n✅ 已导出 ${ids.length} 条 → ${entriesDir}`)
