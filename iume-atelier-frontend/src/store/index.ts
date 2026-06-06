import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api'
import type { User } from '@/types/api'
import { clearToken, getToken, setTokens } from '@/utils/auth'
import { ambientNoise } from '@/utils/ambientNoise'
import { runThemeTransition } from '@/utils/themeTransition'

interface AuthState {
  user: User | null
  initialized: boolean
  setAuth: (token: string, user: User, refreshToken?: string) => void
  fetchSession: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      initialized: false,
      setAuth: (token, user, refreshToken) => {
        setTokens(token, refreshToken)
        set({ user, initialized: true })
      },
      fetchSession: async () => {
        if (!getToken()) {
          set({ user: null, initialized: true })
          return
        }
        try {
          const user = await authApi.me()
          set({ user, initialized: true })
        } catch {
          clearToken()
          set({ user: null, initialized: true })
        }
      },
      logout: () => {
        clearToken()
        set({ user: null })
      },
    }),
    {
      name: 'iume-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
)

interface ThemeState {
  theme: 'light' | 'dark'
  toggle: (event?: { clientX: number; clientY: number }) => void
  setTheme: (theme: 'light' | 'dark') => void
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggle: (event) => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        const update = () => {
          applyTheme(next)
          set({ theme: next })
        }
        runThemeTransition(update, event)
      },
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
    }),
    { name: 'iume-theme' },
  ),
)

interface SoundState {
  enabled: boolean
  toggle: () => void
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      enabled: true,
      toggle: () => set({ enabled: !get().enabled }),
    }),
    { name: 'iume-sound' },
  ),
)

interface AmbientState {
  ambientOn: boolean
  toggleAmbient: () => void
  setAmbient: (on: boolean) => void
}

interface SimpleModeState {
  simpleMode: boolean
  toggle: () => void
}

function applySimpleMode(on: boolean) {
  document.documentElement.classList.toggle('simple-mode', on)
}

export const useSimpleModeStore = create<SimpleModeState>()(
  persist(
    (set, get) => ({
      simpleMode: false,
      toggle: () => {
        const next = !get().simpleMode
        applySimpleMode(next)
        set({ simpleMode: next })
      },
    }),
    {
      name: 'iume-simple-mode',
      onRehydrateStorage: () => (state) => {
        if (state) applySimpleMode(state.simpleMode)
      },
    },
  ),
)

export const useAmbientStore = create<AmbientState>()(
  persist(
    (set, get) => ({
      ambientOn: false,
      toggleAmbient: () => {
        const next = !get().ambientOn
        if (next) ambientNoise.start(0.035)
        else ambientNoise.stop()
        set({ ambientOn: next })
      },
      setAmbient: (on) => {
        if (on) ambientNoise.start(0.035)
        else ambientNoise.stop()
        set({ ambientOn: on })
      },
    }),
    { name: 'iume-ambient' },
  ),
)

export { useCompanionStore } from './useCompanionStore'
export type { CompanionMood, CompanionDrawer, CompanionPosition } from './useCompanionStore'
export { useMusicStore } from './useMusicStore'
export { useCursorStyleStore } from './useCursorStyleStore'
export type { CursorStyle } from './useCursorStyleStore'
export { useUserPrefsStore } from './useUserPrefsStore'
export type { CustomMusicTrack } from './useUserPrefsStore'
