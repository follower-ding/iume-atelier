import { getArticle } from '@/api/article-api'
import type { Article } from '@/types/api'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function ArticleDetailPage() {
  const { slug } = useParams()
  const [article, setArticle] = useState<Article | null>(null)

  useEffect(() => {
    if (slug) getArticle(slug).then(setArticle).catch(console.error)
  }, [slug])

  if (!article) return <p>加载中...</p>

  return (
    <article className="surface-card">
      <h2>{article.title}</h2>
      <p style={{ color: 'var(--muted)' }}>{article.authorName} · 阅读 {article.viewCount}</p>
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: article.contentHtml || '' }} />
    </article>
  )
}
