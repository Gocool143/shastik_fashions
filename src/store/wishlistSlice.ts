
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as wishlistService from '@/services/wishlistService';
import { Product } from '@/types';
import { getProductById } from '@/services/productService';
import { addToCart } from './cartSlice';

interface WishlistState {
  data: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: WishlistState = {
  data: [],
  status: 'idle',
  error: null,
};

// Helper to determine if product needs fetching
const ensureProductData = async (item: any): Promise<Product> => {
  if (item.product && typeof item.product === 'object' && item.product.name) {
    return item.product;
  }

  const productId = typeof item.product === 'string' ? item.product : item.product?._id;
  if (!productId) {
    throw new Error('Product ID missing in wishlist item');
  }

  return await getProductById(productId);
};

// Async thunk to fetch the wishlist
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await wishlistService.getWishlist();
      const rawItems = response.data || response || [];

      const wishlistItems = await Promise.all(
        rawItems.map(async (item: any) => {
          return await ensureProductData(item);
        })
      );
      return wishlistItems;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return [];
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to add an item to the wishlist
export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId: string, { dispatch, rejectWithValue }) => {
    try {
      await wishlistService.addToWishlist(productId);
      dispatch(fetchWishlist());
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to remove an item from the wishlist
export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId: string, { dispatch, rejectWithValue }) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      dispatch(fetchWishlist());
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// New: Async thunk to clear the wishlist
export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await wishlistService.clearWishlist();
      dispatch(fetchWishlist());
    } catch (error: any) {
      // If endpoint fails, we still want to clear local state for UX?
      // No, better to keep it and show error if it's a persistence issue.
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// New: Async thunk to move all items to cart
export const moveAllToCart = createAsyncThunk(
  'wishlist/moveAllToCart',
  async (items: Product[], { dispatch, rejectWithValue }) => {
    try {
      // Add all to cart sequentially or in parallel? Parallel is faster but might hit rate limits.
      // We'll do them in parallel for now as cart API should handle it.
      await Promise.all(
        items.map(item => dispatch(addToCart({ productId: item._id || (item as any).id, quantity: 1 })))
      );

      // After successfully adding to cart, clear wishlist
      await dispatch(clearWishlist());
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistState: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Add To Wishlist (Optimistic)
      .addCase(addToWishlist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addToWishlist.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Remove From Wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeFromWishlist.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Clear Wishlist
      .addCase(clearWishlist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.status = 'succeeded';
        state.data = []; // Immediate local clear
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearWishlistState } = wishlistSlice.actions;

export const selectWishlistItems = (state: { wishlist: WishlistState }) => state.wishlist.data;
export const selectWishlistCount = (state: { wishlist: WishlistState }) => state.wishlist.data.length;

export default wishlistSlice.reducer;
