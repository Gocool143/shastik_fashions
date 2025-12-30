
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as authService from '@/services/authService';
// import { getLocalStorageItem, getParsedLocalStorageItem } from '../lib/utils';
import { AuthResponse, User } from '@/types';

interface UserState {
  token: string | null;
  refreshToken: string | null;
  profile: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// const initialState: UserState = {
//   token: getLocalStorageItem('authToken'),
//   refreshToken: getLocalStorageItem('refreshToken'),
//   profile: getParsedLocalStorageItem('userProfile'),
//   status: 'idle',
//   error: null,
// };

const initialState: UserState = {
  token: localStorage.getItem('authToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  profile: localStorage.getItem('userProfile') ? JSON.parse(localStorage.getItem('userProfile')!) : null,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      console.log("response =>", response);

      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userProfile', JSON.stringify(response.data));
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const register = createAsyncThunk(
  'user/register',
  async (credentials: { name: string; email: string; mobile: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.register(credentials);
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userProfile', JSON.stringify(response.data));
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: any, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      localStorage.setItem('userProfile', JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getProfile = createAsyncThunk(
  'user/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      localStorage.setItem('userProfile', JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<{ token: string; refreshToken: string; user: User }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.profile = action.payload.user;
      state.status = 'succeeded';
      localStorage.setItem('authToken', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('userProfile', JSON.stringify(action.payload.user));
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('authToken', action.payload);
    },
    clearAuthData: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.profile = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userProfile');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.status = 'succeeded';
        state.token = action.payload.data.token;
        state.refreshToken = action.payload.data.refreshToken;
        state.profile = action.payload.data;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.token = null;
        state.profile = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userProfile');
      })
      // Register
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.status = 'succeeded';
        state.token = action.payload.data.token;
        state.refreshToken = action.payload.data.refreshToken;
        state.profile = action.payload.data;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.token = null;
        state.profile = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userProfile');
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setAuthData, updateAccessToken, clearAuthData } = userSlice.actions;
export default userSlice.reducer;
