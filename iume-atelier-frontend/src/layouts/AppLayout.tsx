import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Rss } from 'lucide-react'
import ThemeToggle from '@/components/common/ThemeToggle'
import NavSearch from '@/components/common/NavSearch'
import { useAuthStore } from '@/store'
import { zh } from '@/locales/zh'

export default function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl">
        <div className="relative mx-auto max-w-shell px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-4">
            <Link to="/" className="shrink-0 font-display text-xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
              iume <span className="text-accent">atelier</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium shrink-0">
              <Link to="/" className="text-zinc-600 dark:text-zinc-400 hover:text-accent transition-colors cursor-pointer">{zh.nav.home}</Link>
              <Link to="/articles" className="text-zinc-600 dark:text-zinc-400 hover:text-accent transition-colors cursor-pointer">{zh.nav.articles}</Link>
              {user && (
                <Link to="/admin" className="text-zinc-600 dark:text-zinc-400 hover:text-accent transition-colors cursor-pointer">{zh.nav.studio}</Link>
              )}
            </nav>

            <NavSearch />

            <div className="flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
              <ThemeToggle />
              {user ? (
                <button type="button" onClick={handleLogout} className="btn-ghost text-sm py-2 px-3 cursor-pointer">
                  {zh.nav.signOut}
                </button>
              ) : (
                <Link to="/login" className="btn-primary text-sm py-2 px-4 cursor-pointer">{zh.nav.signIn}</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 mt-auto">
        <div className="mx-auto max-w-shell px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} iume atelier — {zh.footer}</p>
          <a
            href="/api/rss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-accent transition-colors cursor-pointer"
          >
            <Rss size={16} /> {zh.nav.rss}
          </a>
        </div>
      </footer>
    </div>
  )
}
