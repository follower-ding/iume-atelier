import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Trash2, Edit, ExternalLink } from 'lucide-react'
import PageMeta from '@/components/seo/PageMeta'
import { articleApi } from '@/api'
import { useAuthStore } from '@/store'
import { zh } from '@/locales/zh'
import type { Article } from '@/types/api'

const PAGE_SIZE = 20
type StatusFilter = 'ALL' | 'DRAFT' | 'PUBLISHED'

export default function StudioPage() {
  const { initialized, user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const initialStatus = (searchParams.get('status') as StatusFilter) || 'ALL'
  const [articles, setArticles] = useState<Article[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const status = statusFilter === 'ALL' ? undefined : statusFilter
    articleApi
      .manage(page, PAGE_SIZE, status)
      .then((res) => {
        setArticles(res.records)
        setTotal(res.total)
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!initialized || !user) return
    load()
  }, [page, statusFilter, initialized, user])

  const handleDelete = async (id: number) => {
    if (!confirm(zh.studio.deleteConfirm)) return
    await articleApi.remove(id)
    load()
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      <PageMeta title={zh.studio.title} description={zh.studio.subtitle} />
      <section className="studio-list">
        <div className="studio-list__inner">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl">{zh.studio.title}</h1>
            <p className="text-secondary mt-1">{zh.studio.subtitle}</p>
          </div>
          <Link to="/studio/new" className="btn-primary inline-flex items-center gap-2 cursor-pointer">
            <Plus size={18} /> {zh.studio.newArticle}
          </Link>
        </header>

        <div className="flex flex-wrap gap-2 mb-6">
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

        {loading ? (
          <p className="text-secondary">{zh.articles.loading}</p>
        ) : articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-secondary mb-4">{zh.studio.emptyArticles}</p>
            <Link to="/studio/new" className="btn-primary inline-flex items-center gap-2 cursor-pointer">
              <Plus size={18} /> {zh.studio.newArticle}
            </Link>
          </div>
        ) : (
          <div className="studio-table-wrap">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>{zh.studio.titlePlaceholder}</th>
                  <th>{zh.studio.status}</th>
                  <th>{zh.article.reads}</th>
                  <th>{zh.console.actions}</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.id}>
                    <td className="studio-table__title">{a.title}</td>
                    <td>
                      <span className={a.status === 'PUBLISHED' ? 'studio-badge studio-badge--ok' : 'studio-badge studio-badge--warn'}>
                        {a.status === 'PUBLISHED' ? zh.studio.published : zh.studio.draft}
                      </span>
                    </td>
                    <td>{a.viewCount}</td>
                    <td className="studio-table__actions">
                      {a.slug && a.status === 'PUBLISHED' && (
                        <Link to={`/article/${a.slug}`} target="_blank" className="studio-icon-btn cursor-pointer">
                          <ExternalLink size={16} />
                        </Link>
                      )}
                      <Link to={`/studio/${a.id}/edit`} className="studio-icon-btn cursor-pointer">
                        <Edit size={16} />
                      </Link>
                      <button type="button" onClick={() => handleDelete(a.id)} className="studio-icon-btn cursor-pointer">
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
          <div className="flex items-center justify-center gap-4 mt-8 text-sm text-secondary">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-ghost cursor-pointer">{zh.articles.prevPage}</button>
            <span>{page} / {totalPages}</span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-ghost cursor-pointer">{zh.articles.nextPage}</button>
          </div>
        )}
        </div>
      </section>
    </>
  )
}
