import type { Article } from '@/types/api'
import { request, unwrap } from '@/utils/request'

export function listArticles(page = 1, pageSize = 10) {
  return unwrap<Article[]>(request.get('/public/articles', { params: { page, pageSize } }))
}

export function searchArticles(q: string) {
  return unwrap<Article[]>(request.get('/public/articles/search', { params: { q } }))
}

export function getArticle(slug: string) {
  return unwrap<Article>(request.get(`/public/articles/${slug}`))
}

export function listAdminArticles() {
  return unwrap<Article[]>(request.get('/admin/articles'))
}

export function saveArticle(data: Partial<Article> & { contentMd: string; title: string }, id?: number) {
  if (id) {
    return unwrap<Article>(request.put(`/admin/articles/${id}`, data))
  }
  return unwrap<Article>(request.post('/admin/articles', data))
}

export function deleteArticle(id: number) {
  return unwrap<null>(request.delete(`/admin/articles/${id}`))
}
