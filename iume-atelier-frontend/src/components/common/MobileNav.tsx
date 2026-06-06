import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAuthStore } from '@/store'
import { zh } from '@/locales/zh'
import { isAdmin } from '@/utils/user'

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { to: '/', label: zh.nav.home, end: true },
  { to: '/articles', label: zh.nav.articles },
  { to: '/projects', label: zh.nav.projects },
  { to: '/tools', label: zh.nav.toolsPage },
  { to: '/about', label: zh.nav.about },
]

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const { user } = useAuthStore()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block py-3 text-lg font-medium cursor-pointer transition-colors ${
      isActive ? 'text-accent' : 'text-primary hover:text-accent'
    }`

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
        aria-label="关闭菜单"
        onClick={onClose}
      />
      <nav
        className="absolute right-0 top-0 h-full w-[min(85vw,320px)] bg-[var(--color-surface)] shadow-2xl flex flex-col"
        aria-label="移动端导航"
      >
        <div className="flex items-center justify-between px-5 h-16 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <span className="font-display text-lg">iume·atelier</span>
          <button type="button" onClick={onClose} className="header-icon-btn cursor-pointer" aria-label="关闭">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          ))}
          {user && (
            <>
              <NavLink to="/studio" className={linkClass} onClick={onClose}>
                {zh.nav.studio}
              </NavLink>
              <NavLink to="/settings" className={linkClass} onClick={onClose}>
                {zh.nav.settings}
              </NavLink>
            </>
          )}
          {isAdmin(user) && (
            <NavLink to="/console" className={linkClass} onClick={onClose}>
              {zh.nav.admin}
            </NavLink>
          )}
        </div>

        <div className="px-5 py-5 border-t text-sm" style={{ borderColor: 'var(--color-border)' }}>
          {user ? (
            <button
              type="button"
              onClick={() => { useAuthStore.getState().logout(); onClose() }}
              className="nav-link cursor-pointer"
            >
              {zh.nav.signOut}
            </button>
          ) : (
            <Link to="/login" className="nav-link cursor-pointer" onClick={onClose}>
              {zh.nav.signIn}
            </Link>
          )}
        </div>
      </nav>
    </div>
  )
}
