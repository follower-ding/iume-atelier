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
    <div className="console-page">
      <header className="console-page__header console-page__header--row">
        <div>
          <h1>{zh.console.articles}</h1>
          <p>{zh.console.articlesDesc}</p>
        </div>
        <Link to="/console/articles/new" className="btn-primary inline-flex items-center gap-2 cursor-pointer">
          <Plus size={18} /> {zh.studio.newArticle}
        </Link>
      </header>

      <div className="console-toolbar">
        {(['ALL', 'DRAFT', 'PUBLISHED'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`category-pill cursor-pointer ${statusFilter === s ? 'category-pill--active' : ''}`}
          >
            {s === 'ALL' ? zh.studio.filterAll : s === 'DRAFT' ? zh.studio.draft : zh.studio.published}
          </button>
        ))}
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
        <p className="text-secondary">{zh.articles.loading}</p>
      ) : (
        <div className="console-table-wrap">
          <table className="console-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={articles.length > 0 && selected.size === articles.length} onChange={toggleSelectAll} />
                </th>
                <th>{zh.studio.titlePlaceholder}</th>
                <th>{zh.console.author}</th>
                <th>{zh.studio.status}</th>
                <th>{zh.article.reads}</th>
                <th>{zh.console.actions}</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id}>
                  <td>
                    <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} />
                  </td>
                  <td className="console-table__title">{a.title}</td>
                  <td>{a.authorName}</td>
                  <td>
                    <span className={a.status === 'PUBLISHED' ? 'console-badge console-badge--ok' : 'console-badge console-badge--warn'}>
                      {a.status === 'PUBLISHED' ? zh.studio.published : zh.studio.draft}
                    </span>
                  </td>
                  <td>{a.viewCount}</td>
                  <td className="console-table__actions">
                    {a.slug && (
                      <Link to={`/article/${a.slug}`} target="_blank" className="console-icon-btn cursor-pointer">
                        <ExternalLink size={16} />
                      </Link>
                    )}
                    <Link to={`/console/articles/${a.id}/edit`} className="console-icon-btn cursor-pointer">
                      <Edit size={16} />
                    </Link>
                    <button type="button" onClick={() => handleDelete(a.id)} className="console-icon-btn cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="console-pagination">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-ghost cursor-pointer">{zh.articles.prevPage}</button>
          <span>{page} / {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-ghost cursor-pointer">{zh.articles.nextPage}</button>
        </div>
      )}
    </div>
  )
}
