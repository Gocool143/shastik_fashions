import { useQuery } from '@tanstack/react-query';
import { getProducts, getProductById } from '@/services/productService';
import { fetchCategories } from '@/services/categoryService';
import { Product } from '@/types';

export { type Product };

export const useProducts = (categorySlug?: string) => {
  return useQuery({
    queryKey: ['products', categorySlug],
    queryFn: async () => {
      // Fetching up to 100 products to mimic the previous "fetch all" behavior roughly
      const response = await getProducts(1, 100, categorySlug);
      return response.products;
    },
  });
};

export const useProduct = (idOrSlug: string) => {
  return useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: async () => {
      try {
        const product = await getProductById(idOrSlug);
        return product;
      } catch (error) {
        console.error("Error fetching product:", error);
        return null;
      }
    },
    enabled: !!idOrSlug,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      return await fetchCategories();
    },
  });
};

// Color mapping utility
export const getColorHex = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    gold: '#D4AF37',
    maroon: '#800000',
    'royal blue': '#4169E1',
    red: '#DC2626',
    blue: '#2563EB',
    green: '#16A34A',
    pink: '#EC4899',
    white: '#FFFFFF',
    black: '#000000',
    silver: '#C0C0C0',
    purple: '#9333EA',
    orange: '#EA580C',
    yellow: '#EAB308',
    cream: '#FFFDD0',
    beige: '#F5F5DC',
    navy: '#000080',
  };

  return colorMap[colorName.toLowerCase()] || colorName.toLowerCase();
};
