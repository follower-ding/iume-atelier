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

  return (
    <footer className="mt-auto">
      <div className="page-container py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {categories.length > 0 && (
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                {zh.footer.browseCategories}
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm">
                {sortCategories(categories).map((c, i) => (
                  <span key={c.id} className="inline-flex items-center gap-3">
                    {i > 0 && <span className="text-zinc-300 dark:text-zinc-600">·</span>}
                    <Link
                      to={`/articles?category=${c.id}`}
                      className="nav-link cursor-pointer"
                    >
                      {c.name}
                    </Link>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              {zh.footer.siteLinks}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="nav-link cursor-pointer">{zh.nav.home}</Link></li>
              <li><Link to="/articles" className="nav-link cursor-pointer">{zh.nav.articles}</Link></li>
              <li><Link to="/about" className="nav-link cursor-pointer">{zh.nav.about}</Link></li>
              <li><Link to="/projects" className="nav-link cursor-pointer">{zh.nav.projects}</Link></li>
              <li><Link to="/tools" className="nav-link cursor-pointer">{zh.nav.toolsPage}</Link></li>
              {user ? (
                <>
                  <li><Link to="/studio" className="nav-link cursor-pointer">{zh.nav.studio}</Link></li>
                  <li><Link to="/settings" className="nav-link cursor-pointer">{zh.nav.settings}</Link></li>
                  {isAdmin(user) && (
                    <li><Link to="/console" className="nav-link cursor-pointer">{zh.nav.admin}</Link></li>
                  )}
                  <li>
                    <button type="button" onClick={() => useAuthStore.getState().logout()} className="nav-link cursor-pointer">
                      {zh.nav.signOut}
                    </button>
                  </li>
                </>
              ) : (
                <li><Link to="/login" className="nav-link cursor-pointer">{zh.nav.signIn}</Link></li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              {zh.footer.tools}
            </h3>
            <div id="footer-search" className="mb-4 max-w-xs">
              <NavSearch variant="footer" />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <a
                href="/api/rss"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Rss size={15} /> {zh.nav.rss}
              </a>
              <a
                href="/api/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link cursor-pointer"
              >
                {zh.footer.sitemap}
              </a>
              <a
                href="/api/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link cursor-pointer"
              >
                {zh.footer.robots}
              </a>
              <ThemeToggle showLabel />
              <SimpleModeToggle showLabel />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} iume atelier — {zh.footer.tagline}</p>
        </div>
      </div>
    </footer>
  )
}
