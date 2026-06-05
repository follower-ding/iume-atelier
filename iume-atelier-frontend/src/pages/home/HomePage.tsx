import { listArticles, searchArticles } from '@/api/article-api'
import type { Article } from '@/types/api'
import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [q, setQ] = useState('')

  useEffect(() => {
    listArticles().then(setArticles).catch(console.error)
  }, [])

  async function onSearch(e: FormEvent) {
    e.preventDefault()
    const data = q.trim() ? await searchArticles(q.trim()) : await listArticles()
    setArticles(data)
  }

  return (
    <section>
      <form onSubmit={onSearch} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索文章..." />
        <button className="btn" type="submit">搜索</button>
      </form>
      <div style={{ display: 'grid', gap: 16 }}>
        {articles.map((a) => (
          <article key={a.id} className="surface-card">
            <h3><Link to={`/articles/${a.slug}`}>{a.title}</Link></h3>
            <p style={{ color: 'var(--muted)' }}>{a.summary || '暂无摘要'}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(a.tags || []).map((t) => <span key={t} style={{ background: 'var(--accent-soft)', padding: '2px 8px', borderRadius: 999 }}>{t}</span>)}
            </div>
          </article>
        ))}
        {articles.length === 0 && <p>暂无文章，登录后台发布第一篇吧。</p>}
      </div>
    </section>
  )
}
