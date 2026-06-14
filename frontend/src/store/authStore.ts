import { create } from 'zustand';
import type { User } from '../types/user';
import { authApi } from '../api/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  handleOAuthCallback: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  init: () => void;
  setAuthFromResponse: (data: { user: User; access_token: string; refresh_token: string }) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: false,
  isLoading: true,

  init: () => {
    const token = get().accessToken;
    if (token) {
      get().fetchProfile();
    } else {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const res = await authApi.login(email, password);
    get().setAuthFromResponse(res.data.data);
  },

  register: async (username, email, password) => {
    const res = await authApi.register(username, email, password);
    get().setAuthFromResponse(res.data.data);
  },

  setAuthFromResponse: (data) => {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    set({
      user: data.user,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  refreshSession: async () => {
    const rt = get().refreshToken;
    if (!rt) throw new Error('No refresh token');
    const res = await authApi.refresh(rt);
    const { access_token, refresh_token } = res.data.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    set({ accessToken: access_token, refreshToken: refresh_token });
  },

  fetchProfile: async () => {
    try {
      const res = await authApi.getProfile();
      set({ user: res.data.data, isAuthenticated: true, isLoading: false });
    } catch {
      get().logout();
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user }),

  handleOAuthCallback: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true, isLoading: false });
    authApi.getProfile().then((res) => {
      set({ user: res.data.data });
    }).catch(() => {
      get().logout();
    });
  },
}));
