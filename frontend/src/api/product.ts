import { apiClient } from './client';
import type {
  ProductListParams,
  ProductListResponse,
  ProductResponse,
  CreateProductInput,
  UpdateProductInput
} from '../types/product';

export const productApi = {
  getProducts: async (params?: ProductListParams): Promise<ProductListResponse> => {
    const response = await apiClient.get<ProductListResponse>('/products', { params });
    return response.data;
  },

  getProductById: async (id: string): Promise<ProductResponse> => {
    const response = await apiClient.get<ProductResponse>(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data: CreateProductInput): Promise<ProductResponse> => {
    const response = await apiClient.post<ProductResponse>('/products', data);
    return response.data;
  },

  updateProduct: async (id: string, data: UpdateProductInput): Promise<ProductResponse> => {
    const response = await apiClient.patch<ProductResponse>(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/products/${id}`);
    return response.data;
  }
};
