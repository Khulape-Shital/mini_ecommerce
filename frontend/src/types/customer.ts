export interface Customer {
  id: string;
  name: string;
  email: string;
  contact?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListParams {
  page?: number;
  limit?: number;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerListResponse {
  success: boolean;
  data: Customer[];
  meta: PaginatedMeta;
}

export interface CustomerResponse {
  success: boolean;
  data: Customer;
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  contact?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  contact?: string;
}
