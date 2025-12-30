
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as cartService from '@/services/cartService';
import { Product } from '@/types';
import { getProductById } from '@/services/productService';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedImage?: string;
}

export interface CartState {
  data: CartItem[];
  total: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  updatingItemId: string | null;
  error: string | null;
}

const initialState: CartState = {
  data: [],
  total: 0,
  status: 'idle',
  updatingItemId: null,
  error: null,
};

// Helper to determine if product needs fetching
const ensureProductData = async (item: any): Promise<CartItem> => {
  if (item.product && typeof item.product === 'object' && item.product.name) {
    return {
      product: item.product,
      quantity: item.quantity,
      selectedColor: item.variant?.color || item.color || item.selectedColor,
      selectedImage: item.variant?.image || item.image || item.selectedImage
    };
  }

  const productId = typeof item.product === 'string' ? item.product : item.product?._id;
  if (!productId) {
    throw new Error('Product ID missing in cart item');
  }

  const product = await getProductById(productId);
  return {
    product,
    quantity: item.quantity,
    selectedColor: item.variant?.color || item.color || item.selectedColor,
    selectedImage: item.variant?.image || item.image || item.selectedImage
  };
};

// Async thunk to fetch the cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await cartService.getCart();

      // Handle both array response and object with data property
      const rawItems = Array.isArray(response) ? response : (response.data || []);

      const cartItems = await Promise.all(
        rawItems.map(async (item: any) => {
          return await ensureProductData(item);
        })
      );
      return cartItems;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return [];
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to add an item to the cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity, color, image }: { productId: string, quantity: number, color?: string, image?: string }, { dispatch, rejectWithValue }) => {
    try {
      await cartService.addToCart(productId, quantity, color, image);
      dispatch(fetchCart());
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to update an item's quantity in the cart
export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ productId, quantity }: { productId: string; quantity: number }, { dispatch, rejectWithValue }) => {
    try {
      if (quantity <= 0) {
        await cartService.removeCartItem(productId);
      } else {
        await cartService.updateCartItem(productId, quantity);
      }
      await dispatch(fetchCart()).unwrap();
      return { productId, quantity };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to remove an item from the cart
export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (productId: string, { dispatch, rejectWithValue }) => {
    try {
      await cartService.removeCartItem(productId);
      dispatch(fetchCart());
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to clear the entire cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    localClearCart: (state) => {
      state.data = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.total = calculateTotal(action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Update Cart Item Quantity (Optimistic)
      .addCase(updateCartItemQuantity.pending, (state, action) => {
        state.updatingItemId = action.meta.arg.productId;
        const item = state.data.find(i => (i.product._id || (i.product as any).id) === action.meta.arg.productId);
        if (item) {
          item.quantity = action.meta.arg.quantity;
          state.total = calculateTotal(state.data);
        }
      })
      .addCase(updateCartItemQuantity.fulfilled, (state) => {
        state.updatingItemId = null;
        state.status = 'succeeded';
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.updatingItemId = null;
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Add To Cart
      .addCase(addToCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Remove Cart Item
      .addCase(removeCartItem.pending, (state, action) => {
        state.updatingItemId = action.meta.arg;
      })
      .addCase(removeCartItem.fulfilled, (state) => {
        state.updatingItemId = null;
        state.status = 'succeeded';
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.updatingItemId = null;
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.status = 'succeeded';
        state.data = [];
        state.total = 0;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { localClearCart } = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.data;
export const selectTotalItems = (state: { cart: CartState }) => state.cart.data.reduce((sum, item) => sum + item.quantity, 0);
export const selectTotalPrice = (state: { cart: CartState }) => state.cart.total;
export const selectUpdatingItemId = (state: { cart: CartState }) => state.cart.updatingItemId;

export default cartSlice.reducer;
