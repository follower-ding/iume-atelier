/**
 * Shared API auth helpers for migration scripts.
 */
export const BASE = process.env.IUME_API_BASE || 'http://127.0.0.1:8080/api'

export async function login(username, password) {
  const user = username || process.env.IUME_ADMIN_USER || 'admin'
  const pass = password || process.env.IUME_ADMIN_PASSWORD || 'admin123'
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user, password: pass }),
  })
  const json = await res.json()
  if (!json.data?.token) throw new Error('Login failed: ' + JSON.stringify(json))
  return json.data.token
}

export async function apiFetch(path, { token, method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const json = await res.json()
  return { ok: res.ok, status: res.status, json }
}
