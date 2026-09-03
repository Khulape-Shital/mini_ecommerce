import { apiClient } from './client';

export interface OrderItemPayload {
  productId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  name: string;
  email: string;
  contact?: string;
  shippingAddress: string;
  items: OrderItemPayload[];
  couponCode?: string;
}

export interface Order {
  id: string;
  customerId: string;
  couponId?: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: string;
  discountAmount?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  success: boolean;
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const orderApi = {
  createOrder: async (data: CreateOrderPayload) => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },
  getOrders: async (params?: { page?: number; limit?: number; status?: string }): Promise<OrderListResponse> => {
    const response = await apiClient.get<OrderListResponse>('/orders', { params });
    return response.data;
  },
};
