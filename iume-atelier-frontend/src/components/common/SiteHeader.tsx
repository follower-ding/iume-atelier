import { Link, NavLink } from 'react-router-dom'
import { Menu, Rss } from 'lucide-react'
import NavSearch from '@/components/common/NavSearch'
import SoundToggle from '@/components/common/SoundToggle'
import ThemeToggle from '@/components/common/ThemeToggle'
import UserMenu from '@/components/common/UserMenu'
import { useUiSound } from '@/hooks/useUiSound'
import { useAuthStore } from '@/store'
import { useMobileNavStore } from '@/store/useMobileNavStore'
import { zh } from '@/locales/zh'
import { isAdmin } from '@/utils/user'

const navItems = [
  { to: '/', label: zh.nav.home, end: true },
  { to: '/articles', label: zh.nav.articles },
  { to: '/projects', label: zh.nav.projects },
  { to: '/tools', label: zh.nav.toolsPage, hideBelow: 'lg' as const },
  { to: '/about', label: zh.nav.about },
]

export default function SiteHeader() {
  const { user } = useAuthStore()
  const { play } = useUiSound()
  const setMobileNavOpen = useMobileNavStore((s) => s.setOpen)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link nav-link--pill cursor-pointer${isActive ? ' nav-link--active' : ''}`

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="page-container">
        <div className="flex h-16 items-center gap-3 sm:gap-5">
          <Link to="/" className="site-logo shrink-0 cursor-pointer" onClick={() => play('nav')}>
            iume<span className="site-logo__dot">·</span>atelier
          </Link>

          <nav className="hidden md:flex flex-1 items-center justify-center gap-1 lg:gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={`${linkClass} ${item.hideBelow === 'lg' ? 'hidden lg:inline-flex' : ''}`}
                onClick={() => play('nav')}
              >
                {item.label}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/studio"
                className={linkClass}
                onClick={() => play('nav')}
              >
                {zh.nav.studio}
              </NavLink>
            )}
            {isAdmin(user) && (
              <NavLink
                to="/console"
                className={linkClass}
                onClick={() => play('nav')}
              >
                {zh.nav.admin}
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1 ml-auto md:ml-0">
            <button
              type="button"
              className="md:hidden header-icon-btn cursor-pointer"
              aria-label={zh.nav.mobileMenu}
              onClick={() => { play('click'); setMobileNavOpen(true) }}
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:block w-40 xl:w-48">
              <NavSearch variant="header" />
            </div>
            <button
              type="button"
              className="lg:hidden header-icon-btn cursor-pointer"
              aria-label={zh.nav.search}
              onClick={() => {
                play('click')
                document.getElementById('footer-search')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <UserMenu />
            <SoundToggle />
            <ThemeToggle />
            <a
              href="/api/rss"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex header-icon-btn cursor-pointer"
              aria-label={zh.nav.rss}
              onClick={() => play('click')}
            >
              <Rss size={18} />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
