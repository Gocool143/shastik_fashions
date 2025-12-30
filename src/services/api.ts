import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Unauthenticated API instance
export const unauthApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authenticated API instance with interceptors
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store injection to avoid circular dependency and require() calls
let store: any;

export const setupInterceptors = (injectedStore: any) => {
  store = injectedStore;
};

api.interceptors.request.use(
  (config) => {
    if (store) {
      const token = store.getState().user.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // Fallback to localStorage if store is not yet injected
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Logic for token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      if (!store) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      const { updateAccessToken, clearAuthData } = await import('../store/userSlice');
      const { refreshToken: refreshTokenApi } = await import('./authService');

      const refreshToken = store.getState().user.refreshToken;

      if (refreshToken) {
        try {
          const res: any = await refreshTokenApi(refreshToken);
          const newToken = res.data.token;

          store.dispatch(updateAccessToken(newToken));

          processQueue(null, newToken);
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          store.dispatch(clearAuthData());
          isRefreshing = false;
          return Promise.reject(refreshError);
        }
      } else {
        store.dispatch(clearAuthData());
        isRefreshing = false;
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);