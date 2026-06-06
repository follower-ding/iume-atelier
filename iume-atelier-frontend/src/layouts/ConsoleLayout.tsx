import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Tags,
  ExternalLink,
  LogOut,
  ScrollText,
  Wrench,
} from 'lucide-react'
import { useAuthStore } from '@/store'
import { zh } from '@/locales/zh'

const nav = [
  { to: '/console', end: true, label: zh.console.dashboard, icon: LayoutDashboard },
  { to: '/console/users', label: zh.console.users, icon: Users },
  { to: '/console/articles', label: zh.console.articles, icon: FileText },
  { to: '/console/ai-tools', label: zh.console.aiTools, icon: Wrench },
  { to: '/console/comments', label: zh.console.comments, icon: MessageSquare },
  { to: '/console/taxonomy', label: zh.console.taxonomy, icon: Tags },
  { to: '/console/audit-logs', label: zh.console.auditLogs, icon: ScrollText },
]

export default function ConsoleLayout() {
  const { user, logout } = useAuthStore()
  const displayName = user?.nickname || user?.username || 'Admin'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="console-shell">
      <aside className="console-sidebar">
        <div className="console-sidebar__brand">
          <span className="console-sidebar__logo">iume·console</span>
          <span className="console-sidebar__badge">ADMIN</span>
        </div>

        <nav className="console-sidebar__nav" aria-label={zh.console.dashboard}>
          {nav.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `console-sidebar__link${isActive ? ' console-sidebar__link--active' : ''}`
              }
            >
              <Icon size={17} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="console-sidebar__footer">
          <div className="console-sidebar__profile">
            <span className="console-sidebar__avatar" aria-hidden="true">{initial}</span>
            <div className="console-sidebar__profile-text">
              <span className="console-sidebar__user">{displayName}</span>
              <span className="console-sidebar__role">{user?.role ?? 'ADMIN'}</span>
            </div>
          </div>
          <Link to="/" className="console-sidebar__link" target="_blank">
            <ExternalLink size={16} />
            {zh.console.viewSite}
          </Link>
          <button type="button" className="console-sidebar__link cursor-pointer" onClick={() => logout()}>
            <LogOut size={16} />
            {zh.nav.signOut}
          </button>
        </div>
      </aside>

      <div className="console-body">
        <main className="console-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
