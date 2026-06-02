import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '../types/common';

export interface GuestbookMessage {
  id: number;
  user_id?: number;
  nickname: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export const guestbookApi = {
  list: (page = 1, pageSize = 20) =>
    apiClient.get<ApiResponse<PaginatedResponse<GuestbookMessage>>>('/guestbook', {
      params: { page, page_size: pageSize },
    }),

  create: (nickname: string, content: string) =>
    apiClient.post<ApiResponse<GuestbookMessage>>('/guestbook', { nickname, content }),
};
