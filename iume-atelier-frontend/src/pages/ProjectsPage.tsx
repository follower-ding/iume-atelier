import { useEffect, useState } from 'react'
import { ExternalLink, Github, Star } from 'lucide-react'
import ArticleListSkeleton from '@/components/common/ArticleListSkeleton'
import TiltCard from '@/components/interactive/TiltCard'
import PageMeta from '@/components/seo/PageMeta'
import { projects as staticProjects, siteProfile, type ProjectItem } from '@/data/site-profile'
import { zh } from '@/locales/zh'
import { fetchGitHubProjects } from '@/utils/githubProjects'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>(staticProjects)
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)

  useEffect(() => {
    fetchGitHubProjects(siteProfile.username)
      .then((repos) => {
        if (repos?.length) {
          setProjects(repos)
          setLive(true)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageMeta title={zh.projects.title} description={zh.projects.subtitle} />

      <section className="page-container py-10 lg:py-14">
        <header className="mb-12 max-w-2xl animate-fade-up">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">{zh.nav.projects}</p>
          <h1 className="section-title">{zh.projects.title}</h1>
          <p className="mt-4 text-lg text-secondary leading-relaxed">{zh.projects.subtitle}</p>
          <a
            href={siteProfile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block prose-link cursor-pointer text-sm"
          >
            github.com/{siteProfile.username} →
          </a>
          {live && <p className="mt-2 text-xs text-accent">{zh.projects.liveFromGitHub}</p>}
        </header>

        {loading ? (
          <ArticleListSkeleton count={3} />
        ) : (
          <div className="project-grid">
            {projects.map((p, i) => (
              <TiltCard
                key={p.name}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
                glow
              >
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-card group cursor-pointer block h-full"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="project-card__icon">
                      <Github size={22} />
                    </div>
                    <ExternalLink size={16} className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <h2 className="project-card__title">{p.name}</h2>
                  <p className="project-card__desc">{p.description}</p>
                  <div className="project-card__meta">
                    <span className="project-card__lang">{p.language}</span>
                    {p.stars && (
                      <span className="inline-flex items-center gap-1 text-secondary">
                        <Star size={13} /> {p.stars}
                      </span>
                    )}
                  </div>
                  {p.topics.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.topics.map((t) => (
                        <span key={t} className="sidebar-tag sidebar-tag--sm">{t}</span>
                      ))}
                    </div>
                  )}
                </a>
              </TiltCard>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
