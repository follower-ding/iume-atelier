import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, type AdminStats } from '@/api'
import ConsoleTrendChart from '@/components/console/ConsoleChart'
import { zh } from '@/locales/zh'

export default function ConsoleDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    adminApi.stats().then(setStats).catch(() => setStats(null))
  }, [])

  const cards = stats
    ? [
        { label: zh.console.statUsers, value: stats.userCount, to: '/console/users' },
        { label: zh.console.statArticles, value: stats.articleCount, to: '/console/articles' },
        { label: zh.console.statPublished, value: stats.publishedCount, to: '/console/articles?status=PUBLISHED' },
        { label: zh.console.statDrafts, value: stats.draftCount, to: '/console/articles?status=DRAFT' },
        { label: zh.console.statComments, value: stats.commentCount, to: '/console/comments' },
        { label: zh.console.statCategories, value: stats.categoryCount, to: '/console/taxonomy' },
        { label: zh.console.statTags, value: stats.tagCount, to: '/console/taxonomy' },
      ]
    : []

  return (
    <div className="console-page">
      <header className="console-page__header">
        <h1 data-testid="console-dashboard-title">{zh.console.dashboard}</h1>
        <p>{zh.console.dashboardDesc}</p>
      </header>

      {!stats ? (
        <p className="text-secondary">{zh.articles.loading}</p>
      ) : (
        <>
          <div className="console-stat-grid" data-testid="console-stat-grid">
            {cards.map((c) => (
              <Link key={c.label} to={c.to} className="console-stat-card cursor-pointer">
                <div className="console-stat-card__value">{c.value}</div>
                <div className="console-stat-card__label">{c.label}</div>
              </Link>
            ))}
          </div>

          <section className="console-charts-section">
            <h2 className="console-charts-section__title">{zh.console.trendTitle}</h2>
            <div className="console-charts-grid">
              <ConsoleTrendChart title={zh.console.trendUsers} data={stats.userTrend} color="#6366f1" />
              <ConsoleTrendChart title={zh.console.trendArticles} data={stats.articleTrend} color="#22c55e" />
              <ConsoleTrendChart title={zh.console.trendComments} data={stats.commentTrend} color="#f59e0b" />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
