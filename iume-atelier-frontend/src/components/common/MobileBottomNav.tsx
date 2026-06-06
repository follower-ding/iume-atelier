import { NavLink } from 'react-router-dom'
import { FileText, FolderKanban, Home, Menu, Sparkles } from 'lucide-react'
import { useMobileNavStore } from '@/store/useMobileNavStore'
import { zh } from '@/locales/zh'

const tabs = [
  { to: '/', label: zh.nav.home, end: true, icon: Home },
  { to: '/articles', label: zh.nav.articles, icon: FileText },
  { to: '/tools', label: zh.nav.toolsShort, icon: Sparkles },
  { to: '/projects', label: zh.nav.projects, icon: FolderKanban },
] as const

interface MobileBottomNavProps {
  hidden?: boolean
}

export default function MobileBottomNav({ hidden }: MobileBottomNavProps) {
  const setOpen = useMobileNavStore((s) => s.setOpen)

  if (hidden) return null

  return (
    <nav className="mobile-bottom-nav md:hidden" aria-label={zh.nav.mobileBottom}>
      {tabs.map(({ to, label, icon: Icon, ...rest }) => (
        <NavLink
          key={to}
          to={to}
          end={'end' in rest ? rest.end : undefined}
          className={({ isActive }) =>
            `mobile-bottom-nav__item cursor-pointer${isActive ? ' mobile-bottom-nav__item--active' : ''}`
          }
        >
          <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}

      <button
        type="button"
        className="mobile-bottom-nav__item cursor-pointer"
        onClick={() => setOpen(true)}
        aria-label={zh.nav.mobileMenu}
      >
        <Menu size={20} strokeWidth={1.75} aria-hidden="true" />
        <span>{zh.nav.more}</span>
      </button>
    </nav>
  )
}
