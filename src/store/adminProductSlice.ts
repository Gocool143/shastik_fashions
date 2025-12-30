import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as adminService from '@/services/adminService';
import { AdminProduct, CreateProductPayload, UpdateProductPayload } from '@/services/adminService';

interface AdminProductState {
  products: AdminProduct[];
  currentProduct: AdminProduct | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  filters: {
    search: string;
    category: string;
  };
}

const initialState: AdminProductState = {
  products: [],
  currentProduct: null,
  status: 'idle',
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  filters: {
    search: '',
    category: 'all',
  },
};

export const fetchAdminProducts = createAsyncThunk(
  'adminProduct/fetchProducts',
  async ({ page = 1, limit = 10, search = '', category = 'all' }: { page?: number; limit?: number; search?: string; category?: string }, { rejectWithValue }) => {
    try {
      const response = await adminService.fetchAdminProducts(page, limit, { search, category });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'adminProduct/fetchProductDetails',
  async (productId: string, { rejectWithValue }) => {
    try {
      const product = await adminService.fetchAdminProductById(productId);
      return product;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch product details');
    }
  }
);

export const createAdminProduct = createAsyncThunk(
  'adminProduct/createProduct',
  async (payload: CreateProductPayload, { rejectWithValue }) => {
    try {
      const product = await adminService.createAdminProduct(payload);
      return product;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create product');
    }
  }
);

export const updateAdminProduct = createAsyncThunk(
  'adminProduct/updateProduct',
  async (payload: UpdateProductPayload, { rejectWithValue }) => {
    try {
      const product = await adminService.updateAdminProduct(payload);
      return product;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update product');
    }
  }
);

export const deleteAdminProduct = createAsyncThunk(
  'adminProduct/deleteProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      await adminService.deleteAdminProduct(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete product');
    }
  }
);

const adminProductSlice = createSlice({
  name: 'adminProduct',
  initialState,
  reducers: {
    clearAdminProductError: (state) => {
      state.error = null;
    },
    setCurrentProduct: (state, action: PayloadAction<AdminProduct | null>) => {
      state.currentProduct = action.payload;
    },
    setFilters: (state, action: PayloadAction<{ search?: string; category?: string }>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page on filter change
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Fetch Products
      .addCase(fetchAdminProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload.products;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
        state.error = null;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Create Product
      .addCase(createAdminProduct.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createAdminProduct.fulfilled, (state, action: PayloadAction<AdminProduct>) => {
        state.status = 'succeeded';
        state.products.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createAdminProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Update Product
      .addCase(updateAdminProduct.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateAdminProduct.fulfilled, (state, action: PayloadAction<AdminProduct>) => {
        state.status = 'succeeded';
        const index = state.products.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?._id === action.payload._id) {
          state.currentProduct = action.payload;
        }
        state.error = null;
      })
      .addCase(updateAdminProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Delete Product
      .addCase(deleteAdminProduct.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteAdminProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.products = state.products.filter((p) => p._id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentProduct?._id === action.payload) {
          state.currentProduct = null;
        }
        state.error = null;
      })
      .addCase(deleteAdminProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminProductError, setCurrentProduct, setFilters, setPage } = adminProductSlice.actions;
export default adminProductSlice.reducer;

