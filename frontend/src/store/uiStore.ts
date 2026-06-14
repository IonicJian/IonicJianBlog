import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface UIState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
  toggleTheme: () => void;
}

function getBrowserTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'light',

  initTheme: () => {
    const saved = localStorage.getItem('theme') as Theme | null;
    const resolved = saved || getBrowserTheme();
    applyTheme(resolved);
    set({ theme: resolved });
  },

  setTheme: (theme: Theme) => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));
