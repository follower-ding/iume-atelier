import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useLocation } from 'react-router-dom'
import { Check, Copy, Search, X } from 'lucide-react'
import { snippets, snippetCategories, type SnippetCategory } from '@/data/snippets'
import { zh } from '@/locales/zh'
import { useUiSound } from '@/hooks/useUiSound'

interface SnippetPanelProps {
  onClose: () => void
  style?: CSSProperties
}

export default function SnippetPanel({ onClose, style }: SnippetPanelProps) {
  const { pathname } = useLocation()
  const { play } = useUiSound()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<SnippetCategory | 'all'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const isStudioWrite = /^\/studio(\/new|\/\d+\/edit)/.test(pathname)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return snippets.filter((s) => {
      if (category !== 'all' && s.category !== category) return false
      if (!q) return true
      return (
        s.title.toLowerCase().includes(q)
        || s.tags.some((t) => t.toLowerCase().includes(q))
        || s.content.toLowerCase().includes(q)
      )
    })
  }, [query, category])

  const handleUse = useCallback(async (snippet: (typeof snippets)[0]) => {
    play('click')
    try {
      await navigator.clipboard.writeText(snippet.content)
      setCopiedId(snippet.id)
      setTimeout(() => setCopiedId(null), 1800)
    } catch {
      /* clipboard blocked */
    }
    if (isStudioWrite) {
      window.dispatchEvent(new CustomEvent('iume-snippet-insert', { detail: snippet.content }))
    }
  }, [isStudioWrite, play])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className={`companion-panel companion-panel--snippets${style ? ' companion-panel--floating' : ''}`}
      style={style}
      role="dialog"
      aria-label={zh.companion.snippets}
    >
      <div className="companion-panel__head">
        <h3 className="companion-panel__title">{zh.companion.snippets}</h3>
        <button type="button" className="companion-panel__close cursor-pointer" onClick={onClose} aria-label={zh.companion.close}>
          <X size={16} />
        </button>
      </div>

      <div className="companion-panel__search">
        <Search size={14} className="companion-panel__search-icon" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={zh.companion.searchSnippets}
          className="companion-panel__search-input"
        />
      </div>

      <div className="companion-panel__tabs">
        <button
          type="button"
          className={`companion-panel__tab cursor-pointer ${category === 'all' ? 'companion-panel__tab--active' : ''}`}
          onClick={() => setCategory('all')}
        >
          {zh.companion.all}
        </button>
        {snippetCategories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`companion-panel__tab cursor-pointer ${category === c.id ? 'companion-panel__tab--active' : ''}`}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="companion-panel__list">
        {filtered.length === 0 && (
          <p className="companion-panel__empty">{zh.companion.noSnippets}</p>
        )}
        {filtered.map((s) => (
          <article key={s.id} className="companion-snippet">
            <div className="companion-snippet__head">
              <h4 className="companion-snippet__title">{s.title}</h4>
              <button
                type="button"
                className="companion-snippet__action cursor-pointer"
                onClick={() => handleUse(s)}
                title={isStudioWrite ? zh.companion.copyAndInsert : zh.companion.copy}
              >
                {copiedId === s.id ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedId === s.id ? zh.companion.copied : (isStudioWrite ? zh.companion.insert : zh.companion.copy)}</span>
              </button>
            </div>
            <pre className="companion-snippet__code">{s.content.length > 220 ? `${s.content.slice(0, 220)}…` : s.content}</pre>
          </article>
        ))}
      </div>

      {isStudioWrite && (
        <p className="companion-panel__hint">{zh.companion.studioInsertHint}</p>
      )}
    </div>
  )
}
