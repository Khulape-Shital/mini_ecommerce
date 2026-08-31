import { apiClient } from './client';
import type {
  CustomerListParams,
  CustomerListResponse,
  CustomerResponse,
  CreateCustomerInput,
  UpdateCustomerInput
} from '../types/customer';

export const customerApi = {
  getCustomers: async (params?: CustomerListParams): Promise<CustomerListResponse> => {
    const response = await apiClient.get<CustomerListResponse>('/v1/customers', { params });
    return response.data;
  },

  getCustomerById: async (id: string): Promise<CustomerResponse> => {
    const response = await apiClient.get<CustomerResponse>(`/v1/customers/${id}`);
    return response.data;
  },

  createCustomer: async (data: CreateCustomerInput): Promise<CustomerResponse> => {
    const response = await apiClient.post<CustomerResponse>('/v1/customers', data);
    return response.data;
  },

  updateCustomer: async (id: string, data: UpdateCustomerInput): Promise<CustomerResponse> => {
    const response = await apiClient.patch<CustomerResponse>(`/v1/customers/${id}`, data);
    return response.data;
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/customers/${id}`);
  }
};
