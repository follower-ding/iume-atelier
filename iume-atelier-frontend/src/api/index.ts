import request, { getData, postData, putData, deleteData } from '@/utils/request'
import type {
  Article,
  ArticleRequest,
  AuthData,
  Category,
  CategoryRequest,
  Comment,
  PageResult,
  Tag,
  TagRequest,
  User,
} from '@/types/api'
import type { UserPreferences } from '@/types/user-preferences'

export const authApi = {
  login: (username: string, password: string) =>
    postData<AuthData>('/auth/login', { username, password }),
  register: (username: string, password: string, email: string, nickname: string) =>
    postData<AuthData>('/auth/register', { username, password, email, nickname }),
  refresh: (refreshToken: string) =>
    postData<AuthData>('/auth/refresh', { refreshToken }),
  me: () => getData<User>('/auth/me'),
}

export const userApi = {
  updateProfile: (data: { nickname?: string; email?: string; avatar?: string }) =>
    putData<User>('/users/me', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    putData<void>('/users/me/password', { currentPassword, newPassword }),
  getPreferences: () => getData<UserPreferences>('/users/me/preferences'),
  updatePreferences: (data: UserPreferences) => putData<UserPreferences>('/users/me/preferences', data),
}

export const articleApi = {
  list: (page = 1, size = 10, categoryId?: number, tagId?: number, sort: 'latest' | 'popular' = 'latest') =>
    getData<PageResult<Article>>('/articles', { page, size, categoryId, tagId, sort }),
  search: (keyword: string, page = 1, size = 10) =>
    getData<PageResult<Article>>('/articles/search', { keyword, page, size }),
  getBySlug: (slug: string) => getData<Article>(`/articles/slug/${slug}`),
  getById: (id: number) => getData<Article>(`/articles/${id}`),
  manage: (page = 1, size = 20, status?: string) =>
    getData<PageResult<Article>>('/articles/manage', { page, size, status }),
  create: (data: ArticleRequest) => postData<Article>('/articles', data),
  update: (id: number, data: ArticleRequest) => putData<Article>(`/articles/${id}`, data),
  remove: (id: number) => deleteData(`/articles/${id}`),
}

export const categoryApi = {
  list: () => getData<Category[]>('/categories'),
  create: (data: CategoryRequest) => postData<Category>('/categories', data),
  update: (id: number, data: CategoryRequest) => putData<Category>(`/categories/${id}`, data),
  remove: (id: number) => deleteData(`/categories/${id}`),
}

export const tagApi = {
  list: () => getData<Tag[]>('/tags'),
  create: (data: TagRequest) => postData<Tag>('/tags', data),
  update: (id: number, data: TagRequest) => putData<Tag>(`/tags/${id}`, data),
  remove: (id: number) => deleteData(`/tags/${id}`),
}

export const commentApi = {
  list: (articleId: number) => getData<Comment[]>(`/comments/article/${articleId}`),
  create: (articleId: number, content: string, parentId?: number) =>
    postData<Comment>('/comments', { articleId, content, parentId }),
  remove: (id: number) => deleteData(`/comments/${id}`),
}

export const adminApi = {
  stats: () => getData<AdminStats>('/admin/stats'),
  listUsers: (page = 1, size = 20, keyword?: string) =>
    getData<PageResult<User>>('/admin/users', { page, size, keyword }),
  createUser: (data: AdminUserCreate) => postData<User>('/admin/users', data),
  updateUser: (id: number, data: { nickname?: string; email?: string; role?: string }) =>
    putData<User>(`/admin/users/${id}`, data),
  removeUser: (id: number) => deleteData(`/admin/users/${id}`),
  batchDeleteUsers: (ids: number[]) =>
    postData<{ deleted: number }>('/admin/users/batch-delete', { ids }),
  listComments: (page = 1, size = 20) =>
    getData<PageResult<AdminComment>>('/admin/comments', { page, size }),
  batchDeleteComments: (ids: number[]) =>
    postData<{ deleted: number }>('/admin/comments/batch-delete', { ids }),
  listArticles: (page = 1, size = 20, status?: string, authorId?: number) =>
    getData<PageResult<Article>>('/admin/articles', { page, size, status, authorId }),
  batchDeleteArticles: (ids: number[]) =>
    postData<{ deleted: number }>('/admin/articles/batch-delete', { ids }),
  batchUpdateArticleStatus: (ids: number[], status: string) =>
    postData<{ updated: number }>('/admin/articles/batch-status', { ids, status }),
  listAuditLogs: (page = 1, size = 20) =>
    getData<PageResult<AdminAuditLog>>('/admin/audit-logs', { page, size }),
}

export interface TrendPoint {
  date: string
  count: number
}

export interface AdminStats {
  userCount: number
  articleCount: number
  publishedCount: number
  draftCount: number
  commentCount: number
  categoryCount: number
  tagCount: number
  userTrend: TrendPoint[]
  articleTrend: TrendPoint[]
  commentTrend: TrendPoint[]
}

export interface AdminUserCreate {
  username: string
  password: string
  email: string
  nickname: string
  role?: string
}

export interface AdminAuditLog {
  id: number
  adminId: number
  adminUsername: string
  action: string
  resourceType: string
  resourceId?: number
  detail?: string
  createdAt: string
}

export interface AdminComment {
  id: number
  articleId: number
  articleTitle?: string
  articleSlug?: string
  userId: number
  username?: string
  nickname?: string
  content: string
  parentId?: number
  createdAt: string
}

export const uploadApi = {
  uploadImage: async (file: File): Promise<string> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await request.post<{ code: number; data: { url: string } }>(
      '/upload/image',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data.data.url
  },
  uploadAudio: async (file: File): Promise<{ url: string; filename: string }> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await request.post<{ code: number; data: { url: string; filename: string } }>(
      '/upload/audio',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data.data
  },
}
