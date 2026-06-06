import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import AiToolCard from '@/components/ai-tools/AiToolCard'
import EmptyState from '@/components/common/EmptyState'
import { aiToolCategories, filterAiTools, type AiToolFilter } from '@/data/ai-tools'
import { useAiTools } from '@/hooks/useAiTools'
import { useSnippetCopy } from '@/hooks/useSnippetCopy'
import { zh } from '@/locales/zh'

interface AiToolsBrowserProps {
  compact?: boolean
}

export default function AiToolsBrowser({ compact = false }: AiToolsBrowserProps) {
  const [category, setCategory] = useState<AiToolFilter>('all')
  const [keyword, setKeyword] = useState('')
  const { items, entries, loading } = useAiTools(category, keyword)
  const entryMap = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries])
  const { copiedId, copyText } = useSnippetCopy()

  const filtered = useMemo(() => {
    const list = filterAiTools(items, category, keyword)
    return [...list].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
  }, [items, category, keyword])

  return (
    <div className={compact ? 'ai-tools-browser ai-tools-browser--compact' : 'ai-tools-browser'}>
      <div className="ai-tools-browser__toolbar ai-tools-browser__toolbar--simple">
        <div className="ai-tools-browser__search">
          <Search size={16} className="ai-tools-browser__search-icon" />
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={zh.aiTools.searchPlaceholder}
            className="ai-tools-browser__search-input"
          />
        </div>
        <div className="ai-tools-browser__tabs" role="tablist">
          <button
            type="button"
            className={`ai-tools-browser__tab cursor-pointer ${category === 'all' ? 'ai-tools-browser__tab--active' : ''}`}
            onClick={() => setCategory('all')}
          >
            {zh.aiTools.all}
          </button>
          {aiToolCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`ai-tools-browser__tab cursor-pointer ${category === c.id ? 'ai-tools-browser__tab--active' : ''}`}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-secondary text-sm py-8">{zh.articles.loading}</p>
      ) : filtered.length === 0 ? (
        <EmptyState title={zh.aiTools.noResults} description={zh.aiTools.noResultsHint} />
      ) : (
        <div className={compact ? 'ai-tools-browser__grid ai-tools-browser__grid--compact' : 'ai-tools-browser__grid'}>
          {filtered.map((tool, i) => (
            <AiToolCard
              key={tool.id}
              tool={tool}
              index={i}
              copiedId={copiedId}
              onCopy={copyText}
              primaryConfig={entryMap.get(tool.id)?.detail.configs?.[0]}
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  )
}
