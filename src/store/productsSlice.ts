import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SareeFilters } from '@/types/filters';
import { getProducts } from '@/services/productService';
import { Product } from '@/types';

interface ProductsState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  isFetchingMore: boolean;
  error: string | null;
  filters: SareeFilters;
  sort: string;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  isFetchingMore: false,
  error: null,
  filters: {
    category: [],
    priceRange: [500, 20000],
    fabric: [],
    color: [],
  },
  sort: 'newest',
  page: 1,
  limit: 12,
  totalPages: 1,
  hasMore: true,
};

interface FetchProductsArgs {
  page?: number;
  limit?: number;
  filters?: SareeFilters;
  sort?: string;
  append?: boolean;
  type?: 'all' | 'new-arrivals' | 'best-sellers';
  categoryId?: string;
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (
    {
      page = 1,
      limit = 12,
      filters = initialState.filters,
      sort = initialState.sort,
      append = false,
      type = 'all',
      categoryId
    }: FetchProductsArgs,
    { rejectWithValue }
  ) => {
    try {
      const response = await getProducts(page, limit, categoryId, filters, sort, type);
      return {
        products: response.products,
        page: response.page,
        totalPages: Math.ceil(response.total / response.limit),
        hasMore: response.page < Math.ceil(response.total / response.limit),
        append,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch products');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<SareeFilters>) => {
      state.filters = action.payload;
      state.page = 1;
      state.items = [];
      state.hasMore = true;
      state.status = 'idle'; // Reset status to trigger re-fetch if needed
    },
    setSort: (state, action: PayloadAction<string>) => {
      state.sort = action.payload;
      state.page = 1;
      state.items = [];
      state.hasMore = true;
      state.status = 'idle';
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    resetProducts: (state) => {
      state.items = [];
      state.page = 1;
      state.hasMore = true;
      state.status = 'idle';
      state.isFetchingMore = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state, action) => {
        // If appending (Load More), don't set global loading status, just isFetchingMore
        if (action.meta.arg.append) {
          state.isFetchingMore = true;
        } else {
          state.status = 'loading';
        }
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<{ products: Product[]; page: number; totalPages: number; hasMore: boolean; append: boolean }>) => {
        state.status = 'succeeded';
        state.isFetchingMore = false;

        if (action.payload.append) {
          // Filter out duplicates just in case
          const newProducts = action.payload.products.filter(
            (newP) => !state.items.some((existingP) => existingP._id === newP._id)
          );
          state.items = [...state.items, ...newProducts];
        } else {
          state.items = action.payload.products;
        }

        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.isFetchingMore = false;
        state.error = (action.payload as string) || 'Failed to fetch products';
        // Note: We don't verify hasMore=false here, allowing retries
      });
  },
});

export const { setFilters, setSort, setPage, resetProducts } = productsSlice.actions;
export default productsSlice.reducer;