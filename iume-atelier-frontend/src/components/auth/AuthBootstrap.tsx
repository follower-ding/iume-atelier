import { useEffect } from 'react'
import { useAuthStore } from '@/store'

export default function AuthBootstrap() {
  const fetchSession = useAuthStore((s) => s.fetchSession)

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  return null
}
