import { create } from 'zustand'
import * as authApi from '@/api/auth'
import type { User } from '@/types/user'

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  initializing: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  loginWithTokens: (res: { user: User; access_token: string; refresh_token: string }) => void
  logout: () => Promise<void>
  fetchProfile: () => Promise<void>
  setUser: (user: User) => void
  init: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  initializing: true,

  login: async (email, password) => {
    const res = await authApi.login(email, password)
    get().loginWithTokens(res)
  },

  register: async (username, email, password) => {
    const res = await authApi.register(username, email, password)
    get().loginWithTokens(res)
  },

  loginWithTokens: (res) => {
    localStorage.setItem(ACCESS_KEY, res.access_token)
    localStorage.setItem(REFRESH_KEY, res.refresh_token)
    set({ user: res.user, isAuthenticated: true })
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // best-effort: clear local session regardless of network result
    }
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    set({ user: null, isAuthenticated: false })
  },

  fetchProfile: async () => {
    try {
      const user = await authApi.getProfile()
      set({ user, isAuthenticated: true })
    } catch {
      localStorage.removeItem(ACCESS_KEY)
      localStorage.removeItem(REFRESH_KEY)
      set({ user: null, isAuthenticated: false })
    }
  },

  setUser: (user) => set({ user }),

  init: async () => {
    const access = localStorage.getItem(ACCESS_KEY)
    if (!access) {
      set({ initializing: false, isAuthenticated: false })
      return
    }
    await get().fetchProfile()
    set({ initializing: false })
  },
}))
