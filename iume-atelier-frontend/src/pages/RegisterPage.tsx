import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api'
import PageMeta from '@/components/seo/PageMeta'
import { useAuthStore } from '@/store'
import { zh } from '@/locales/zh'

function mapRegisterError(msg: string): string {
  const lower = msg.toLowerCase()
  if (lower.includes('username must be between') || lower.includes('用户名长度')) {
    return zh.auth.registerUsernameInvalid
  }
  if (lower.includes('username already') || lower.includes('用户名已存在')) {
    return zh.auth.registerUsernameTaken
  }
  if (lower.includes('invalid email') || lower.includes('邮箱格式')) {
    return zh.auth.registerEmailInvalid
  }
  if (lower.includes('email already') || lower.includes('邮箱已被注册')) {
    return zh.auth.registerEmailTaken
  }
  if (lower.includes('password must be between') || lower.includes('密码长度')) {
    return zh.auth.registerPasswordInvalid
  }
  if (/[\u4e00-\u9fff]/.test(msg)) return msg
  return msg || zh.auth.registerFailed
}

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '', email: '', nickname: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const username = form.username.trim()
    const nickname = form.nickname.trim()
    const email = form.email.trim()

    if (username.length < 3 || username.length > 50) {
      setError(zh.auth.registerUsernameInvalid)
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(zh.auth.registerEmailInvalid)
      return
    }
    if (form.password.length < 6) {
      setError(zh.auth.registerPasswordInvalid)
      return
    }

    setLoading(true)
    try {
      const data = await authApi.register(username, form.password, email, nickname)
      setAuth(data.token, data.user, data.refreshToken)
      navigate(data.user.role === 'ADMIN' ? '/console' : '/')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setError(mapRegisterError(msg))
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'nickname' as const, label: zh.auth.nickname, type: 'text', hint: undefined },
    { key: 'username' as const, label: zh.auth.username, type: 'text', hint: zh.auth.registerUsernameHint },
    { key: 'email' as const, label: zh.auth.email, type: 'email', hint: undefined },
    { key: 'password' as const, label: zh.auth.password, type: 'password', hint: undefined },
  ]

  return (
    <>
      <PageMeta title={zh.auth.registerTitle} />
      <section className="mx-auto max-w-md px-4 sm:px-6 py-16 lg:py-20">
        <h1 className="font-display text-3xl mb-8 text-center">{zh.auth.registerTitle}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, type, hint }) => (
            <div key={key} className="space-y-1">
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={label}
                required
                minLength={key === 'username' ? 3 : key === 'password' ? 6 : undefined}
                maxLength={key === 'username' ? 50 : key === 'nickname' ? 50 : undefined}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3"
              />
              {hint && <p className="text-xs text-zinc-500 px-1">{hint}</p>}
            </div>
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
