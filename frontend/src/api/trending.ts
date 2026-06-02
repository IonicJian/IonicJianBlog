import apiClient from './client';
import type { ApiResponse } from '../types/common';

export interface TrendingRepo {
  name: string;
  full_name: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  today_stars: number;
}

export const trendingApi = {
  get: () => apiClient.get<ApiResponse<TrendingRepo[]>>('/trending/github'),
};
