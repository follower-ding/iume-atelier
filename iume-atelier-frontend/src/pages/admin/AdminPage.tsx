import { deleteArticle, listAdminArticles, saveArticle } from '@/api/article-api'
import type { Article } from '@/types/api'
import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const emptyForm = {
  title: '',
  summary: '',
  contentMd: '# 新文章\n',
  status: 'DRAFT',
  tagNames: [] as string[],
}

export default function AdminPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tagsInput, setTagsInput] = useState('')

  async function refresh() {
    setArticles(await listAdminArticles())
  }

  useEffect(() => { refresh().catch(console.error) }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = {
      ...form,
      tagNames: tagsInput.split(',').map((s) => s.trim()).filter(Boolean),
    }
    await saveArticle(payload, editingId ?? undefined)
    setForm(emptyForm)
    setTagsInput('')
    setEditingId(null)
    await refresh()
  }

  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <div className="surface-card">
        <h2>{editingId ? '编辑文章' : '新建文章'}</h2>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <input className="input" placeholder="标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="input" placeholder="摘要" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          <input className="input" placeholder="标签，逗号分隔" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="DRAFT">草稿</option>
            <option value="PUBLISHED">发布</option>
          </select>
          <textarea className="textarea" value={form.contentMd} onChange={(e) => setForm({ ...form, contentMd: e.target.value })} />
          <button className="btn" type="submit">{editingId ? '保存' : '创建'}</button>
        </form>
      </div>
      <div className="surface-card">
        <h2>文章管理</h2>
        {articles.map((a) => (
          <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <strong>{a.title}</strong>
              <div style={{ color: 'var(--muted)' }}>{a.status}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {a.status === 'PUBLISHED' && <Link to={`/articles/${a.slug}`}>预览</Link>}
              <button className="btn secondary" onClick={() => {
                setEditingId(a.id)
                setForm({ title: a.title, summary: a.summary || '', contentMd: a.contentMd || '', status: a.status, tagNames: a.tags || [] })
                setTagsInput((a.tags || []).join(', '))
              }}>编辑</button>
              <button className="btn secondary" onClick={async () => { await deleteArticle(a.id); await refresh() }}>删除</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
