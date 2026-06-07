import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { authorApi } from '@/api'
import ArticleCard from '@/components/business/ArticleCard'
import BlogShell from '@/components/layout/BlogShell'
import PageMeta from '@/components/seo/PageMeta'
import { zh } from '@/locales/zh'
import type { Article, User } from '@/types/api'

export default function AuthorPage() {
  const { id } = useParams<{ id: string }>()
  const authorId = Number(id)
  const [author, setAuthor] = useState<User | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authorId) return
    Promise.all([
      authorApi.get(authorId),
      authorApi.articles(authorId, 1, 20),
    ])
      .then(([user, page]) => {
        setAuthor(user)
        setArticles(page.records)
      })
      .catch(() => {
        setAuthor(null)
        setArticles([])
      })
      .finally(() => setLoading(false))
  }, [authorId])

  if (loading) {
    return <div className="page-container py-20 text-center text-secondary">{zh.articles.loading}</div>
  }

  if (!author) {
    return (
      <div className="page-container py-20 text-center">
        <h1 className="section-title">{zh.notFound.title}</h1>
        <Link to="/" className="btn-secondary mt-6 inline-block cursor-pointer">{zh.notFound.backHome}</Link>
      </div>
    )
  }

  return (
    <>
      <PageMeta title={`${author.nickname} — ${zh.authors.title}`} description={zh.authors.subtitle} />
      <section className="page-container py-10 lg:py-14">
        <BlogShell>
          <div className="author-header mb-10">
            <div className="author-header__avatar" aria-hidden="true">
              {(author.nickname || author.username).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{zh.authors.label}</p>
              <h1 className="section-title">{author.nickname || author.username}</h1>
              <p className="mt-1 text-sm text-secondary">@{author.username}</p>
            </div>
          </div>
          <h2 className="text-lg font-bold mb-6">{zh.authors.articles}</h2>
          <div className="article-list article-list--wide">
            {articles.map((a, i) => (
              <ArticleCard key={a.id} article={a} index={i} />
            ))}
          </div>
          {articles.length === 0 && <p className="text-secondary">{zh.articles.empty}</p>}
        </BlogShell>
      </section>
    </>
  )
}
