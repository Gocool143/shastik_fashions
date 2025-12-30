import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as adminService from '@/services/adminService';
import { AdminOrder, UpdateOrderStatusPayload } from '@/services/adminService';

interface AdminOrderState {
  orders: AdminOrder[];
  currentOrder: AdminOrder | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AdminOrderState = {
  orders: [],
  currentOrder: null,
  status: 'idle',
  error: null,
};

export const fetchAdminOrders = createAsyncThunk(
  'adminOrder/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const orders = await adminService.fetchAdminOrders();
      return orders;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'adminOrder/updateStatus',
  async (payload: UpdateOrderStatusPayload, { rejectWithValue }) => {
    try {
      const order = await adminService.updateOrderStatus(payload);
      return order;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update order status');
    }
  }
);

const adminOrderSlice = createSlice({
  name: 'adminOrder',
  initialState,
  reducers: {
    clearAdminOrderError: (state) => {
      state.error = null;
    },
    setCurrentOrder: (state, action: PayloadAction<AdminOrder | null>) => {
      state.currentOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchAdminOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action: PayloadAction<AdminOrder[]>) => {
        state.status = 'succeeded';
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<AdminOrder>) => {
        state.status = 'succeeded';
        const index = state.orders.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
        state.error = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminOrderError, setCurrentOrder } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;

