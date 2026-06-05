export interface ApiResult<T> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  records: T[]
  total: number
  page: number
  size: number
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
}

export interface Article {
  id: number
  title: string
  slug: string
  content: string
  summary: string
  coverImage?: string
  status: 'DRAFT' | 'PUBLISHED'
  authorId: number
  authorName: string
  categoryId?: number
  categoryName?: string
  viewCount: number
  tags: Tag[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface User {
  id: number
  username: string
  nickname: string
  email: string
  role: string
  avatar?: string
}

export interface AuthData {
  token: string
  user: User
}

export interface Comment {
  id: number
  articleId: number
  userId: number
  userName: string
  content: string
  parentId?: number
  createdAt: string
  replies?: Comment[]
}

export interface ArticleRequest {
  title: string
  slug?: string
  content: string
  summary: string
  coverImage?: string
  status: 'DRAFT' | 'PUBLISHED'
  categoryId?: number
  tagIds?: number[]
}
