import apiClient from './client';
import type { ApiResponse } from '../types/common';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  parent_id?: number | null;
  children?: Category[];
  created_at: string;
}

export const categoryApi = {
  list: () => apiClient.get<ApiResponse<Category[]>>('/categories'),
  delete: (id: number) => apiClient.delete(`/categories/${id}`),
  create: (data: { name: string; description?: string; parent_id?: number | null }) =>
    apiClient.post<ApiResponse<Category>>('/categories', data),
};
