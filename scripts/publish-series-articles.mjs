/**
 * Publish iume-atelier blog series via API
 * Usage: node scripts/publish-series-articles.mjs
 */
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.IUME_API_BASE || 'http://127.0.0.1:8080/api'

async function login() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  })
  const json = await res.json()
  if (!json.data?.token) throw new Error('Login failed: ' + JSON.stringify(json))
  return json.data.token
}

async function publish(token, meta) {
  const contentPath = join(__dirname, 'articles', meta.file)
  const content = readFileSync(contentPath, 'utf-8')
  const body = {
    title: meta.title,
    slug: meta.slug,
    summary: meta.summary,
    coverImage: meta.coverImage,
    status: 'PUBLISHED',
    categoryId: meta.categoryId,
    tagIds: meta.tagIds,
    content,
  }
  const res = await fetch(`${BASE}/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (json.code !== 200) {
    console.error('FAIL:', meta.title, json)
  } else {
    console.log('OK:', meta.title, '->', json.data.slug)
  }
}

const articles = JSON.parse(readFileSync(join(__dirname, 'articles', 'manifest.json'), 'utf-8'))

const token = await login()
console.log('Logged in as admin\n')
for (const meta of articles) {
  await publish(token, meta)
}
console.log('\nDone! Visit http://localhost:5174/articles')
