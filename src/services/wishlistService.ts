
import { api } from './api';

export const getWishlist = async (): Promise<any> => {
  try {
    const response = await api.get<any>('/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

export const addToWishlist = async (productId: string): Promise<any> => {
  try {
    const response = await api.post<any>('/wishlist', { productId });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (productId: string): Promise<any> => {
  try {
    const response = await api.delete<any>(`/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

export const clearWishlist = async (): Promise<any> => {
  try {
    // Assuming backend supports DELETE /wishlist to clear
    const response = await api.delete<any>('/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    throw error;
  }
};
