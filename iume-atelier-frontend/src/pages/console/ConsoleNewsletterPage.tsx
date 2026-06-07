import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { newsletterApi } from '@/api'
import { zh } from '@/locales/zh'

const PAGE_SIZE = 50

export default function ConsoleNewsletterPage() {
  const [emails, setEmails] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    newsletterApi.list(page, PAGE_SIZE)
      .then((res) => { setEmails(res.records); setTotal(res.total) })
      .catch(() => setEmails([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const exportCsv = async () => {
    const res = await newsletterApi.exportCsv()
    const blob = new Blob([res.data], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'newsletter-subscribers.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="console-page console-page--fill">
      <header className="console-page__header console-page__header--row">
        <div>
          <h1>{zh.console.newsletter}</h1>
          <p>{zh.console.newsletterDesc}</p>
        </div>
        <button type="button" onClick={exportCsv} className="btn-secondary inline-flex items-center gap-2 cursor-pointer">
          <Download size={16} />
          {zh.console.newsletterExport}
        </button>
      </header>

      <p className="console-section__meta mb-4">{zh.console.tableTotal.replace('{n}', String(total))}</p>

      <div className="console-table-wrap">
        <table className="console-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{zh.auth.email}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={2} className="console-table__empty">{zh.articles.loading}</td></tr>
            ) : emails.length === 0 ? (
              <tr><td colSpan={2} className="console-table__empty">{zh.console.newsletterEmpty}</td></tr>
            ) : emails.map((email, i) => (
              <tr key={email}>
                <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td>{email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="console-pagination">
          <button type="button" className="console-pagination__btn cursor-pointer" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{zh.articles.prevPage}</button>
          <span>{page} / {totalPages}</span>
          <button type="button" className="console-pagination__btn cursor-pointer" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>{zh.articles.nextPage}</button>
        </div>
      )}
    </div>
  )
}
