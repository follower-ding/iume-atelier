import { login } from '@/api/auth-api'
import { useAuthStore } from '@/store/authStore'
import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const res = await login(username, password)
      setAuth(res.token, res.username, res.nickname)
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    }
  }

  return (
    <section className="surface-card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2>登录</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="用户名" />
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" />
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button className="btn" type="submit">登录</button>
      </form>
      <p style={{ color: 'var(--muted)', marginTop: 12 }}>默认账号 admin / admin123</p>
    </section>
  )
}
