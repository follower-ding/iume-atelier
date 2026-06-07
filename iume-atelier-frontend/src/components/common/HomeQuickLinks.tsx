import { Link } from 'react-router-dom'
import { FileText, Search, Sparkles } from 'lucide-react'
import { zh } from '@/locales/zh'

const links = [
  { to: '/articles', label: zh.home.quickLinks.articles, desc: zh.home.quickLinks.articlesDesc, icon: FileText },
  { to: '/tools', label: zh.home.quickLinks.tools, desc: zh.home.quickLinks.toolsDesc, icon: Sparkles },
  { to: '/search', label: zh.home.quickLinks.search, desc: zh.home.quickLinks.searchDesc, icon: Search },
] as const

export default function HomeQuickLinks() {
  return (
    <section className="page-container pb-4 lg:pb-6">
      <div className="home-quick-links">
        {links.map(({ to, label, desc, icon: Icon }) => (
          <Link key={to} to={to} className="home-quick-links__card group cursor-pointer">
            <span className="home-quick-links__icon" aria-hidden="true">
              <Icon size={22} strokeWidth={1.75} />
            </span>
            <span className="home-quick-links__text">
              <span className="home-quick-links__label">{label}</span>
              <span className="home-quick-links__desc">{desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
