import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { adminApi } from '@/api'
import { ConsoleBatchBar } from '@/components/console/ConsoleChart'
import { zh } from '@/locales/zh'
import type { User } from '@/types/api'

const PAGE_SIZE = 20

export default function ConsoleUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [keyword, setKeyword] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    nickname: '',
    role: 'USER',
  })

  const load = () => {
    setLoading(true)
    adminApi
      .listUsers(page, PAGE_SIZE, search || undefined)
      .then((res) => {
        setUsers(res.records)
        setTotal(res.total)
        setSelected(new Set())
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [page, search])

  const handleRoleChange = async (user: User, role: string) => {
    try {
      await adminApi.updateUser(user.id, { role })
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : zh.console.saveFailed)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm(zh.console.deleteUserConfirm)) return
    try {
      await adminApi.removeUser(id)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : zh.console.deleteFailed)
    }
  }

  const handleBatchDelete = async () => {
    if (!confirm(zh.console.batchDeleteConfirm.replace('{n}', String(selected.size)))) return
    try {
      await adminApi.batchDeleteUsers([...selected])
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : zh.console.deleteFailed)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await adminApi.createUser(form)
      setShowCreate(false)
      setForm({ username: '', password: '', email: '', nickname: '', role: 'USER' })
      setPage(1)
      setSearch('')
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : zh.console.saveFailed)
    } finally {
      setCreating(false)
    }
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
    if (selected.size === users.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(users.map((u) => u.id)))
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="console-page">
      <header className="console-page__header console-page__header--row">
        <div>
          <h1>{zh.console.users}</h1>
          <p>{zh.console.usersDesc}</p>
        </div>
        <button
          type="button"
          className="btn-primary inline-flex items-center gap-2 cursor-pointer"
          onClick={() => setShowCreate(true)}
          data-testid="console-create-user-btn"
        >
          <Plus size={18} /> {zh.console.createUser}
        </button>
      </header>

      <div className="console-toolbar">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={zh.console.searchUsers}
          className="console-input"
          onKeyDown={(e) => e.key === 'Enter' && (setPage(1), setSearch(keyword))}
        />
        <button type="button" className="btn-primary cursor-pointer" onClick={() => { setPage(1); setSearch(keyword) }}>
          {zh.search.button}
        </button>
      </div>

      <ConsoleBatchBar count={selected.size} onClear={() => setSelected(new Set())}>
        <button type="button" className="btn-ghost cursor-pointer" onClick={handleBatchDelete} data-testid="console-batch-delete-users">
          {zh.console.batchDelete}
        </button>
      </ConsoleBatchBar>

      {loading ? (
        <p className="text-secondary">{zh.articles.loading}</p>
      ) : (
        <div className="console-table-wrap">
          <table className="console-table" data-testid="console-users-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={users.length > 0 && selected.size === users.length} onChange={toggleSelectAll} />
                </th>
                <th>ID</th>
                <th>{zh.auth.username}</th>
                <th>{zh.auth.nickname}</th>
                <th>{zh.auth.email}</th>
                <th>{zh.console.role}</th>
                <th>{zh.console.actions}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleSelect(u.id)} />
                  </td>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.nickname}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      className="console-select"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td>
                    <button type="button" className="console-icon-btn cursor-pointer" onClick={() => handleDelete(u.id)} title={zh.console.delete}>
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

      {showCreate && (
        <div className="console-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="console-modal" onClick={(e) => e.stopPropagation()} data-testid="console-create-user-modal">
            <h2>{zh.console.createUser}</h2>
            <form onSubmit={handleCreate} className="console-modal__form">
              <input
                required
                minLength={3}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder={zh.auth.username}
                className="console-input"
                data-testid="console-create-username"
              />
              <input
                required
                minLength={6}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={zh.auth.password}
                className="console-input"
                data-testid="console-create-password"
              />
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={zh.auth.email}
                className="console-input"
                data-testid="console-create-email"
              />
              <input
                required
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                placeholder={zh.auth.nickname}
                className="console-input"
                data-testid="console-create-nickname"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="console-select"
                data-testid="console-create-role"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <div className="console-modal__actions">
                <button type="button" className="btn-ghost cursor-pointer" onClick={() => setShowCreate(false)}>
                  {zh.console.cancel}
                </button>
                <button type="submit" disabled={creating} className="btn-primary cursor-pointer" data-testid="console-create-submit">
                  {creating ? zh.auth.loggingIn : zh.console.createUser}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
