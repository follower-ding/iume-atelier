import { Link } from 'react-router-dom'
import { ArrowRight, Github, Mail, MapPin } from 'lucide-react'
import HeroBanner from '@/components/common/HeroBanner'
import AmbientSoundToggle from '@/components/interactive/AmbientSoundToggle'
import CharacterCard from '@/components/interactive/CharacterCard'
import CountUp from '@/components/interactive/CountUp'
import GradientText from '@/components/interactive/GradientText'
import KeyCaps from '@/components/interactive/KeyCaps'
import OrbScene from '@/components/interactive/OrbScene'
import TiltCard from '@/components/interactive/TiltCard'
import WorkspaceArt from '@/components/interactive/WorkspaceArt'
import PageMeta from '@/components/seo/PageMeta'
import { aboutBento, projects, siteProfile } from '@/data/site-profile'
import { zh } from '@/locales/zh'

export default function AboutPage() {
  const [stack, oss, write, fun] = aboutBento

  return (
    <>
      <PageMeta title={zh.about.title} description={siteProfile.bio[0]} />

      <HeroBanner decorative>
        <div className="about-hero grid gap-10 lg:grid-cols-[1fr_auto] items-center text-left max-w-5xl mx-auto">
          <div className="animate-fade-up">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">{zh.about.greeting}</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-2">
              {zh.about.hello}{' '}
              <GradientText as="span">{siteProfile.name}</GradientText>
            </h1>
            <p className="mb-6 text-sm text-secondary">
              <a href={siteProfile.github} target="_blank" rel="noopener noreferrer" className="prose-link cursor-pointer">
                @{siteProfile.username}
              </a>
              {' · '}{siteProfile.title}
            </p>
            {siteProfile.bio.map((p, i) => (
              <p
                key={p}
                className="mb-4 text-base sm:text-lg leading-relaxed text-secondary animate-fade-up"
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                {p}
              </p>
            ))}
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <a href={siteProfile.github} target="_blank" rel="noopener noreferrer" className="btn-secondary cursor-pointer inline-flex items-center gap-2 text-sm py-2.5 px-5 btn-magnetic">
                <Github size={16} /> GitHub
              </a>
              <Link to="/projects" className="btn-primary cursor-pointer text-sm py-2.5 px-5 btn-magnetic">{zh.nav.projects}</Link>
              <AmbientSoundToggle />
            </div>
          </div>
          <TiltCard className="about-avatar-wrap mx-auto lg:mx-0" maxTilt={12} glow>
            <div className="about-avatar-ring" aria-hidden="true" />
            <img src={siteProfile.avatar} alt={siteProfile.name} className="about-avatar" />
          </TiltCard>
        </div>
      </HeroBanner>

      <section className="page-container py-14 lg:py-20">
        <div className="bento-grid bento-grid--playful bento-grid--dense max-w-5xl mx-auto">
          <TiltCard className="bento-card bento-card--map bento-cell bento-cell--location" glow>
            <div className="bento-cell__content">
              <MapPin size={20} className="text-accent mb-3" />
              <h2 className="bento-card__title">{zh.about.location}</h2>
              <p className="bento-card__body text-2xl font-display font-bold text-ink">{siteProfile.location}</p>
              <p className="bento-card__hint mt-3">
                GitHub 自 <span className="text-accent font-semibold">{siteProfile.githubSince}</span> 年起
              </p>
              <div className="mt-auto pt-6">
                <KeyCaps />
                <p className="bento-card__hint mt-3">敲敲键盘，试试音效 ✦</p>
              </div>
            </div>
          </TiltCard>

          <TiltCard className="bento-card bento-card--character bento-cell bento-cell--character p-0 overflow-hidden" maxTilt={5}>
            <CharacterCard />
            <p className="bento-card__hint text-center pb-4 px-3">点我打个招呼</p>
          </TiltCard>

          <TiltCard className="bento-card bento-card--orb bento-cell bento-cell--orb flex flex-col items-center justify-center" maxTilt={6}>
            <OrbScene />
            <p className="bento-card__hint mt-3 text-center">跟着鼠标转一转</p>
          </TiltCard>

          <TiltCard className="bento-card bento-card--stat bento-cell bento-cell--stat-repos">
            <CountUp value={siteProfile.highlights[0].value} className="bento-stat__value bento-stat__value--glow" />
            <div className="bento-stat__label">{siteProfile.highlights[0].label}</div>
          </TiltCard>

          <TiltCard className="bento-card bento-card--stat bento-cell bento-cell--stat-year">
            <div className="bento-stat__value bento-stat__value--glow">{siteProfile.highlights[1].value}</div>
            <div className="bento-stat__label">{siteProfile.highlights[1].label}</div>
          </TiltCard>

          <TiltCard className="bento-card bento-card--workspace bento-cell bento-cell--workspace overflow-hidden" maxTilt={5}>
            <h2 className="bento-card__title">写作角落</h2>
            <WorkspaceArt />
            <p className="bento-card__body mt-4">在 iume-atelier 记录可运行的方案与踩坑笔记。</p>
          </TiltCard>

          <TiltCard className="bento-card bento-cell bento-cell--pronouns">
            <h2 className="bento-card__title">{zh.about.pronouns}</h2>
            <p className="bento-card__body text-lg font-semibold">{siteProfile.pronouns}</p>
          </TiltCard>

          <TiltCard className="bento-card bento-cell bento-cell--contact">
            <h2 className="bento-card__title">{zh.about.contact}</h2>
            <a href={`mailto:${siteProfile.email}`} className="prose-link inline-flex items-center gap-2 cursor-pointer text-sm break-all">
              <Mail size={15} /> {siteProfile.email}
            </a>
          </TiltCard>

          <TiltCard className="bento-card bento-card--stat bento-cell bento-cell--focus">
            <div className="bento-stat__value bento-stat__value--glow text-lg">{siteProfile.highlights[2].value}</div>
            <div className="bento-stat__label">{siteProfile.highlights[2].label}</div>
          </TiltCard>

          <TiltCard className="bento-card bento-cell bento-cell--stack">
            <h2 className="bento-card__title">{stack.title}</h2>
            <p className="bento-card__body">{stack.body}</p>
          </TiltCard>

          <TiltCard className="bento-card bento-cell bento-cell--oss">
            <h2 className="bento-card__title">{oss.title}</h2>
            <p className="bento-card__body">{oss.body}</p>
          </TiltCard>

          <TiltCard className="bento-card bento-cell bento-cell--write">
            <h2 className="bento-card__title">{write.title}</h2>
            <p className="bento-card__body">{write.body}</p>
          </TiltCard>

          <TiltCard className="bento-card bento-cell bento-cell--fun">
            <h2 className="bento-card__title">{fun.title}</h2>
            <p className="bento-card__body">{fun.body}</p>
          </TiltCard>

          <TiltCard className="bento-card bento-card--project bento-cell bento-cell--projects" glow>
            <h2 className="bento-card__title">精选项目</h2>
            <div className="space-y-3 mt-2">
              {projects.slice(0, 2).map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bento-project-link group cursor-pointer"
                >
                  <span className="bento-project-link__name">{p.name}</span>
                  <span className="bento-project-link__desc line-clamp-2">{p.description}</span>
                  <ArrowRight size={16} className="bento-project-link__arrow" />
                </a>
              ))}
            </div>
          </TiltCard>
        </div>
      </section>
    </>
  )
}
