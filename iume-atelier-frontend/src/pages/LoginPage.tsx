import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '@/api'
import PageMeta from '@/components/seo/PageMeta'
import { useAuthStore } from '@/store'
import { zh } from '@/locales/zh'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await authApi.login(username.trim(), password)
      setAuth(data.token, data.user, data.refreshToken)
      const dest = data.user.mustChangePassword
        ? '/settings?changePassword=required'
        : (from ?? (data.user.role === 'ADMIN' ? '/console' : '/'))
      navigate(dest, { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      const lower = msg.toLowerCase()
      if (lower.includes('cors') || lower.includes('invalid cors')) {
        setError(zh.auth.loginCorsFailed)
      } else if (
        lower.includes('network') ||
        lower.includes('timeout') ||
        lower.includes('502') ||
        lower.includes('503') ||
        lower.includes('failed to fetch')
      ) {
        setError(zh.auth.loginNetworkFailed)
      } else if (lower.includes('bad credentials') || lower.includes('401')) {
        setError(zh.auth.loginFailed)
      } else {
        setError(msg || zh.auth.loginFailed)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageMeta title={zh.auth.loginTitle} />
      <section className="mx-auto max-w-md px-4 sm:px-6 py-16 lg:py-20">
        <h1 className="font-display text-3xl mb-2 text-center">{zh.auth.loginTitle}</h1>
        <p className="text-center text-zinc-500 mb-8">{zh.auth.loginSubtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={zh.auth.username}
            required
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={zh.auth.password}
            required
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full cursor-pointer">
            {loading ? zh.auth.loggingIn : zh.auth.login}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          {zh.auth.noAccount} <Link to="/register" className="text-accent cursor-pointer">{zh.auth.register}</Link>
        </p>
      </section>
    </>
  )
}
