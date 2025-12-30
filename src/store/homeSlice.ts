
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';
import { getBestSellers, getNewArrivals } from '@/services/productService';

interface HomeState {
  bestSellers: Product[];
  newArrivals: Product[];
  bestSellersStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  newArrivalsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: HomeState = {
  bestSellers: [],
  newArrivals: [],
  bestSellersStatus: 'idle',
  newArrivalsStatus: 'idle',
  error: null,
};

export const fetchBestSellers = createAsyncThunk(
  'home/fetchBestSellers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getBestSellers();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch best sellers');
    }
  }
);

export const fetchNewArrivals = createAsyncThunk(
  'home/fetchNewArrivals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getNewArrivals();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch new arrivals');
    }
  }
);

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Best Sellers
      .addCase(fetchBestSellers.pending, (state) => {
        state.bestSellersStatus = 'loading';
      })
      .addCase(fetchBestSellers.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.bestSellersStatus = 'succeeded';
        state.bestSellers = action.payload;
      })
      .addCase(fetchBestSellers.rejected, (state, action) => {
        state.bestSellersStatus = 'failed';
        state.error = action.payload as string;
      })
      // New Arrivals
      .addCase(fetchNewArrivals.pending, (state) => {
        state.newArrivalsStatus = 'loading';
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.newArrivalsStatus = 'succeeded';
        state.newArrivals = action.payload;
      })
      .addCase(fetchNewArrivals.rejected, (state, action) => {
        state.newArrivalsStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default homeSlice.reducer;
