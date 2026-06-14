import apiClient from './client';
import type { ApiResponse } from '../types/common';
import type { User } from '../types/user';

interface AuthData {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export const authApi = {
  register: (username: string, email: string, password: string) =>
    apiClient.post<ApiResponse<AuthData>>('/auth/register', { username, email, password }),

  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<AuthData>>('/auth/login', { email, password }),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ access_token: string; refresh_token: string; expires_in: number }>>(
      '/auth/refresh',
      { refresh_token: refreshToken },
    ),

  getProfile: () => apiClient.get<ApiResponse<User>>('/users/me'),

  updateProfile: (data: { display_name?: string; bio?: string; avatar_url?: string }) =>
    apiClient.put<ApiResponse<User>>('/users/me', data),

  uploadAvatar: (formData: FormData) =>
    apiClient.post<ApiResponse<{ avatar_url: string; user: User }>>('/users/me/avatar/upload', formData),
};
