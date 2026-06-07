import { useEffect, useRef } from 'react'
import { analyticsApi } from '@/api'

const SKIP_PREFIXES = ['/console', '/studio', '/login', '/register', '/settings']
const ARTICLE_PREFIX = '/article/'

function shouldSkip(path: string) {
  return SKIP_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))
    || path.startsWith(ARTICLE_PREFIX)
}

/** Fire-and-forget page view; ignores duplicate path within the same mount cycle. */
export function usePageView(path: string, articleId?: number) {
  const lastKey = useRef('')

  useEffect(() => {
    if (!path || shouldSkip(path)) return
    const key = `${path}:${articleId ?? ''}`
    if (lastKey.current === key) return
    lastKey.current = key
    analyticsApi.recordPageView(path, articleId).catch(() => {})
  }, [path, articleId])
}
