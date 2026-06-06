import { ExternalLink } from 'lucide-react'
import TiltCard from '@/components/interactive/TiltCard'
import PageMeta from '@/components/seo/PageMeta'
import { tools } from '@/data/site-profile'
import { zh } from '@/locales/zh'

const categories = [...new Set(tools.map((t) => t.category))]

export default function ToolsPage() {
  return (
    <>
      <PageMeta title={zh.tools.title} description={zh.tools.subtitle} />

      <section className="page-container py-10 lg:py-14 space-y-14 max-w-5xl">
        <header className="animate-fade-up">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">{zh.nav.toolsPage}</p>
          <h1 className="section-title">{zh.tools.title}</h1>
          <p className="mt-4 text-lg text-secondary leading-relaxed max-w-2xl">{zh.tools.subtitle}</p>
        </header>

        {categories.map((cat) => (
          <div key={cat}>
            <h2 className="section-title text-xl mb-6">{cat}</h2>
            <div className="tool-grid">
              {tools.filter((t) => t.category === cat).map((t, i) => (
                <TiltCard
                  key={t.name}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tool-card group cursor-pointer block h-full"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="tool-card__icon">{t.icon}</span>
                      <ExternalLink size={14} className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="tool-card__title">{t.name}</h3>
                    <p className="tool-card__desc">{t.description}</p>
                  </a>
                </TiltCard>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  )
}
