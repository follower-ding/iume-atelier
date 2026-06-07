import type { ReactNode } from 'react'

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Wrap case-insensitive matches in <mark> for search result highlighting. */
export function highlightText(text: string, query?: string): ReactNode {
  const q = query?.trim()
  if (!q || !text) return text

  const parts = text.split(new RegExp(`(${escapeRegex(q)})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="search-highlight">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}
