import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '../types/common';
import type { Blog, BlogListItem, Tag } from '../types/blog';
import type { Category } from '../types/category';

export const blogApi = {
  list: (params?: { page?: number; page_size?: number; tag?: string; category?: string; sort?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<BlogListItem>>>('/blogs', { params }),

  search: (q: string, page = 1, pageSize = 20) =>
    apiClient.get<ApiResponse<PaginatedResponse<BlogListItem>>>('/blogs/search', {
      params: { q, page, page_size: pageSize },
    }),

  getTop: () =>
    apiClient.get<ApiResponse<BlogListItem[]>>('/blogs/top'),

  getById: (id: number) =>
    apiClient.get<ApiResponse<Blog>>(`/blogs/${id}`),

  getBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Blog>>(`/blogs/slug/${slug}`),

  create: (data: { title: string; content: string; cover_image?: string; status?: string; tag_ids?: number[]; category_id?: number; is_top?: boolean }) =>
    apiClient.post<ApiResponse<Blog>>('/blogs', data),

  update: (id: number, data: { title?: string; content?: string; cover_image?: string; status?: string; tag_ids?: number[]; category_id?: number; is_top?: boolean }) =>
    apiClient.put<ApiResponse<Blog>>(`/blogs/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/blogs/${id}`),

  incrementView: (id: number) =>
    apiClient.post(`/blogs/${id}/view`),
};

export const tagApi = {
  list: () =>
    apiClient.get<ApiResponse<Tag[]>>('/tags'),

  create: (data: { name: string; color?: string }) =>
    apiClient.post<ApiResponse<Tag>>('/tags', data),

  update: (id: number, data: { name?: string; color?: string }) =>
    apiClient.put<ApiResponse<Tag>>(`/tags/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/tags/${id}`),
};

export const categoryApi = {
  list: () => apiClient.get<ApiResponse<Category[]>>('/categories'),
  delete: (id: number) => apiClient.delete(`/categories/${id}`),
  create: (data: { name: string; description?: string; parent_id?: number | null }) =>
    apiClient.post<ApiResponse<Category>>('/categories', data),
};
