import { useAuthStore } from '@/store/authStore'
import { Link, Outlet } from 'react-router-dom'

export default function MainLayout() {
  const { token, nickname, logout } = useAuthStore()

  return (
    <div className="page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1><Link to="/">iume-atelier</Link></h1>
          <p>writing atelier by iume</p>
        </div>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/">首页</Link>
          {token ? (
            <>
              <Link to="/admin">后台</Link>
              <span>{nickname}</span>
              <button className="btn secondary" onClick={logout}>退出</button>
            </>
          ) : (
            <Link to="/login">登录</Link>
          )}
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
