import { useEffect, useRef } from 'react'
import type { ArticleRequest } from '@/types/api'

const DRAFT_PREFIX = 'iume-studio-draft'

function draftKey(editingId: number | null) {
  return `${DRAFT_PREFIX}-${editingId ?? 'new'}`
}

export function loadDraft(editingId: number | null): ArticleRequest | null {
  try {
    const raw = localStorage.getItem(draftKey(editingId))
    if (!raw) return null
    return JSON.parse(raw) as ArticleRequest
  } catch {
    return null
  }
}

export function clearDraft(editingId: number | null) {
  localStorage.removeItem(draftKey(editingId))
}

export function useDraftAutosave(
  form: ArticleRequest,
  editingId: number | null,
  enabled: boolean,
  debounceMs = 1500,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled) return
    if (!form.title && !form.content) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      localStorage.setItem(draftKey(editingId), JSON.stringify(form))
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [form, editingId, enabled, debounceMs])
}
