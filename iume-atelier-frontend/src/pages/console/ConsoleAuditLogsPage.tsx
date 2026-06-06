import { useEffect, useState } from 'react'
import { adminApi, type AdminAuditLog } from '@/api'
import { zh } from '@/locales/zh'

const PAGE_SIZE = 20

const actionLabels: Record<string, string> = {
  CREATE_USER: zh.console.logCreateUser,
  UPDATE_USER: zh.console.logUpdateUser,
  DELETE_USER: zh.console.logDeleteUser,
  BATCH_DELETE_USERS: zh.console.logBatchDeleteUsers,
  BATCH_DELETE_ARTICLES: zh.console.logBatchDeleteArticles,
  BATCH_DELETE_COMMENTS: zh.console.logBatchDeleteComments,
  BATCH_UPDATE_ARTICLE_STATUS: zh.console.logBatchUpdateStatus,
}

export default function ConsoleAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    adminApi
      .listAuditLogs(page, PAGE_SIZE)
      .then((res) => {
        setLogs(res.records)
        setTotal(res.total)
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="console-page">
      <header className="console-page__header">
        <h1>{zh.console.auditLogs}</h1>
        <p>{zh.console.auditLogsDesc}</p>
      </header>

      {loading ? (
        <p className="text-secondary">{zh.articles.loading}</p>
      ) : (
        <div className="console-table-wrap">
          <table className="console-table" data-testid="console-audit-table">
            <thead>
              <tr>
                <th>{zh.console.logTime}</th>
                <th>{zh.console.logAdmin}</th>
                <th>{zh.console.logAction}</th>
                <th>{zh.console.logResource}</th>
                <th>{zh.console.logDetail}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString('zh-CN')}</td>
                  <td>{log.adminUsername}</td>
                  <td>{actionLabels[log.action] ?? log.action}</td>
                  <td>{log.resourceType}{log.resourceId ? ` #${log.resourceId}` : ''}</td>
                  <td className="console-table__content">{log.detail ?? '—'}</td>
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
