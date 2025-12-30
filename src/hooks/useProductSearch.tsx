import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/services/productService';
import { Product } from '@/types';

export interface SearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  bestseller?: boolean;
  inStock?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  products: Product[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export const useProductSearch = (params: SearchParams) => {
  return useQuery({
    queryKey: ['product-search', params],
    queryFn: async (): Promise<SearchResponse> => {
      const page = params.offset && params.limit
        ? Math.floor(params.offset / params.limit) + 1
        : 1;
      const limit = params.limit || 10;

      let type: 'all' | 'new-arrivals' | 'best-sellers' = 'all';
      if (params.bestseller) {
        type = 'best-sellers';
      }

      const response = await getProducts(
        page,
        limit,
        params.category,
        undefined, // filters
        undefined, // sort
        type,
        params.query,
        params.minPrice,
        params.maxPrice,
        params.inStock
      );

      return {
        products: response.products,
        total: response.total,
        limit: response.limit,
        offset: (response.page - 1) * response.limit,
        hasMore: (response.page * response.limit) < response.total
      };
    },
    enabled: Boolean(
      params.query ||
      params.category ||
      params.featured ||
      params.bestseller ||
      params.minPrice !== undefined ||
      params.maxPrice !== undefined
    ),
  });
};

export const useBestsellerProducts = (limit = 8) => {
  return useProductSearch({
    bestseller: true,
    inStock: true,
    limit,
  });
};
