import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  username: string | null
  nickname: string | null
  setAuth: (token: string, username: string, nickname: string) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      nickname: null,
      setAuth: (token, username, nickname) => set({ token, username, nickname }),
      setToken: (token) => set({ token }),
      logout: () => set({ token: null, username: null, nickname: null }),
    }),
    { name: 'iume-atelier-auth' }
  )
)
