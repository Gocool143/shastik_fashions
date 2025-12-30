import { useQuery } from '@tanstack/react-query';
import * as categoryService from '@/services/categoryService';
import { Category as BackendCategory } from '@/types';

export interface Category extends BackendCategory {
  id: string; // Map _id to id for compatibility
  image_url: string | null; // Map image to image_url for compatibility
  product_count?: number;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const categories = await categoryService.fetchCategories();
      return categories.map(cat => ({
        ...cat,
        id: cat._id,
        image_url: cat.image || null,
      }));
    },
  });
};

export const useCategoriesWithCount = () => {
  return useQuery({
    queryKey: ['categories-with-count'],
    queryFn: async (): Promise<Category[]> => {
      const categories = await categoryService.fetchCategories();

      // For now, since the backend might not provide counts in the category list,
      // and fetching all products to count them is inefficient, 
      // we'll return the categories with 0 count or let the backend handle it.
      // If the backend eventually provides productCount, it will be mapped here.

      return categories.map(cat => ({
        ...cat,
        id: cat._id,
        image_url: cat.image || null,
        product_count: (cat as any).productCount || 0,
      }));
    },
  });
};
