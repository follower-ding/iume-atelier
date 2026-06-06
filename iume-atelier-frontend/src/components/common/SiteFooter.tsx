import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Rss } from 'lucide-react'
import { categoryApi } from '@/api'
import NavSearch from '@/components/common/NavSearch'
import SimpleModeToggle from '@/components/common/SimpleModeToggle'
import ThemeToggle from '@/components/common/ThemeToggle'
import { useAuthStore } from '@/store'
import { zh } from '@/locales/zh'
import { isAdmin } from '@/utils/user'
import type { Category } from '@/types/api'
import { sortCategories } from '@/utils/categories'

export default function SiteFooter() {
  const { user } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {})
  }, [])

  const primaryLinks = [
    { to: '/', label: zh.nav.home },
    { to: '/articles', label: zh.nav.articles },
    { to: '/about', label: zh.nav.about },
    { to: '/projects', label: zh.nav.projects },
  ]

  const secondaryLinks = [
    { to: '/tools', label: zh.nav.toolsPage },
    ...(user
      ? [
          { to: '/studio', label: zh.nav.studio },
          { to: '/settings', label: zh.nav.settings },
          ...(isAdmin(user) ? [{ to: '/console', label: zh.nav.admin }] : []),
        ]
      : [{ to: '/login', label: zh.nav.signIn }]),
  ]

  return (
    <footer className="site-footer mt-auto">
      <div className="page-container site-footer__inner">
        <div className="site-footer__grid">
          {categories.length > 0 && (
            <section className="site-footer__col">
              <h3 className="site-footer__heading">{zh.footer.browseCategories}</h3>
              <div className="site-footer__tags">
                {sortCategories(categories).map((c) => (
                  <Link
                    key={c.id}
                    to={`/articles?category=${c.id}`}
                    className="site-footer__tag cursor-pointer"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="site-footer__col">
            <h3 className="site-footer__heading">{zh.footer.siteLinks}</h3>
            <div className="site-footer__link-grid">
              <ul className="site-footer__links">
                {primaryLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="site-footer__link cursor-pointer">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="site-footer__links">
                {secondaryLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="site-footer__link cursor-pointer">
                      {link.label}
                    </Link>
                  </li>
                ))}
                {user && (
                  <li>
                    <button
                      type="button"
                      onClick={() => useAuthStore.getState().logout()}
                      className="site-footer__link cursor-pointer"
                    >
                      {zh.nav.signOut}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </section>

          <section className="site-footer__col">
            <h3 className="site-footer__heading">{zh.footer.shortcuts}</h3>
            <div id="footer-search" className="site-footer__search">
              <NavSearch variant="footer" />
            </div>
            <ul className="site-footer__utils">
              <li>
                <a
                  href="/api/rss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer__link site-footer__link--inline cursor-pointer"
                >
                  <Rss size={14} />
                  {zh.nav.rss}
                </a>
              </li>
              <li>
                <a
                  href="/api/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer__link cursor-pointer"
                >
                  {zh.footer.sitemap}
                </a>
              </li>
              <li>
                <a
                  href="/api/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer__link cursor-pointer"
                >
                  {zh.footer.robots}
                </a>
              </li>
              <li className="site-footer__utils-toggle">
                <ThemeToggle showLabel />
              </li>
              <li className="site-footer__utils-toggle">
                <SimpleModeToggle showLabel />
              </li>
            </ul>
          </section>
        </div>

        <div className="site-footer__bottom">
          <p>© {new Date().getFullYear()} iume atelier — {zh.footer.tagline}</p>
        </div>
      </div>
    </footer>
  )
}
