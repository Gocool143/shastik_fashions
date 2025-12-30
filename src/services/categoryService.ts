import { unauthApi, api } from './api';
import { Category } from '@/types';

export interface CreateCategoryPayload {
  name: string;
  description: string;
  image: string;
}

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await unauthApi.get<{ success: boolean; message: string; data: Category[] }>('/categories');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createCategory = async (payload: CreateCategoryPayload): Promise<Category> => {
  try {
    const response = await api.post<{ success: boolean; message: string; data: Category }>('/categories', payload);
    return response.data.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const fetchCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await unauthApi.get<{ success: boolean; message: string; data: Category }>(`/categories/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching category details:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, payload: CreateCategoryPayload): Promise<Category> => {
  try {
    const response = await api.put<{ success: boolean; message: string; data: Category }>(`/categories/${id}`, payload);
    return response.data.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await api.delete<{ success: boolean; message: string }>(`/categories/${id}`);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
