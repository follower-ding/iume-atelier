import { useMemo, useState } from 'react'
import { ExternalLink, Github } from 'lucide-react'
import { Link } from 'react-router-dom'
import AiToolChatPanel from '@/components/console/AiToolChatPanel'
import { aiToolCategories } from '@/data/ai-tools'
import { useAiTools } from '@/hooks/useAiTools'
import { zh } from '@/locales/zh'

const CATALOG_REPO = 'https://github.com/follower-ding/iume-ai-catalog'

export default function ConsoleAiToolsPage() {
  const { entries } = useAiTools()
  const [category, setCategory] = useState('all')
  const [keyword, setKeyword] = useState('')

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return entries.filter((tool) => {
      if (category !== 'all' && tool.category !== category) return false
      if (!q) return true
      return (
        tool.name.toLowerCase().includes(q)
        || tool.description.toLowerCase().includes(q)
        || tool.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [entries, category, keyword])

  return (
    <div className="console-page console-page--fill">
      <header className="console-page__header console-page__header--row">
        <div>
          <h1>{zh.console.aiTools}</h1>
          <p>{zh.console.aiToolsCatalogDesc}</p>
        </div>
        <a href={CATALOG_REPO} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center gap-2 cursor-pointer shrink-0">
          <Github size={16} />
          {zh.console.aiToolsEditCatalog}
        </a>
      </header>

      <div className="console-callout console-callout--info mb-6">
        <p>{zh.console.aiToolsCatalogHint}</p>
        <p className="mt-2 text-sm text-secondary">{zh.console.aiToolsCatalogWorkflow}</p>
      </div>

      <div className="console-ai-tools-grid">
        <section className="console-section" aria-labelledby="ai-tools-list-heading">
          <div className="console-section__head">
            <h2 id="ai-tools-list-heading" className="console-section__title">{zh.console.aiToolsList}</h2>
            <span className="console-section__meta">{filtered.length} {zh.console.aiToolsCountUnit}</span>
          </div>

          <div className="console-toolbar console-toolbar--stacked">
            <input
              className="console-input console-input--search"
              placeholder={zh.aiTools.searchPlaceholder}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <div className="console-filter-group">
              <button type="button" className={`console-filter-pill cursor-pointer ${category === 'all' ? 'console-filter-pill--active' : ''}`} onClick={() => setCategory('all')}>{zh.aiTools.all}</button>
              {aiToolCategories.map((c) => (
                <button key={c.id} type="button" className={`console-filter-pill cursor-pointer ${category === c.id ? 'console-filter-pill--active' : ''}`} onClick={() => setCategory(c.id)}>{c.label}</button>
              ))}
            </div>
          </div>

          <div className="console-table-wrap console-table-wrap--fill">
            <table className="console-table">
              <thead>
                <tr>
                  <th className="console-table__col-title">{zh.console.aiToolName}</th>
                  <th className="console-table__col-badge">{zh.console.aiToolCategory}</th>
                  <th className="console-table__col-slug">slug</th>
                  <th className="console-table__col-actions">{zh.console.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} className="console-table__empty">{zh.console.aiToolsEmpty}</td></tr>
                ) : filtered.map((tool) => (
                  <tr key={tool.id}>
                    <td className="console-table__col-title">
                      <span className="console-table__name">
                        <span className="console-table__icon" aria-hidden="true">{tool.icon}</span>
                        <span>{tool.name}</span>
                        {tool.featured && <span className="console-table__star" title="featured">★</span>}
                      </span>
                    </td>
                    <td className="console-table__col-badge"><span className="console-badge console-badge--muted">{tool.category}</span></td>
                    <td className="console-table__col-slug"><code className="console-code">{tool.id}</code></td>
                    <td className="console-table__col-actions">
                      <div className="console-row-actions">
                        <Link to={`/tools/${tool.id}`} target="_blank" className="console-icon-btn cursor-pointer" title={zh.aiTools.viewDetail}>
                          <ExternalLink size={15} />
                        </Link>
                        <a href={`${CATALOG_REPO}/blob/main/entries/${tool.id}.json`} target="_blank" rel="noopener noreferrer" className="console-icon-btn cursor-pointer" title={zh.console.aiToolsEditCatalog}>
                          <Github size={15} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="console-ai-tools-aside">
          <AiToolChatPanel compact />
          <p className="mt-3 text-xs text-secondary">{zh.console.aiToolChatCatalogNote}</p>
        </aside>
      </div>
    </div>
  )
}
