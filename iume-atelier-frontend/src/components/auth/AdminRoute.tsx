import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { zh } from '@/locales/zh'

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, initialized } = useAuthStore()
  const location = useLocation()

  if (!initialized) {
    return <div className="console-loading">{zh.auth.sessionLoading}</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="console-forbidden" data-testid="console-forbidden">
        <h1>{zh.console.forbiddenTitle}</h1>
        <p>{zh.console.forbiddenDesc}</p>
      </div>
    )
  }

  return children
}
