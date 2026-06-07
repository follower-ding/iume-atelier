/**
 * Import articles from export JSON (upsert by slug).
 *
 * Usage:
 *   node scripts/import-articles.mjs scripts/backup/articles-2026-06-06.json
 *   IUME_API_BASE=https://iume-atelier-production.up.railway.app/api node scripts/import-articles.mjs backup.json
 */
import { readFileSync } from 'fs'
import { apiFetch, login } from './lib/api-auth.mjs'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/import-articles.mjs <articles.json>')
  process.exit(1)
}

const payload = JSON.parse(readFileSync(file, 'utf-8'))
const articles = payload.articles || payload
if (!Array.isArray(articles)) {
  console.error('Invalid format: expected { articles: [...] }')
  process.exit(1)
}

async function findBySlug(token, slug) {
  const { json, status } = await apiFetch(`/articles/slug/${encodeURIComponent(slug)}`, { token })
  if (json.code === 200) return json.data
  if (status === 404 || json.code === 404) return null
  throw new Error(`Lookup ${slug} failed: ` + JSON.stringify(json))
}

async function upsert(token, record) {
  const body = {
    title: record.title,
    slug: record.slug,
    summary: record.summary,
    coverImage: record.coverImage,
    status: record.status || 'PUBLISHED',
    categoryId: record.categoryId,
    tagIds: record.tagIds || [],
    content: record.content,
  }

  const existing = await findBySlug(token, record.slug)
  if (existing?.id) {
    const { json } = await apiFetch(`/articles/${existing.id}`, { token, method: 'PUT', body })
    if (json.code !== 200) {
      console.error('UPDATE FAIL:', record.slug, json)
      return 'fail'
    }
    console.log('UPDATED:', record.slug)
    return 'updated'
  }

  const { json } = await apiFetch('/articles', { token, method: 'POST', body })
  if (json.code !== 200) {
    console.error('CREATE FAIL:', record.slug, json)
    return 'fail'
  }
  console.log('CREATED:', record.slug)
  return 'created'
}

const token = await login()
console.log(`Importing ${articles.length} article(s)...\n`)

let created = 0
let updated = 0
let failed = 0

for (const record of articles) {
  const result = await upsert(token, record)
  if (result === 'created') created++
  else if (result === 'updated') updated++
  else failed++
}

console.log(`\nDone — created: ${created}, updated: ${updated}, failed: ${failed}`)
if (failed > 0) process.exit(1)
