import type { LoginResponse } from '@/types/api'
import { request, unwrap } from '@/utils/request'

export function login(username: string, password: string) {
  return unwrap<LoginResponse>(request.post('/auth/login', { username, password }))
}

export function register(username: string, password: string, nickname?: string) {
  return unwrap<null>(request.post('/auth/register', { username, password, nickname }))
}
