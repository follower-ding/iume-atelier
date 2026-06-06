import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Trash2, Edit, ExternalLink } from 'lucide-react'
import { adminApi } from '@/api'
import { ConsoleBatchBar } from '@/components/console/ConsoleChart'
import { zh } from '@/locales/zh'
import type { Article } from '@/types/api'

const PAGE_SIZE = 20
type StatusFilter = 'ALL' | 'DRAFT' | 'PUBLISHED'

export default function ConsoleArticlesPage() {
  const [searchParams] = useSearchParams()
  const initialStatus = (searchParams.get('status') as StatusFilter) || 'ALL'
  const [articles, setArticles] = useState<Article[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const load = () => {
    setLoading(true)
    const status = statusFilter === 'ALL' ? undefined : statusFilter
    adminApi
      .listArticles(page, PAGE_SIZE, status)
      .then((res) => {
        setArticles(res.records)
        setTotal(res.total)
        setSelected(new Set())
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [page, statusFilter])

  const handleDelete = async (id: number) => {
    if (!confirm(zh.studio.deleteConfirm)) return
    await adminApi.batchDeleteArticles([id])
    load()
  }

  const handleBatchDelete = async () => {
    if (!confirm(zh.console.batchDeleteConfirm.replace('{n}', String(selected.size)))) return
    await adminApi.batchDeleteArticles([...selected])
    load()
  }

  const handleBatchStatus = async (status: string) => {
    await adminApi.batchUpdateArticleStatus([...selected], status)
    load()
  }

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === articles.length) setSelected(new Set())
    else setSelected(new Set(articles.map((a) => a.id)))
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="console-page console-page--fill">
      <header className="console-page__header console-page__header--row">
        <div>
          <h1>{zh.console.articles}</h1>
          <p>{zh.console.articlesDesc}</p>
        </div>
        <Link to="/console/articles/new" className="btn-primary inline-flex items-center gap-2 cursor-pointer shrink-0">
          <Plus size={16} /> {zh.studio.newArticle}
        </Link>
      </header>

      <div className="console-panel">
        <div className="console-toolbar console-toolbar--compact">
          <div className="console-filter-group" role="tablist" aria-label={zh.studio.status}>
            {(['ALL', 'DRAFT', 'PUBLISHED'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={statusFilter === s}
                onClick={() => { setStatusFilter(s); setPage(1) }}
                className={`console-filter-pill cursor-pointer ${statusFilter === s ? 'console-filter-pill--active' : ''}`}
              >
                {s === 'ALL' ? zh.studio.filterAll : s === 'DRAFT' ? zh.studio.draft : zh.studio.published}
              </button>
            ))}
          </div>
        </div>

        <ConsoleBatchBar count={selected.size} onClear={() => setSelected(new Set())}>
          <button type="button" className="btn-ghost cursor-pointer" onClick={() => handleBatchStatus('PUBLISHED')}>
            {zh.console.batchPublish}
          </button>
          <button type="button" className="btn-ghost cursor-pointer" onClick={() => handleBatchStatus('DRAFT')}>
            {zh.console.batchDraft}
          </button>
          <button type="button" className="btn-ghost cursor-pointer" onClick={handleBatchDelete}>
            {zh.console.batchDelete}
          </button>
        </ConsoleBatchBar>

        {loading ? (
          <p className="console-panel__loading">{zh.articles.loading}</p>
        ) : (
          <div className="console-table-wrap console-table-wrap--fill">
          <table className="console-table">
            <thead>
              <tr>
                <th className="console-table__col-check">
                  <input type="checkbox" className="console-check" checked={articles.length > 0 && selected.size === articles.length} onChange={toggleSelectAll} aria-label={zh.console.batchDelete} />
                </th>
                <th className="console-table__col-title">{zh.studio.titlePlaceholder}</th>
                <th className="console-table__col-meta">{zh.console.author}</th>
                <th className="console-table__col-badge">{zh.studio.status}</th>
                <th className="console-table__col-num">{zh.article.reads}</th>
                <th className="console-table__col-actions">{zh.console.actions}</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id}>
                  <td className="console-table__col-check">
                    <input type="checkbox" className="console-check" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} aria-label={a.title} />
                  </td>
                  <td className="console-table__col-title">
                    <Link to={`/console/articles/${a.id}/edit`} className="console-table__title-link cursor-pointer" title={zh.studio.editArticle}>
                      {a.title}
                    </Link>
                  </td>
                  <td className="console-table__col-meta">{a.authorName}</td>
                  <td className="console-table__col-badge">
                    <span className={`console-badge ${a.status === 'PUBLISHED' ? 'console-badge--ok' : 'console-badge--warn'}`}>
                      <span className="console-badge__dot" aria-hidden="true" />
                      {a.status === 'PUBLISHED' ? zh.studio.published : zh.studio.draft}
                    </span>
                  </td>
                  <td className="console-table__col-num">{a.viewCount}</td>
                  <td className="console-table__col-actions">
                    <div className="console-row-actions">
                      {a.slug && (
                        <Link to={`/article/${a.slug}`} target="_blank" className="console-icon-btn cursor-pointer" title={zh.aiTools.viewDetail}>
                          <ExternalLink size={15} />
                        </Link>
                      )}
                      <Link to={`/console/articles/${a.id}/edit`} className="console-icon-btn cursor-pointer" title={zh.studio.editArticle}>
                        <Edit size={15} />
                      </Link>
                      <button type="button" onClick={() => handleDelete(a.id)} className="console-icon-btn console-icon-btn--danger cursor-pointer" title={zh.console.delete}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        <footer className="console-panel__footer">
          <span>{zh.console.tableTotal.replace('{n}', String(total))}</span>
          {totalPages > 1 && (
            <div className="console-pagination console-pagination--inline">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="console-pagination__btn cursor-pointer">{zh.articles.prevPage}</button>
              <span className="console-pagination__current">{page} / {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="console-pagination__btn cursor-pointer">{zh.articles.nextPage}</button>
            </div>
          )}
        </footer>
      </div>
    </div>
  )
}
