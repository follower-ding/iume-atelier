import { buildLegacyEntries } from '@/data/ai-tools/legacy'
import { defineAiTool } from '@/data/ai-tools/define'
import type {
  AiToolCategory,
  AiToolEntry,
  AiToolFilter,
  AiToolItem,
} from '@/data/ai-tools/types'

export type { AiToolCategory, AiToolEntry, AiToolFilter, AiToolItem, AiToolDetail, AiToolConfigBlock } from '@/data/ai-tools/types'

export const aiToolCategories: { id: AiToolCategory; label: string; hint: string }[] = [
  { id: 'mcp', label: 'MCP', hint: 'Model Context Protocol 服务，扩展 AI 能力' },
  { id: 'skill', label: 'Skills', hint: 'Cursor Agent 技能与编辑器工作流' },
  { id: 'prompt', label: 'Prompt', hint: '可复用的提示词与规则模板' },
  { id: 'online', label: '在线工具', hint: '部署、构建与协作类 Web 服务' },
]

function loadEntryFiles(): AiToolEntry[] {
  const modules = import.meta.glob<{ default: AiToolEntry }>('./entries/*.ts', { eager: true })
  return Object.entries(modules)
    .filter(([path]) => !path.endsWith('_template.ts'))
    .map(([, mod]) => mod.default)
}

/** 从 iume-ai-catalog 同步的 JSON（npm run catalog:sync） */
function loadCatalogJson(): AiToolEntry[] {
  const modules = import.meta.glob<AiToolEntry>('./catalog/*.json', { eager: true, import: 'default' })
  return Object.values(modules).map((entry) => defineAiTool(entry))
}

function mergeEntries(legacy: AiToolEntry[], modern: AiToolEntry[]): AiToolEntry[] {
  const map = new Map<string, AiToolEntry>()
  for (const entry of legacy) map.set(entry.id, entry)
  for (const entry of modern) map.set(entry.id, entry)
  return [...map.values()]
}

const legacyEntries = buildLegacyEntries()
const modernEntries = loadEntryFiles()
const catalogEntries = loadCatalogJson()
export const aiToolEntries = mergeEntries(mergeEntries(legacyEntries, modernEntries), catalogEntries)

export const aiTools: AiToolItem[] = aiToolEntries.map(({ detail: _detail, ...card }) => card)

export function getAiToolEntryById(id: string): AiToolEntry | undefined {
  return aiToolEntries.find((t) => t.id === id)
}

export function getAiToolById(id: string): AiToolItem | undefined {
  return aiTools.find((t) => t.id === id)
}

export function getCategoryLabel(id: AiToolCategory): string {
  return aiToolCategories.find((c) => c.id === id)?.label ?? id
}

export function filterAiTools(
  items: AiToolItem[],
  category: AiToolFilter,
  keyword: string,
  tag?: string | null,
): AiToolItem[] {
  const q = keyword.trim().toLowerCase()
  const activeTag = tag?.trim().toLowerCase()
  return items.filter((tool) => {
    if (category !== 'all' && tool.category !== category) return false
    if (activeTag && !tool.tags.some((t) => t.toLowerCase() === activeTag)) return false
    if (!q) return true
    const haystack = [
      tool.name,
      tool.description,
      tool.category,
      tool.source ?? '',
      ...tool.tags,
    ].join(' ').toLowerCase()
    return haystack.includes(q)
  })
}

export function getFeaturedAiTools(items: AiToolItem[] = aiTools): AiToolItem[] {
  return items.filter((t) => t.featured)
}

export function getAiToolStats(items: AiToolEntry[] = aiToolEntries) {
  const total = items.length
  const byCategory = aiToolCategories.map((c) => ({
    ...c,
    count: items.filter((t) => t.category === c.id).length,
  }))
  const copyable = items.filter((t) => (t.detail.configs?.length ?? 0) > 0).length
  return { total, byCategory, copyable }
}
