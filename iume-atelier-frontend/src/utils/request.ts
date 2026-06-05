import axios from 'axios'
import type { ApiResult } from '@/types/api'
import { clearToken, getToken } from './auth'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000,
})

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
  (error) => {
    if (error.response?.status === 401) {
      clearToken()
    }
    const body = error.response?.data as ApiResult<unknown> | undefined
    const msg = body?.message || error.message || '请求失败'
    return Promise.reject(new Error(msg))
  }
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
