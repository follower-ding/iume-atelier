import { getAiToolDetail } from '@/data/ai-tool-details'
import { aiTools as legacyList } from '@/data/ai-tools-list'
import { snippets } from '@/data/snippets'
import type { AiToolEntry } from '@/data/ai-tools/types'

/** 旧数据（list + details 双文件）合并为统一条目，供迁移过渡期使用 */
export function buildLegacyEntries(): AiToolEntry[] {
  return legacyList.map((tool) => {
    const { snippetId, ...card } = tool
    const detail = getAiToolDetail(tool)

    if (snippetId) {
      const snippet = snippets.find((s) => s.id === snippetId)
      if (snippet) {
        const exists = detail.configs?.some((c) => c.id === snippet.id)
        if (!exists) {
          detail.configs = [
            ...(detail.configs ?? []),
            { id: snippet.id, title: snippet.title, content: snippet.content },
          ]
        }
      }
    }

    return { ...card, detail }
  })
}
