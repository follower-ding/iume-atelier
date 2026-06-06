import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { adminApi } from '@/api'
import type { AdminComment } from '@/api'
import { ConsoleBatchBar } from '@/components/console/ConsoleChart'
import { zh } from '@/locales/zh'

const PAGE_SIZE = 20

export default function ConsoleCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const load = () => {
    setLoading(true)
    adminApi
      .listComments(page, PAGE_SIZE)
      .then((res) => {
        setComments(res.records)
        setTotal(res.total)
        setSelected(new Set())
      })
      .catch(() => setComments([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [page])

  const handleDelete = async (id: number) => {
    if (!confirm(zh.article.deleteCommentConfirm)) return
    await adminApi.batchDeleteComments([id])
    load()
  }

  const handleBatchDelete = async () => {
    if (!confirm(zh.console.batchDeleteConfirm.replace('{n}', String(selected.size)))) return
    await adminApi.batchDeleteComments([...selected])
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
    if (selected.size === comments.length) setSelected(new Set())
    else setSelected(new Set(comments.map((c) => c.id)))
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="console-page console-page--fill">
      <header className="console-page__header">
        <h1>{zh.console.comments}</h1>
        <p>{zh.console.commentsDesc}</p>
      </header>

      <div className="console-panel">
        <ConsoleBatchBar count={selected.size} onClear={() => setSelected(new Set())}>
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
                <th>
                  <input type="checkbox" checked={comments.length > 0 && selected.size === comments.length} onChange={toggleSelectAll} />
                </th>
                <th>{zh.console.commentContent}</th>
                <th>{zh.console.commentAuthor}</th>
                <th>{zh.console.commentArticle}</th>
                <th>{zh.console.commentTime}</th>
                <th>{zh.console.actions}</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c.id}>
                  <td>
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} />
                  </td>
                  <td className="console-table__content">{c.content}</td>
                  <td>{c.nickname || c.username || c.userId}</td>
                  <td>
                    {c.articleSlug ? (
                      <Link to={`/article/${c.articleSlug}`} target="_blank" className="prose-link cursor-pointer">
                        {c.articleTitle || c.articleSlug}
                      </Link>
                    ) : (
                      c.articleId
                    )}
                  </td>
                  <td>{new Date(c.createdAt).toLocaleString('zh-CN')}</td>
                  <td>
                    <button type="button" onClick={() => handleDelete(c.id)} className="console-icon-btn cursor-pointer">
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
          <div className="console-pagination console-pagination--panel">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="console-pagination__btn cursor-pointer">{zh.articles.prevPage}</button>
            <span>{page} / {totalPages}</span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="console-pagination__btn cursor-pointer">{zh.articles.nextPage}</button>
          </div>
        )}
      </div>
    </div>
  )
}
