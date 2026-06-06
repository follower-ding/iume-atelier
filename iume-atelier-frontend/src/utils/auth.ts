const TOKEN_KEY = 'iume_atelier_token'
const REFRESH_KEY = 'iume_atelier_refresh'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_KEY, token)
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  setToken(accessToken)
  if (refreshToken) setRefreshToken(refreshToken)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
