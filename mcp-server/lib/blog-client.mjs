/**
 * iume-atelier Blog API client
 */
import { readFile } from 'fs/promises'

export class BlogClient {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl || process.env.IUME_BLOG_API_URL || 'http://127.0.0.1:8080/api').replace(/\/$/, '')
    this.username = options.username || process.env.IUME_BLOG_USERNAME || 'admin'
    this.password = options.password || process.env.IUME_BLOG_PASSWORD || 'admin123'
    this.token = null
  }

  async login() {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: this.username, password: this.password }),
    })
    const json = await res.json()
    if (!json.data?.token) {
      throw new Error(`Login failed: ${json.message || JSON.stringify(json)}`)
    }
    this.token = json.data.token
    return json.data
  }

  async ensureAuth() {
    if (!this.token) await this.login()
  }

  async request(method, path, body, isMultipart = false) {
    await this.ensureAuth()
    const headers = { Authorization: `Bearer ${this.token}` }
    let payload
    if (body && !isMultipart) {
      headers['Content-Type'] = 'application/json; charset=utf-8'
      payload = JSON.stringify(body)
    } else if (isMultipart) {
      payload = body
    }
    const res = await fetch(`${this.baseUrl}${path}`, { method, headers, body: payload })
    const json = await res.json()
    if (json.code !== 200) {
      throw new Error(json.message || `API error ${json.code}: ${path}`)
    }
    return json.data
  }

  async health() {
    const res = await fetch(`${this.baseUrl}/health`)
    return res.json()
  }

  async listCategories() {
    const res = await fetch(`${this.baseUrl}/categories`)
    const json = await res.json()
    return json.data || []
  }

  async listTags() {
    const res = await fetch(`${this.baseUrl}/tags`)
    const json = await res.json()
    return json.data || []
  }

  async resolveCategoryId(categoryId, categorySlug) {
    if (categoryId) return categoryId
    if (!categorySlug) return undefined
    const categories = await this.listCategories()
    const hit = categories.find(c => c.slug === categorySlug)
    if (!hit) throw new Error(`Category not found: ${categorySlug}`)
    return hit.id
  }

  async resolveTagIds(tagIds, tagSlugs) {
    if (tagIds?.length) return tagIds
    if (!tagSlugs?.length) return []
    const tags = await this.listTags()
    return tagSlugs.map(slug => {
      const hit = tags.find(t => t.slug === slug)
      if (!hit) throw new Error(`Tag not found: ${slug}`)
      return hit.id
    })
  }

  async publishArticle(payload) {
    const categoryId = await this.resolveCategoryId(payload.categoryId, payload.categorySlug)
    const tagIds = await this.resolveTagIds(payload.tagIds, payload.tagSlugs)
    return this.request('POST', '/articles', {
      title: payload.title,
      slug: payload.slug,
      content: payload.content,
      summary: payload.summary,
      coverImage: payload.coverImage,
      status: payload.status || 'PUBLISHED',
      categoryId,
      tagIds,
    })
  }

  async updateArticle(id, payload) {
    const categoryId = await this.resolveCategoryId(payload.categoryId, payload.categorySlug)
    const tagIds = await this.resolveTagIds(payload.tagIds, payload.tagSlugs)
    return this.request('PUT', `/articles/${id}`, {
      title: payload.title,
      slug: payload.slug,
      content: payload.content,
      summary: payload.summary,
      coverImage: payload.coverImage,
      status: payload.status || 'PUBLISHED',
      categoryId,
      tagIds,
    })
  }

  async uploadImage({ filePath, buffer, filename }) {
    await this.ensureAuth()
    const form = new FormData()
    const data = buffer ?? await readFile(filePath)
    const name = filename || filePath?.split(/[/\\]/).pop() || 'image.png'
    form.append('file', new Blob([data]), name)
    const res = await fetch(`${this.baseUrl}/upload/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` },
      body: form,
    })
    const json = await res.json()
    if (json.code !== 200) throw new Error(json.message || 'Upload failed')
    return json.data
  }
}
