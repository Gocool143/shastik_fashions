import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';
import { getProductById } from '@/services/productService';

import { getProducts } from '@/services/productService';

interface ProductDetailsState {
  product: Product | null;
  relatedProducts: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  relatedStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductDetailsState = {
  product: null,
  relatedProducts: [],
  status: 'idle',
  relatedStatus: 'idle',
  error: null,
};

export const fetchProductDetails = createAsyncThunk(
  'productDetails/fetchProductDetails',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await getProductById(id);
      dispatch(fetchRelatedProducts(response.category));
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch product details');
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  'productDetails/fetchRelatedProducts',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const { products } = await getProducts(1, 4, categoryId);
      return products;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch related products');
    }
  }
);

const productDetailsSlice = createSlice({
  name: 'productDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductDetails.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductDetails.fulfilled, (state, action: PayloadAction<Product>) => {
        state.status = 'succeeded';
        state.product = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.relatedStatus = 'loading';
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.relatedStatus = 'succeeded';
        state.relatedProducts = action.payload;
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.relatedStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default productDetailsSlice.reducer;
