import apiClient from './client';
import type { ApiResponse } from '../types/common';

interface LikeResult {
  liked: boolean;
  count: number;
}

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
