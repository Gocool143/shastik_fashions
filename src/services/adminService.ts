import { api } from './api';
import { Product } from '@/types';

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  revenueChange: number;
  ordersChange: number;
  usersChange: number;
  salesData?: Array<{ name: string; sales: number }>;
}

export interface AdminProduct {
  _id: string;
  name: string;
  description: string;
  originalPrice: number;
  price: number;
  category: any;
  images: string[];
  fabric: string;
  color: string;
  stock: number;
  isBestSeller: boolean;
  isNewArrival: boolean;
  createdAt: string;
  updatedAt: string;
  colors?: string[];
  sizes?: string[];
  color_images?: Record<string, string>;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  originalPrice: number;
  price: number;
  category: string;
  fabric: string;
  color: string;
  stock: number;
  isBestSeller: boolean;
  isNewArrival: boolean;
  images: File[] | string[];
  colors?: string[];
  sizes?: string[];
  color_images?: Record<string, string>;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  _id: string;
}

export interface AdminOrder {
  _id: string;
  userId: string;
  products: Array<{
    product: Product | string;
    quantity: number;
    variant?: {
      color?: string;
      image?: string;
    };
  }>;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress?: any;
  paymentMethod?: string;
  razorpayOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderStatusPayload {
  orderId: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

// Admin Stats
export const fetchAdminStats = async (): Promise<AdminStats> => {
  try {
    const response = await api.get<{ data: AdminStats; success: boolean }>('/admin/stats');
    return response.data.data || (response.data as any);
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch admin stats');
  }
};

// Admin Products
export const fetchAdminProducts = async (
  page: number = 1,
  limit: number = 10,
  filters?: { search?: string; category?: string }
): Promise<{
  products: AdminProduct[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.category && filters.category !== 'all') queryParams.append('category', filters.category);

    const response = await api.get<any>(`/products?${queryParams.toString()}`);
    const data = response.data.data || response.data;

    return {
      products: Array.isArray(data) ? data : (data.products || []),
      total: data.count || data.total || (Array.isArray(data) ? data.length : 0),
      page: data.page || page,
      limit: data.limit || limit,
    };
  } catch (error: any) {
    console.error('Error fetching admin products:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
};

export const fetchAdminProductById = async (productId: string): Promise<AdminProduct> => {
  try {
    const response = await api.get<{ data: AdminProduct; success: boolean }>(`/products/${productId}`);
    return response.data.data || (response.data as any);
  } catch (error: any) {
    console.error('Error fetching product details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch product details');
  }
};

export const createAdminProduct = async (payload: CreateProductPayload): Promise<AdminProduct> => {
  try {
    const hasFiles = payload.images.length > 0 && payload.images[0] instanceof File;

    if (!hasFiles) {
      const response = await api.post<{ data: AdminProduct; success: boolean }>('/products', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data.data || (response.data as any);
    }

    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('description', payload.description);
    formData.append('originalPrice', payload.originalPrice.toString());
    formData.append('price', payload.price.toString());
    formData.append('category', payload.category);
    formData.append('fabric', payload.fabric);
    formData.append('color', payload.color);
    formData.append('stock', payload.stock.toString());
    formData.append('isBestSeller', payload.isBestSeller.toString());
    formData.append('isNewArrival', payload.isNewArrival.toString());

    (payload.images as File[]).forEach((image, index) => {
      formData.append('images', image);
    });

    const response = await api.post<{ data: AdminProduct; success: boolean }>('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data || (response.data as any);
  } catch (error: any) {
    console.error('Error creating product:', error);
    throw new Error(error.response?.data?.message || 'Failed to create product');
  }
};

export const updateAdminProduct = async (payload: UpdateProductPayload): Promise<AdminProduct> => {
  try {
    const hasFiles = payload.images && payload.images.length > 0 && payload.images[0] instanceof File;

    if (!hasFiles && payload.images) {
      const response = await api.put<{ data: AdminProduct; success: boolean }>(`/products/${payload._id}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data.data || (response.data as any);
    }

    const formData = new FormData();
    if (payload.name) formData.append('name', payload.name);
    if (payload.description) formData.append('description', payload.description);
    if (payload.originalPrice !== undefined) formData.append('originalPrice', payload.originalPrice.toString());
    if (payload.price !== undefined) formData.append('price', payload.price.toString());
    if (payload.category) formData.append('category', payload.category);
    if (payload.fabric) formData.append('fabric', payload.fabric);
    if (payload.color) formData.append('color', payload.color);
    if (payload.stock !== undefined) formData.append('stock', payload.stock.toString());
    if (payload.isBestSeller !== undefined) formData.append('isBestSeller', payload.isBestSeller.toString());
    if (payload.isNewArrival !== undefined) formData.append('isNewArrival', payload.isNewArrival.toString());

    if (payload.images && payload.images.length > 0) {
      (payload.images as File[]).forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.put<{ data: AdminProduct; success: boolean }>(`/products/${payload._id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data || (response.data as any);
  } catch (error: any) {
    console.error('Error updating product:', error);
    throw new Error(error.response?.data?.message || 'Failed to update product');
  }
};

export const deleteAdminProduct = async (productId: string): Promise<void> => {
  try {
    await api.delete(`/products/${productId}`);
  } catch (error: any) {
    console.error('Error deleting product:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete product');
  }
};

// Admin Orders
// Admin Orders
export const fetchAdminOrders = async (
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<{
  orders: AdminOrder[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

    // The backend uses /orders/admin for admin view
    const response = await api.get<{ data: any; success: boolean }>(`/orders/admin?${queryParams.toString()}`);
    const data = response.data.data || (response.data as any);

    return {
      orders: Array.isArray(data) ? data : (data.orders || []),
      total: data.count || data.total || (Array.isArray(data) ? data.length : 0),
      page: data.page || page,
      limit: data.limit || limit,
    };
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch orders');
  }
};

export const updateOrderStatus = async (payload: UpdateOrderStatusPayload): Promise<AdminOrder> => {
  try {
    const response = await api.put<{ data: AdminOrder; success: boolean }>(`/orders/${payload.orderId}/status`, {
      status: payload.status,
    });
    return response.data.data || (response.data as any);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    throw new Error(error.response?.data?.message || 'Failed to update order status');
  }
};

