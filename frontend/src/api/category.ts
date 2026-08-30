import { apiClient } from './client';
import type { Category } from '../types/product';

export const categoryApi = {
  getCategories: async (): Promise<{ success: boolean; data: Category[] }> => {
    const response = await apiClient.get<{ success: boolean; data: Category[] }>('/categories');
    return response.data;
  },
};
