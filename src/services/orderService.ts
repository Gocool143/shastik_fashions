
import { api } from './api';

export interface OrderProduct {
  product: any; // Can be Product ID (string) or Product object
  quantity: number;
  variant?: {
    color?: string;
    image?: string;
  };
}

export interface Order {
  _id?: string;
  id?: string;
  order_number?: string;
  items?: any[];
  products: OrderProduct[];
  totalAmount: number;
  total?: number; // Backend version of totalAmount
  paymentStatus: string;
  status?: string;
  created_at?: string;
  createdAt?: string;
  shippingAddress?: any;
  shipping_address?: any;
  paymentMethod?: string;
}

export const createOrder = async (orderPayload: any): Promise<any> => {
  try {
    const response = await api.post<any>('/orders/confirm', orderPayload);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrders = async (): Promise<any[]> => {
  try {
    const response = await api.get<any>('/orders');
    // Pattern: { success: true, data: [...] }
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // Pattern: [...]
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return []; // Return empty array to prevent .map errors
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const getOrderById = async (id: string): Promise<any> => {
  try {
    const response = await api.get<any>(`/orders/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    throw error;
  }
};
