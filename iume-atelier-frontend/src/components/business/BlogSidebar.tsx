import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Flame, Sparkles, TrendingUp } from 'lucide-react'
import FloatingTagCloud from '@/components/interactive/FloatingTagCloud'
import { articleApi, categoryApi, tagApi } from '@/api'
import { sortCategories } from '@/utils/categories'
import { zh } from '@/locales/zh'
import type { Article, Category, Tag } from '@/types/api'

interface BlogSidebarProps {
  position: 'left' | 'right'
}

export default function BlogSidebar({ position }: BlogSidebarProps) {
  const [searchParams] = useSearchParams()
  const activeTagId = searchParams.get('tag') ? Number(searchParams.get('tag')) : undefined
  const activeCategoryId = searchParams.get('category') ? Number(searchParams.get('category')) : undefined
  const activeSort = searchParams.get('sort') || 'latest'
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [latest, setLatest] = useState<Article[]>([])
  const [popular, setPopular] = useState<Article[]>([])

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {})
    tagApi.list().then(setTags).catch(() => {})
    articleApi.list(1, 5, undefined, undefined, 'latest').then((r) => setLatest(r.records)).catch(() => {})
    articleApi.list(1, 5, undefined, undefined, 'popular').then((r) => setPopular(r.records)).catch(() => {})
  }, [])

  if (position === 'left') {
    return (
      <nav className="sidebar-panel sticky top-20">
        <h3 className="sidebar-panel__title">{zh.sidebar.browse}</h3>
        <ul className="sidebar-panel__list">
          <li>
            <Link
              to="/articles?sort=latest"
              className={`sidebar-link cursor-pointer ${activeSort === 'latest' && !activeTagId ? 'sidebar-link--active' : ''}`}
            >
              <Sparkles size={15} /> {zh.sidebar.latest}
            </Link>
          </li>
          <li>
            <Link
              to="/articles?sort=popular"
              className={`sidebar-link cursor-pointer ${activeSort === 'popular' && !activeTagId ? 'sidebar-link--active' : ''}`}
            >
              <Flame size={15} /> {zh.sidebar.popular}
            </Link>
          </li>
        </ul>

        {categories.length > 0 && (
          <>
            <h3 className="sidebar-panel__title mt-8">{zh.sidebar.categories}</h3>
            <ul className="sidebar-panel__tags">
              {sortCategories(categories).map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/articles?category=${c.id}`}
                    className={`sidebar-tag cursor-pointer ${activeCategoryId === c.id ? 'sidebar-tag--active' : ''}`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {tags.length > 0 && (
          <>
            <h3 className="sidebar-panel__title mt-8">{zh.sidebar.tagCloud}</h3>
            <FloatingTagCloud tags={tags} activeTagId={activeTagId} />
            <ul className="sidebar-panel__tags sidebar-panel__tags--fallback mt-4">
              {tags.map((t) => (
                <li key={t.id}>
                  <Link
                    to={`/articles?tag=${t.id}`}
                    className={`sidebar-tag cursor-pointer ${activeTagId === t.id ? 'sidebar-tag--active' : ''}`}
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <h3 className="sidebar-panel__title mt-8">{zh.sidebar.explore}</h3>
        <ul className="sidebar-panel__list">
          <li><Link to="/about" className="sidebar-link cursor-pointer">{zh.nav.about}</Link></li>
          <li><Link to="/projects" className="sidebar-link cursor-pointer">{zh.nav.projects}</Link></li>
          <li><Link to="/tools" className="sidebar-link cursor-pointer">{zh.nav.toolsPage}</Link></li>
        </ul>
      </nav>
    )
  }

  return (
    <aside className="sidebar-panel sticky top-20 space-y-8">
      <div>
        <h3 className="sidebar-panel__title flex items-center gap-1.5">
          <TrendingUp size={15} /> {zh.sidebar.hotArticles}
        </h3>
        <ul className="sidebar-articles">
          {popular.map((a) => (
            <li key={a.id}>
              <Link to={`/article/${a.slug}`} className="sidebar-article-link cursor-pointer">
                <span className="line-clamp-2">{a.title}</span>
                <span className="sidebar-article-meta">{a.viewCount} {zh.article.reads}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="sidebar-panel__title">{zh.sidebar.newArticles}</h3>
        <ul className="sidebar-articles">
          {latest.map((a) => (
            <li key={a.id}>
              <Link to={`/article/${a.slug}`} className="sidebar-article-link cursor-pointer">
                <span className="line-clamp-2">{a.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
