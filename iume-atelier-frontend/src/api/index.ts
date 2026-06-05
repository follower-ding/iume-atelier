import request, { getData, postData, putData, deleteData } from '@/utils/request'
import type {
  Article,
  ArticleRequest,
  AuthData,
  Category,
  Comment,
  PageResult,
  Tag,
  User,
} from '@/types/api'

export const authApi = {
  login: (username: string, password: string) =>
    postData<AuthData>('/auth/login', { username, password }),
  register: (username: string, password: string, email: string, nickname: string) =>
    postData<AuthData>('/auth/register', { username, password, email, nickname }),
  me: () => getData<User>('/auth/me'),
}

export const articleApi = {
  list: (page = 1, size = 10, categoryId?: number) =>
    getData<PageResult<Article>>('/articles', { page, size, categoryId }),
  search: (keyword: string, page = 1, size = 10) =>
    getData<PageResult<Article>>('/articles/search', { keyword, page, size }),
  getBySlug: (slug: string) => getData<Article>(`/articles/slug/${slug}`),
  manage: (page = 1, size = 20, status?: string) =>
    getData<PageResult<Article>>('/articles/manage', { page, size, status }),
  create: (data: ArticleRequest) => postData<Article>('/articles', data),
  update: (id: number, data: ArticleRequest) => putData<Article>(`/articles/${id}`, data),
  remove: (id: number) => deleteData(`/articles/${id}`),
}

export const categoryApi = {
  list: () => getData<Category[]>('/categories'),
}

export const tagApi = {
  list: () => getData<Tag[]>('/tags'),
}

export const commentApi = {
  list: (articleId: number) => getData<Comment[]>(`/comments/article/${articleId}`),
  create: (articleId: number, content: string, parentId?: number) =>
    postData<Comment>('/comments', { articleId, content, parentId }),
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
}
