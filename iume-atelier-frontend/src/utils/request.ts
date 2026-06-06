import axios from 'axios'
import type { ApiResult } from '@/types/api'
import { useAuthStore } from '@/store'
import type { AuthData } from '@/types/api'
import { clearToken, getRefreshToken, getToken, setTokens } from './auth'

const baseURL = import.meta.env.VITE_API_BASE || '/api'

const request = axios.create({
  baseURL,
  timeout: 15000,
})

let refreshing = false
let refreshQueue: Array<(token: string) => void> = []

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    const { data } = await axios.post<ApiResult<AuthData>>(`${baseURL}/auth/refresh`, { refreshToken })
    if (data.code !== 200 || !data.data?.token) return null
    setTokens(data.data.token, data.data.refreshToken)
    useAuthStore.getState().setAuth(data.data.token, data.data.user, data.data.refreshToken)
    return data.data.token
  } catch {
    return null
  }
}

function enqueueRefresh(): Promise<string> {
  return new Promise((resolve, reject) => {
    refreshQueue.push((token) => {
      if (token) resolve(token)
      else reject(new Error('Session expired'))
    })
  })
}

function flushRefreshQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token || ''))
  refreshQueue = []
}

request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const result = response.data as ApiResult<unknown>
    if (result.code !== 200) {
      return Promise.reject(new Error(result.message || 'Request failed'))
    }
    return response
  },
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const url = original?.url as string | undefined

    if (status === 401 && original && !original._retry && url && !url.includes('/auth/login') && !url.includes('/auth/refresh')) {
      original._retry = true

      if (refreshing) {
        try {
          const token = await enqueueRefresh()
          original.headers.Authorization = `Bearer ${token}`
          return request(original)
        } catch {
          clearToken()
          useAuthStore.getState().logout()
          return Promise.reject(error)
        }
      }

      refreshing = true
      const newToken = await refreshAccessToken()
      refreshing = false
      flushRefreshQueue(newToken)

      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return request(original)
      }

      clearToken()
      useAuthStore.getState().logout()
    }

    const body = error.response?.data as ApiResult<unknown> | undefined
    const msg = body?.message || error.message || '请求失败'
    return Promise.reject(new Error(msg))
  },
)

export default request

export async function getData<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await request.get<ApiResult<T>>(url, { params })
  return data.data
}

export async function postData<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await request.post<ApiResult<T>>(url, body)
  return data.data
}

export async function putData<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await request.put<ApiResult<T>>(url, body)
  return data.data
}

export async function deleteData(url: string): Promise<void> {
  await request.delete(url)
}
