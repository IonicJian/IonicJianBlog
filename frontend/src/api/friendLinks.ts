import apiClient from './client';
import type { ApiResponse } from '../types/common';

export interface FriendLink {
  id: number;
  name: string;
  url: string;
  description: string;
  logo_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const friendLinkApi = {
  list: () => apiClient.get<ApiResponse<FriendLink[]>>('/friend-links'),

  create: (data: { name: string; url: string; description?: string; logo_url?: string; sort_order?: number }) =>
    apiClient.post<ApiResponse<FriendLink>>('/friend-links', data),

  update: (id: number, data: { name?: string; url?: string; description?: string; logo_url?: string; sort_order?: number; is_active?: boolean }) =>
    apiClient.put<ApiResponse<FriendLink>>(`/friend-links/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/friend-links/${id}`),
};
