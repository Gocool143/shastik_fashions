import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { searchProducts as searchProductsApi } from '@/services/productService';
import { Product } from '@/types';

interface SearchFilters {
  category?: string;
  colors?: string[];
  fabrics?: string[];
}

interface SearchState {
  results: Product[];
  query: string;
  filters: SearchFilters;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SearchState = {
  results: [],
  query: '',
  filters: {},
  status: 'idle',
  error: null,
};

export const searchProducts = createAsyncThunk(
  'search/searchProducts',
  async (params: { query: string; filters?: SearchFilters }, { rejectWithValue }) => {
    try {
      const response = await searchProductsApi({
        query: params.query,
        category: params.filters?.category,
        colors: params.filters?.colors,
        fabrics: params.filters?.fabrics,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to search products');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setSearchFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload;
    },
    clearSearchResults: (state) => {
      state.results = [];
      state.query = '';
      state.filters = {};
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = 'succeeded';
        state.results = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to search products';
      });
  },
});

export const { setSearchQuery, setSearchFilters, clearSearchResults } = searchSlice.actions;

export const selectSearchResults = (state: { search: SearchState }) => state.search.results;
export const selectSearchStatus = (state: { search: SearchState }) => state.search.status;
export const selectSearchQuery = (state: { search: SearchState }) => state.search.query;
export const selectSearchFilters = (state: { search: SearchState }) => state.search.filters;
export default searchSlice.reducer;
