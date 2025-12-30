
import { api, unauthApi } from './api';

import { Product, SareeFilters } from '@/types';

interface GetProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export const getProducts = async (
  page: number = 1,
  limit: number = 10,
  categoryId?: string,
  filters?: SareeFilters,
  sort?: string,
  type?: 'all' | 'new-arrivals' | 'best-sellers',
  search?: string,
  minPrice?: number,
  maxPrice?: number,
  inStock?: boolean
): Promise<GetProductsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (categoryId) {
      params.append('categorySlug', categoryId);
    }
    if (search) {
      params.append('search', search);
    }
    if (type === 'best-sellers') {
      params.append('isBestSeller', 'true');
    }
    if (type === 'new-arrivals') {
      params.append('isNewArrival', 'true');
    }
    if (inStock) {
      params.append('inStock', 'true');
    }
    if (minPrice !== undefined) {
      params.append('minPrice', minPrice.toString());
    }
    if (maxPrice !== undefined) {
      params.append('maxPrice', maxPrice.toString());
    }
    if (filters) {
      // Backend expects 'category' for single category ID filtering
      // Since we're using category IDs in the filter, send the first one if available
      if (filters.category && filters.category.length > 0) {
        // Backend supports single category, so we'll send the first selected category
        params.append('categorySlug', filters.category[0]);
      }
      if (filters.color && filters.color.length > 0) {
        params.append('colors', filters.color.join(','));
      }
      if (filters.fabric && filters.fabric.length > 0) {
        params.append('fabrics', filters.fabric.join(','));
      }
      if (filters.priceRange) {
        params.append('minPrice', filters.priceRange[0].toString());
        params.append('maxPrice', filters.priceRange[1].toString());
      }
    }
    if (sort) {
      // Backend expects 'sortBy' parameter
      params.append('sortBy', sort);
    }
    const response = await unauthApi.get<{ success: boolean; message: string; data: Product[]; count: number; page: number; pages: number; limit: number }>(`/products?${params.toString()}`);
    return {
      products: response.data.data,
      total: response.data.count,
      page: response.data.page,
      limit: response.data.limit,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response: any = await unauthApi.get<Product>(`/products/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

export const getBestSellers = async (): Promise<Product[]> => {
  try {
    const response = await unauthApi.get<{ data: Product[] }>('/products/best-sellers');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    throw error;
  }
};

export const getNewArrivals = async (): Promise<Product[]> => {
  try {
    const response = await unauthApi.get<{ data: Product[] }>('/products/new-arrivals');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    throw error;
  }
};

export const searchProducts = async (params: {
  query?: string;
  category?: string;
  colors?: string[];
  fabrics?: string[];
}): Promise<Product[]> => {
  try {
    const urlParams = new URLSearchParams();
    if (params.query) urlParams.append('search', params.query);
    if (params.category) urlParams.append('categorySlug', params.category);
    if (params.colors && params.colors.length > 0) urlParams.append('colors', params.colors.join(','));
    if (params.fabrics && params.fabrics.length > 0) urlParams.append('fabrics', params.fabrics.join(','));

    const response = await unauthApi.get<{ data: Product[] }>(`/products?${urlParams.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

/*
Example Usage:

// Get all products
getProducts(1, 10)
  .then(data => console.log('Products:', data.products))
  .catch(error => console.error('Failed to get products:', error));

// Get product by ID
getProductById('someProductId')
  .then(product => console.log('Product:', product))
  .catch(error => console.error('Failed to get product by ID:', error));
*/
