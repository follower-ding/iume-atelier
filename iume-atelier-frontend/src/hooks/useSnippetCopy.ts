import { useCallback, useState } from 'react'
import { snippets } from '@/data/snippets'
import { useUiSound } from '@/hooks/useUiSound'

export function useSnippetCopy() {
  const { play } = useUiSound()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyText = useCallback(async (id: string, text: string) => {
    play('click')
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1800)
      return true
    } catch {
      return false
    }
  }, [play])

  const copySnippet = useCallback(async (snippetId: string) => {
    const snippet = snippets.find((s) => s.id === snippetId)
    if (!snippet) return false
    return copyText(snippetId, snippet.content)
  }, [copyText])

  return { copiedId, copySnippet, copyText }
}
