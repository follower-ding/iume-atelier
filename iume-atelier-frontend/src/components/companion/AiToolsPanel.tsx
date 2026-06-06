import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Check, Copy, ExternalLink, X } from 'lucide-react'
import { aiToolCategories, aiTools } from '@/data/ai-tools'
import { snippets } from '@/data/snippets'
import { zh } from '@/locales/zh'
import { useUiSound } from '@/hooks/useUiSound'

interface AiToolsPanelProps {
  onClose: () => void
  style?: CSSProperties
}

export default function AiToolsPanel({ onClose, style }: AiToolsPanelProps) {
  const { play } = useUiSound()
  const [category, setCategory] = useState<'cursor' | 'mcp' | 'prompt' | 'all'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (category === 'all') return aiTools
    return aiTools.filter((t) => t.category === category)
  }, [category])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const copySnippet = async (snippetId: string) => {
    const snippet = snippets.find((s) => s.id === snippetId)
    if (!snippet) return
    play('click')
    try {
      await navigator.clipboard.writeText(snippet.content)
      setCopiedId(snippetId)
      setTimeout(() => setCopiedId(null), 1800)
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={`companion-panel companion-panel--tools${style ? ' companion-panel--floating' : ''}`}
      style={style}
      role="dialog"
      aria-label={zh.companion.tools}
    >
      <div className="companion-panel__head">
        <h3 className="companion-panel__title">{zh.companion.tools}</h3>
        <button type="button" className="companion-panel__close cursor-pointer" onClick={onClose} aria-label={zh.companion.close}>
          <X size={16} />
        </button>
      </div>

      <div className="companion-panel__tabs">
        <button
          type="button"
          className={`companion-panel__tab cursor-pointer ${category === 'all' ? 'companion-panel__tab--active' : ''}`}
          onClick={() => setCategory('all')}
        >
          {zh.companion.all}
        </button>
        {aiToolCategories.map((c) => (
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
        {filtered.map((tool) => (
          <article key={tool.id} className="companion-tool">
            <div className="companion-tool__head">
              <h4 className="companion-tool__title">{tool.name}</h4>
              <div className="companion-tool__actions">
                {tool.snippetId && (
                  <button
                    type="button"
                    className="companion-tool__btn cursor-pointer"
                    onClick={() => copySnippet(tool.snippetId!)}
                    title={zh.companion.copyConfig}
                  >
                    {copiedId === tool.snippetId ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                )}
                {tool.url && (
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="companion-tool__btn cursor-pointer"
                    onClick={() => play('click')}
                    title={zh.companion.openLink}
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
            <p className="companion-tool__desc">{tool.description}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
