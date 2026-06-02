import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '../types/common';
import type { Comment } from '../types/comment';

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
