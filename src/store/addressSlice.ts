import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Address } from '@/types';
import {
  getAddresses as apiGetAddresses,
  addAddress as apiAddAddress,
  updateAddress as apiUpdateAddress,
  deleteAddress as apiDeleteAddress,
  setDefaultAddress as apiSetDefaultAddress,
} from '../services/addressService'; // Import API helper functions

// Define the state shape
interface AddressState {
  addresses: Address[];
  selectedAddressId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the initial state
const initialState: AddressState = {
  addresses: [],
  selectedAddressId: null,
  status: 'idle',
  error: null,
};

// Async Thunks
export const fetchAddresses = createAsyncThunk('address/fetchAddresses', async (_, { rejectWithValue }) => {
  try {
    const response = await apiGetAddresses();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const addAddress = createAsyncThunk(
  'address/addAddress',
  async (newAddress: Omit<Address, 'id' | '_id' | 'user' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await apiAddAddress(newAddress);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateAddress = createAsyncThunk(
  'address/updateAddress',
  async ({ id, updatedAddress }: { id: string; updatedAddress: Partial<Address> }, { rejectWithValue }) => {
    try {
      const response = await apiUpdateAddress(id, updatedAddress);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteAddress = createAsyncThunk('address/deleteAddress', async (id: string, { rejectWithValue }) => {
  try {
    await apiDeleteAddress(id);
    return id; // Return the ID of the deleted address
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const setDefaultAddress = createAsyncThunk('address/setDefaultAddress', async (id: string, { rejectWithValue }) => {
  try {
    const response = await apiSetDefaultAddress(id);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Create the slice
const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setSelectedAddressId: (state, action: PayloadAction<string | null>) => {
      state.selectedAddressId = action.payload;
    },
    // Clear error state if needed
    clearAddressError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAddresses
      .addCase(fetchAddresses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAddresses.fulfilled, (state, action: PayloadAction<Address[]>) => {
        state.status = 'succeeded';
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // addAddress
      .addCase(addAddress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addAddress.fulfilled, (state, action: PayloadAction<Address>) => {
        state.status = 'succeeded';
        state.addresses.push(action.payload);
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // updateAddress
      .addCase(updateAddress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateAddress.fulfilled, (state, action: PayloadAction<Address>) => {
        state.status = 'succeeded';
        const index = state.addresses.findIndex((addr) => addr.id === action.payload.id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // deleteAddress
      .addCase(deleteAddress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteAddress.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.addresses = state.addresses.filter((addr) => addr.id !== action.payload);
        if (state.selectedAddressId === action.payload) {
          state.selectedAddressId = null; // Deselect if the deleted address was selected
        }
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // setDefaultAddress
      .addCase(setDefaultAddress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(setDefaultAddress.fulfilled, (state, action: PayloadAction<Address>) => {
        state.status = 'succeeded';
        state.addresses = state.addresses.map((addr) => ({
          ...addr,
          isDefault: (addr.id || (addr as any)._id) === (action.payload.id || (action.payload as any)._id),
        }));
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { setSelectedAddressId, clearAddressError } = addressSlice.actions;
export default addressSlice.reducer;
