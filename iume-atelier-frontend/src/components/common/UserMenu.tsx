import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, PenLine, User } from 'lucide-react'
import { useAuthStore } from '@/store'
import { zh } from '@/locales/zh'
import { isAdmin, resolveAssetUrl } from '@/utils/user'

export default function UserMenu() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  if (!user) {
    return (
      <Link to="/login" className="header-icon-btn cursor-pointer text-sm hidden sm:inline-flex">
        {zh.nav.signIn}
      </Link>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const avatarUrl = resolveAssetUrl(user.avatar)

  return (
    <div className="user-menu">
      <Link
        to="/studio"
        className="header-icon-btn cursor-pointer click-particles-ignore hidden sm:inline-flex"
        title={zh.nav.studio}
        aria-label={zh.nav.studio}
      >
        <PenLine size={18} />
      </Link>
      {isAdmin(user) && (
        <Link
          to="/console"
          className="header-icon-btn cursor-pointer click-particles-ignore hidden sm:inline-flex"
          title={zh.nav.admin}
          aria-label={zh.nav.admin}
        >
          <LayoutDashboard size={18} />
        </Link>
      )}
      <Link to="/settings" className="user-menu__trigger click-particles-ignore" title={zh.nav.settings}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="user-menu__avatar" />
        ) : (
          <User size={16} />
        )}
        <span className="hidden lg:inline max-w-[5rem] truncate">{user.nickname || user.username}</span>
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="header-icon-btn cursor-pointer click-particles-ignore"
        aria-label={zh.nav.signOut}
        title={zh.nav.signOut}
      >
        <LogOut size={18} />
      </button>
    </div>
  )
}
