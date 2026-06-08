import apiClient from './client';
import type { ApiResponse } from '../types/common';
import type { TrendingRepo } from '../types/trending';

export const trendingApi = {
  get: () => apiClient.get<ApiResponse<TrendingRepo[]>>('/trending/github'),
};
