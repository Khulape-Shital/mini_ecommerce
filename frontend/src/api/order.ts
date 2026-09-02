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

export const orderApi = {
  createOrder: async (data: CreateOrderPayload) => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },
};
