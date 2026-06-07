import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'

/** Redirect users who must change password to settings (except login/register). */
export default function PasswordChangeGate({ children }: { children: ReactNode }) {
  const { user } = useAuthStore()
  const location = useLocation()

  if (
    user?.mustChangePassword &&
    location.pathname !== '/settings' &&
    location.pathname !== '/login' &&
    location.pathname !== '/register'
  ) {
    return <Navigate to="/settings?changePassword=required" replace />
  }

  return children
}
