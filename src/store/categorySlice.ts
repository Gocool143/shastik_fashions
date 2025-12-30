import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchCategories as fetchCategoriesService,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  fetchCategoryById as fetchCategoryByIdService,
  CreateCategoryPayload
} from '@/services/categoryService';

import { Category } from '@/types';

interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  currentCategory: null,
  status: 'idle',
  createStatus: 'idle',
  updateStatus: 'idle',
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const categories = await fetchCategoriesService();
      return categories;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategoryDetails = createAsyncThunk(
  "categories/fetchDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      const category = await fetchCategoryByIdService(id);
      return category;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (payload: CreateCategoryPayload, { rejectWithValue }) => {
    try {
      const category = await createCategoryService(payload);
      return category;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create category";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, payload }: { id: string; payload: CreateCategoryPayload }, { rejectWithValue }) => {
    try {
      const category = await updateCategoryService(id, payload);
      return category;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update category";
      return rejectWithValue(errorMessage);
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    resetCreateStatus: (state) => {
      state.createStatus = 'idle';
      state.error = null;
    },
    resetUpdateStatus: (state) => {
      state.updateStatus = 'idle';
      state.error = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.status = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Fetch Category Details
      .addCase(fetchCategoryDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategoryDetails.fulfilled, (state, action: PayloadAction<Category>) => {
        state.status = 'succeeded';
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.createStatus = 'loading';
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.createStatus = 'succeeded';
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = action.payload as string;
      })
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.updateStatus = 'loading';
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.updateStatus = 'succeeded';
        state.currentCategory = action.payload;
        // Update in list if exists
        const index = state.categories.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetCreateStatus, resetUpdateStatus, clearCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer;
