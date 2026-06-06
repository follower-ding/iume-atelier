import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useAuthStore } from '@/store'
import { useMobileNavStore } from '@/store/useMobileNavStore'
import { zh } from '@/locales/zh'
import { isAdmin } from '@/utils/user'

const primaryItems = [
  { to: '/', label: zh.nav.home, end: true },
  { to: '/articles', label: zh.nav.articles },
  { to: '/projects', label: zh.nav.projects },
  { to: '/tools', label: zh.nav.toolsPage },
  { to: '/about', label: zh.nav.about },
]

export default function MobileNav() {
  const open = useMobileNavStore((s) => s.open)
  const setOpen = useMobileNavStore((s) => s.setOpen)
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!mounted || !open) return null

  const onClose = () => setOpen(false)

  const panel = (
    <div className="mobile-nav-overlay md:hidden" role="dialog" aria-modal="true" aria-label={zh.nav.mobileMenu}>
      <button
        type="button"
        className="mobile-nav-overlay__backdrop cursor-pointer"
        aria-label={zh.companion.close}
        onClick={onClose}
      />
      <nav className="mobile-nav-panel">
        <div className="mobile-nav-panel__head">
          <span className="mobile-nav-panel__brand">iume·atelier</span>
          <button type="button" onClick={onClose} className="header-icon-btn cursor-pointer" aria-label={zh.companion.close}>
            <X size={20} />
          </button>
        </div>

        <div className="mobile-nav-panel__body">
          <p className="mobile-nav-panel__section">{zh.nav.siteNav}</p>
          <ul className="mobile-nav-panel__list">
            {primaryItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `mobile-nav-panel__link cursor-pointer${isActive ? ' mobile-nav-panel__link--active' : ''}`
                  }
                  onClick={onClose}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <p className="mobile-nav-panel__section">{zh.nav.accountNav}</p>
          <ul className="mobile-nav-panel__list">
            <li>
              <Link to="/search" className="mobile-nav-panel__link cursor-pointer" onClick={onClose}>
                <Search size={18} aria-hidden="true" />
                {zh.nav.search}
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <NavLink
                    to="/studio"
                    className={({ isActive }) =>
                      `mobile-nav-panel__link cursor-pointer${isActive ? ' mobile-nav-panel__link--active' : ''}`
                    }
                    onClick={onClose}
                  >
                    {zh.nav.studio}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      `mobile-nav-panel__link cursor-pointer${isActive ? ' mobile-nav-panel__link--active' : ''}`
                    }
                    onClick={onClose}
                  >
                    {zh.nav.settings}
                  </NavLink>
                </li>
                {isAdmin(user) && (
                  <li>
                    <NavLink
                      to="/console"
                      className={({ isActive }) =>
                        `mobile-nav-panel__link cursor-pointer${isActive ? ' mobile-nav-panel__link--active' : ''}`
                      }
                      onClick={onClose}
                    >
                      {zh.nav.admin}
                    </NavLink>
                  </li>
                )}
              </>
            ) : (
              <li>
                <Link to="/login" className="mobile-nav-panel__link cursor-pointer" onClick={onClose}>
                  {zh.nav.signIn}
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="mobile-nav-panel__foot">
          {user ? (
            <button
              type="button"
              onClick={() => { useAuthStore.getState().logout(); onClose() }}
              className="mobile-nav-panel__link mobile-nav-panel__link--ghost cursor-pointer"
            >
              {zh.nav.signOut}
            </button>
          ) : (
            <Link to="/register" className="mobile-nav-panel__link mobile-nav-panel__link--ghost cursor-pointer" onClick={onClose}>
              {zh.auth.register}
            </Link>
          )}
        </div>
      </nav>
    </div>
  )

  return createPortal(panel, document.body)
}
