import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface UIState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  initTheme: () => void
}

const THEME_KEY = 'theme'

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'dark',

  setTheme: (theme) => {
    applyTheme(theme)
    localStorage.setItem(THEME_KEY, theme)
    set({ theme })
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },

  initTheme: () => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    const theme = stored ?? 'dark'
    applyTheme(theme)
    set({ theme })
  },
}))
