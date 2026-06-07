/**
 * Export all articles (including drafts) to JSON for backup / migration.
 *
 * Usage:
 *   node scripts/export-articles.mjs
 *   IUME_API_BASE=https://iume-atelier-production.up.railway.app/api node scripts/export-articles.mjs
 *   node scripts/export-articles.mjs --out backup/articles-2026-06-06.json
 */
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { apiFetch, login } from './lib/api-auth.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PAGE_SIZE = 50

function parseArgs() {
  const args = process.argv.slice(2)
  let out = join(__dirname, 'backup', `articles-${new Date().toISOString().slice(0, 10)}.json`)
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out' && args[i + 1]) out = args[++i]
  }
  return { out }
}

async function listAllArticles(token) {
  const all = []
  let page = 1
  while (true) {
    const { json } = await apiFetch(`/articles/manage?page=${page}&size=${PAGE_SIZE}`, { token })
    if (json.code !== 200) throw new Error('List failed: ' + JSON.stringify(json))
    const records = json.data?.records || []
    all.push(...records)
    const total = json.data?.total ?? 0
    if (all.length >= total || records.length === 0) break
    page++
  }
  return all
}

async function fetchFullArticle(token, id) {
  const { json } = await apiFetch(`/articles/${id}`, { token })
  if (json.code !== 200) throw new Error(`Fetch article ${id} failed: ` + JSON.stringify(json))
  return json.data
}

function toExportRecord(article) {
  return {
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    coverImage: article.coverImage,
    status: article.status,
    categoryId: article.categoryId,
    tagIds: (article.tags || []).map((t) => t.id),
    content: article.content,
    exportedAt: new Date().toISOString(),
  }
}

const { out } = parseArgs()
const token = await login()
console.log('Exporting articles...\n')

const summaries = await listAllArticles(token)
console.log(`Found ${summaries.length} article(s)`)

const exported = []
for (const item of summaries) {
  const full = await fetchFullArticle(token, item.id)
  exported.push(toExportRecord(full))
  console.log('  ✓', full.slug)
}

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, JSON.stringify({ version: 1, count: exported.length, articles: exported }, null, 2), 'utf-8')
console.log(`\n✅ Wrote ${exported.length} article(s) → ${out}`)
