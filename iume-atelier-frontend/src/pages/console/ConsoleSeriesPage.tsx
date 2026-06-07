import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { seriesApi, type Series } from '@/api'
import { zh } from '@/locales/zh'

export default function ConsoleSeriesPage() {
  const [items, setItems] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Series | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')

  const load = () => {
    setLoading(true)
    seriesApi.manage(1, 50)
      .then((res) => setItems(res.records))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setTitle('')
    setSlug('')
    setDescription('')
    setShowForm(true)
  }

  const openEdit = (s: Series) => {
    setEditing(s)
    setTitle(s.title)
    setSlug(s.slug)
    setDescription(s.description || '')
    setShowForm(true)
  }

  const save = async () => {
    const body = { title, slug: slug || undefined, description }
    if (editing) await seriesApi.update(editing.id, body)
    else await seriesApi.create(body)
    setShowForm(false)
    load()
  }

  const remove = async (id: number) => {
    if (!confirm(zh.studio.deleteConfirm)) return
    await seriesApi.remove(id)
    load()
  }

  return (
    <div className="console-page console-page--fill">
      <header className="console-page__header console-page__header--row">
        <div>
          <h1>{zh.console.series}</h1>
          <p>{zh.console.seriesDesc}</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary inline-flex items-center gap-2 cursor-pointer">
          <Plus size={16} />
          {zh.console.seriesNew}
        </button>
      </header>

      {showForm && (
        <div className="console-section mb-6">
          <h2 className="console-section__title">{editing ? zh.console.seriesEdit : zh.console.seriesNew}</h2>
          <div className="space-y-3 max-w-lg">
            <input className="console-input w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={zh.console.seriesTitle} />
            <input className="console-input w-full" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug（可选）" />
            <textarea className="console-input w-full min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={zh.console.seriesDescription} />
            <div className="flex gap-2">
              <button type="button" onClick={save} className="btn-primary cursor-pointer">{zh.console.save}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary cursor-pointer">{zh.console.cancel}</button>
            </div>
          </div>
        </div>
      )}

      <div className="console-table-wrap">
        <table className="console-table">
          <thead>
            <tr>
              <th>{zh.console.seriesTitle}</th>
              <th>slug</th>
              <th>{zh.console.seriesArticleCount}</th>
              <th>{zh.console.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="console-table__empty">{zh.articles.loading}</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="console-table__empty">{zh.console.seriesEmpty}</td></tr>
            ) : items.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td><code className="console-code">{s.slug}</code></td>
                <td>{s.articleCount ?? 0}</td>
                <td>
                  <div className="console-row-actions">
                    <Link to={`/series/${s.slug}`} target="_blank" className="console-icon-btn cursor-pointer"><ExternalLink size={15} /></Link>
                    <button type="button" className="console-icon-btn cursor-pointer" onClick={() => openEdit(s)}><Edit size={15} /></button>
                    <button type="button" className="console-icon-btn console-icon-btn--danger cursor-pointer" onClick={() => remove(s.id)}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
