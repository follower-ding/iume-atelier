/**
 * Auto-generated API contract types.
 * Regenerate with backend running: ..\scripts\sync-api-types.ps1
 * Source: Spring Boot OpenAPI /api/v3/api-docs
 */

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

export interface TagResponse {
  id: number
  name: string
  slug: string
}

export interface CategoryResponse {
  id: number
  name: string
  slug: string
  description?: string
}

export interface ArticleResponse {
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
  seriesId?: number
  seriesTitle?: string
  seriesSlug?: string
  seriesOrder?: number
  viewCount: number
  tags: TagResponse[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface UserResponse {
  id: number
  username: string
  nickname: string
  email: string
  role: string
  avatar?: string
  mustChangePassword?: boolean
  createdAt?: string
}

export interface AuthResponse {
  token: string
  refreshToken?: string
  tokenType?: string
  user: UserResponse
}

export interface CommentResponse {
  id: number
  articleId: number
  userId: number
  username?: string
  nickname?: string
  userName?: string
  content: string
  parentId?: number
  createdAt: string
  replies?: CommentResponse[]
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
  seriesId?: number
  seriesOrder?: number
}

export interface CategoryRequest {
  name: string
  slug: string
  description?: string
}

export interface TagRequest {
  name: string
  slug: string
}

export interface CommentRequest {
  articleId: number
  content: string
  parentId?: number
}

export interface UpdateProfileRequest {
  nickname?: string
  email?: string
  avatar?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email: string
  nickname: string
}
