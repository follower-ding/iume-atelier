import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api'
import PageMeta from '@/components/seo/PageMeta'
import { useAuthStore } from '@/store'
import { zh } from '@/locales/zh'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '', email: '', nickname: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await authApi.register(form.username, form.password, form.email, form.nickname)
      setAuth(data.token, data.user, data.refreshToken)
      navigate(data.user.role === 'ADMIN' ? '/console' : '/')
    } catch {
      setError(zh.auth.registerFailed)
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'username' as const, label: zh.auth.username, type: 'text' },
    { key: 'nickname' as const, label: zh.auth.nickname, type: 'text' },
    { key: 'email' as const, label: zh.auth.email, type: 'email' },
    { key: 'password' as const, label: zh.auth.password, type: 'password' },
  ]

  return (
    <>
      <PageMeta title={zh.auth.registerTitle} />
      <section className="mx-auto max-w-md px-4 sm:px-6 py-16 lg:py-20">
        <h1 className="font-display text-3xl mb-8 text-center">{zh.auth.registerTitle}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, type }) => (
            <input
              key={key}
              type={type}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={label}
              required
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3"
            />
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full cursor-pointer">
            {loading ? zh.auth.registering : zh.auth.register}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">
          {zh.auth.hasAccount} <Link to="/login" className="text-accent cursor-pointer">{zh.auth.login}</Link>
        </p>
      </section>
    </>
  )
}
