import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { aiToolApi } from '@/api'
import AiToolChatPanel from '@/components/console/AiToolChatPanel'
import { aiToolCategories } from '@/data/ai-tools'
import { zh } from '@/locales/zh'
import type { AiToolDto } from '@/types/ai-tool-api'

const PAGE_SIZE = 20

export default function ConsoleAiToolsPage() {
  const [tools, setTools] = useState<AiToolDto[]>([])
  const [category, setCategory] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    aiToolApi
      .page(page, PAGE_SIZE, category === 'all' ? undefined : category, keyword || undefined)
      .then((res) => {
        setTools(res.records)
        setTotal(res.total)
      })
      .catch(() => setTools([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [page, category, keyword])

  const handleDelete = async (slug: string) => {
    if (!confirm(zh.studio.deleteConfirm)) return
    await aiToolApi.remove(slug)
    load()
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="console-page console-page--fill">
      <header className="console-page__header console-page__header--row">
        <div>
          <h1>{zh.console.aiTools}</h1>
          <p>{zh.console.aiToolsDesc}</p>
        </div>
        <Link to="/console/ai-tools/new" className="btn-primary inline-flex items-center gap-2 cursor-pointer shrink-0">
          <Plus size={16} />
          {zh.console.newAiTool}
        </Link>
      </header>

      <div className="console-ai-tools-grid">
        <section className="console-section" aria-labelledby="ai-tools-list-heading">
          <div className="console-section__head">
            <h2 id="ai-tools-list-heading" className="console-section__title">{zh.console.aiToolsList}</h2>
            {!loading && (
              <span className="console-section__meta">{total} {zh.console.aiToolsCountUnit}</span>
            )}
          </div>

          <div className="console-toolbar console-toolbar--stacked">
            <input
              className="console-input console-input--search"
              placeholder={zh.aiTools.searchPlaceholder}
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
            />
            <div className="console-filter-group">
              <button
                type="button"
                className={`console-filter-pill cursor-pointer ${category === 'all' ? 'console-filter-pill--active' : ''}`}
                onClick={() => { setCategory('all'); setPage(1) }}
              >
                {zh.aiTools.all}
              </button>
              {aiToolCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`console-filter-pill cursor-pointer ${category === c.id ? 'console-filter-pill--active' : ''}`}
                  onClick={() => { setCategory(c.id); setPage(1) }}
                >
                  {c.label}
                </button>
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
                {loading ? (
                  <tr><td colSpan={4} className="console-table__empty">{zh.articles.loading}</td></tr>
                ) : tools.length === 0 ? (
                  <tr><td colSpan={4} className="console-table__empty">{zh.console.aiToolsEmpty}</td></tr>
                ) : tools.map((tool) => (
                  <tr key={tool.slug}>
                    <td className="console-table__col-title">
                      <Link to={`/console/ai-tools/${tool.slug}/edit`} className="console-table__name console-table__title-link cursor-pointer">
                        <span className="console-table__icon" aria-hidden="true">{tool.icon}</span>
                        <span>{tool.name}</span>
                        {tool.featured && <span className="console-table__star" title="featured">★</span>}
                      </Link>
                    </td>
                    <td className="console-table__col-badge"><span className="console-badge console-badge--muted">{tool.category}</span></td>
                    <td className="console-table__col-slug"><code className="console-code">{tool.slug}</code></td>
                    <td className="console-table__col-actions">
                      <div className="console-row-actions">
                        <Link to={`/tools/${tool.slug}`} target="_blank" className="console-icon-btn cursor-pointer" title={zh.aiTools.viewDetail}>
                          <ExternalLink size={15} />
                        </Link>
                        <Link to={`/console/ai-tools/${tool.slug}/edit`} className="console-icon-btn cursor-pointer" title={zh.console.editAiTool}>
                          <Edit size={15} />
                        </Link>
                        <button type="button" className="console-icon-btn console-icon-btn--danger cursor-pointer" onClick={() => handleDelete(tool.slug)} title={zh.console.delete}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="console-pagination console-pagination--panel">
              <button type="button" className="console-pagination__btn cursor-pointer" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{zh.articles.prevPage}</button>
              <span>{page} / {totalPages}</span>
              <button type="button" className="console-pagination__btn cursor-pointer" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>{zh.articles.nextPage}</button>
            </div>
          )}
        </section>

        <aside className="console-ai-tools-aside">
          <AiToolChatPanel onSaved={load} compact />
        </aside>
      </div>
    </div>
  )
}
