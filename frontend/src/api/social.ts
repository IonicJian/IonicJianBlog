import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '../types/common';
import type { Comment } from '../types/comment';
import type { GuestbookMessage } from '../types/guestbook';
import type { FriendLink } from '../types/friendLink';

interface LikeResult {
  liked: boolean;
  count: number;
}

export const commentApi = {
  list: (blogId: number, page = 1, pageSize = 20) =>
    apiClient.get<ApiResponse<PaginatedResponse<Comment>>>(`/blogs/${blogId}/comments`, {
      params: { page, page_size: pageSize },
    }),

  create: (blogId: number, data: {
    content: string;
    parent_id?: number;
    anchor_start?: string;
    anchor_text?: string;
  }) =>
    apiClient.post<ApiResponse<Comment>>(`/blogs/${blogId}/comments`, data),

  delete: (id: number) =>
    apiClient.delete(`/comments/${id}`),
};

export const likeApi = {
  toggleBlog: (blogId: number) =>
    apiClient.post<ApiResponse<LikeResult>>(`/blogs/${blogId}/like`),

  toggleComment: (commentId: number) =>
    apiClient.post<ApiResponse<LikeResult>>(`/comments/${commentId}/like`),

  getBlogStatus: (blogId: number) =>
    apiClient.get<ApiResponse<LikeResult>>(`/blogs/${blogId}/like/status`),

  getCommentStatus: (commentId: number) =>
    apiClient.get<ApiResponse<LikeResult>>(`/comments/${commentId}/like/status`),
};

export const guestbookApi = {
  list: (page = 1, pageSize = 20) =>
    apiClient.get<ApiResponse<PaginatedResponse<GuestbookMessage>>>('/guestbook', {
      params: { page, page_size: pageSize },
    }),

  create: (nickname: string, content: string) =>
    apiClient.post<ApiResponse<GuestbookMessage>>('/guestbook', { nickname, content }),
};

export const friendLinkApi = {
  list: () => apiClient.get<ApiResponse<FriendLink[]>>('/friend-links'),

  create: (data: { name: string; url: string; description?: string; logo_url?: string; sort_order?: number }) =>
    apiClient.post<ApiResponse<FriendLink>>('/friend-links', data),

  update: (id: number, data: { name?: string; url?: string; description?: string; logo_url?: string; sort_order?: number; is_active?: boolean }) =>
    apiClient.put<ApiResponse<FriendLink>>(`/friend-links/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/friend-links/${id}`),
};
