export interface ApiResult<T> {
  code: number
  message: string
  data: T
  timestamp: number
}

export interface Article {
  id: number
  title: string
  slug: string
  summary?: string
  contentMd?: string
  contentHtml?: string
  coverUrl?: string
  status: string
  authorName?: string
  viewCount?: number
  publishedAt?: string
  tags?: string[]
}

export interface LoginResponse {
  token: string
  userId: number
  username: string
  nickname: string
  roles: string[]
}
