import { useMemo } from 'react'
import {
  aiToolEntries,
  aiTools,
  getAiToolEntryById,
} from '@/data/ai-tools'
import type { AiToolEntry, AiToolFilter, AiToolItem } from '@/data/ai-tools/types'

/**
 * 前台 AI 工具箱：直接读仓库内静态数据（entries/*.ts + ai-tools-list）。
 * 不请求后端 API，避免数据库仅 1 条时覆盖全量 catalog。
 */
export function useAiTools(_category: AiToolFilter = 'all', _keyword = '') {
  const items = aiTools
  const entries = aiToolEntries

  return useMemo(
    () => ({
      items,
      entries,
      fromApi: false,
      loading: false,
    }),
    [items, entries],
  )
}

export function useAiToolEntry(slug: string | undefined) {
  const entry = useMemo(
    () => (slug ? getAiToolEntryById(slug) : undefined),
    [slug],
  )

  return {
    entry,
    fromApi: false,
    loading: false,
  }
}

export type { AiToolEntry, AiToolItem }
