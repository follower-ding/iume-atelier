import { useEffect, useState } from 'react'
import { analyticsApi, type AnalyticsOverview } from '@/api'
import ConsoleTrendChart from '@/components/console/ConsoleChart'
import { zh } from '@/locales/zh'
import { Link } from 'react-router-dom'

export default function ConsoleAnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null)

  useEffect(() => {
    analyticsApi.overview().then(setData).catch(() => setData(null))
  }, [])

  if (!data) {
    return (
      <div className="console-page">
        <p className="text-secondary">{zh.articles.loading}</p>
      </div>
    )
  }

  return (
    <div className="console-page console-page--fill">
      <header className="console-page__header">
        <h1>{zh.console.analytics}</h1>
        <p>{zh.console.analyticsDesc}</p>
      </header>

      <div className="console-stat-grid mb-8">
        <div className="console-stat-card">
          <div className="console-stat-card__value">{data.pageViewCount}</div>
          <div className="console-stat-card__label">{zh.console.statPageViews}</div>
        </div>
        <div className="console-stat-card">
          <div className="console-stat-card__value">{data.newsletterCount}</div>
          <div className="console-stat-card__label">{zh.console.statSubscribers}</div>
        </div>
      </div>

      <section className="console-charts-section mb-8">
        <h2 className="console-charts-section__title">{zh.console.trendPageViews}</h2>
        <ConsoleTrendChart title={zh.console.trendPageViews} data={data.pageViewTrend} color="#8b5cf6" />
      </section>

      <section className="console-section">
        <h2 className="console-section__title">{zh.console.topArticles}</h2>
        {data.topArticles.length === 0 ? (
          <p className="text-secondary">{zh.console.analyticsEmpty}</p>
        ) : (
          <ul className="console-list-plain">
            {data.topArticles.map((a) => (
              <li key={a.articleId} className="flex items-center justify-between gap-4 py-2 border-b border-[var(--color-border)]">
                <Link to={`/article/${a.slug}`} className="text-accent cursor-pointer hover:underline">{a.title}</Link>
                <span className="text-sm text-secondary">{a.viewCount} {zh.console.viewsUnit}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
