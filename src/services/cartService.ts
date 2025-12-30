import { api } from './api';
import { CartItem, CartState as Cart } from '@/store/cartSlice';

export const getCart = async (): Promise<any> => {
  try {
    const response = await api.get<any>('/cart');
    return response.data; // Return the whole JSON body so slices can decide (handleLegacy)
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const addToCart = async (productId: string, quantity: number, color?: string, image?: string): Promise<any> => {
  try {
    const payload = {
      productId,
      quantity,
      variant: {
        color,
        image
      }
    };
    const response = await api.post<any>('/cart', payload);
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (productId: string, quantity: number): Promise<any> => {
  try {
    const response = await api.put<any>('/cart/update', { productId, quantity });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeCartItem = async (productId: string): Promise<any> => {
  try {
    const response = await api.delete<any>(`/cart/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
};
export const clearCart = async (): Promise<any> => {
  try {
    const response = await api.delete<any>('/cart');
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};
