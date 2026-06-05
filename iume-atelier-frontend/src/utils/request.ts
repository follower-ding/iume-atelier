import type { ApiResult } from '@/types/api'
import { useAuthStore } from '@/store/authStore'
import axios, { type AxiosInstance } from 'axios'

const baseURL = import.meta.env.VITE_API_BASE || '/api'

export const request: AxiosInstance = axios.create({
  baseURL,
  timeout: 60_000,
})

request.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (res) => {
    const body = res.data as ApiResult<unknown>
    if (body && typeof body.code === 'number' && body.code !== 0) {
      return Promise.reject(new Error(body.message || '请求失败'))
    }
    return res
  },
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    const msg = err.response?.data?.message || err.message || '网络错误'
    return Promise.reject(new Error(msg))
  }
)

export async function unwrap<T>(promise: Promise<{ data: ApiResult<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}
