/**
 * Quick API smoke test after restart.
 * Usage: node scripts/test-restart-api.mjs
 */
const BASE = process.env.IUME_API_BASE || 'http://127.0.0.1:8080/api'

async function check(name, fn) {
  try {
    await fn()
    console.log(`✅ ${name}`)
    return true
  } catch (e) {
    console.error(`❌ ${name}:`, e.message)
    return false
  }
}

let ok = 0
let fail = 0

if (await check('health', async () => {
  const r = await fetch(`${BASE}/health`)
  const j = await r.json()
  if (j.status !== 'UP') throw new Error(JSON.stringify(j))
})) ok++; else fail++

if (await check('series list', async () => {
  const r = await fetch(`${BASE}/series?page=1&size=5`)
  const j = await r.json()
  if (j.code !== 200) throw new Error(JSON.stringify(j))
})) ok++; else fail++

if (await check('newsletter subscribe', async () => {
  const email = `test-restart-${Date.now()}@example.com`
  const r = await fetch(`${BASE}/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const j = await r.json()
  if (j.code !== 200) throw new Error(JSON.stringify(j))
})) ok++; else fail++

if (await check('fulltext search', async () => {
  const r = await fetch(`${BASE}/articles/search?keyword=Flyway&page=1&size=3`)
  const j = await r.json()
  if (j.code !== 200 || !j.data?.records?.length) throw new Error(`no results: ${JSON.stringify(j)}`)
})) ok++; else fail++

if (await check('authors list', async () => {
  const r = await fetch(`${BASE}/authors`)
  const j = await r.json()
  if (j.code !== 200) throw new Error(JSON.stringify(j))
})) ok++; else fail++

if (await check('login + mustChangePassword flag', async () => {
  const r = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  })
  const j = await r.json()
  if (j.code !== 200) throw new Error(JSON.stringify(j))
  if (!j.data?.user?.mustChangePassword) throw new Error('expected mustChangePassword=true for admin')
})) ok++; else fail++

console.log(`\n${ok} passed, ${fail} failed`)
process.exit(fail > 0 ? 1 : 0)
