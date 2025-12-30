import { useEffect, createContext, useContext, ReactNode, useState, useCallback } from 'react';
import * as authService from '@/services/authService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuthData, setAuthData, login as loginThunk, register as registerThunk } from '@/store/userSlice';
import { User } from '@/types';

interface BackendAuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  refreshUser: () => Promise<void>;
}

const BackendAuthContext = createContext<BackendAuthContextType | undefined>(undefined);

export const BackendAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.profile);
  const loading = useAppSelector(state => state.user.status === 'loading');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshUser = useCallback(async () => {
    // If we have a token but no profile, or just to sync state
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsAuthenticated(false);
      dispatch(clearAuthData());
      return;
    }

    setIsAuthenticated(true);
    // In a real app, we might call a /me endpoint here
  }, [dispatch]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      // Assuming registerThunk handles state and localStorage
      const result = await dispatch(registerThunk({ email, password, name: fullName || '', mobile: '' })).unwrap();
      setIsAuthenticated(true);
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error || 'Signup failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await dispatch(loginThunk({ email, password })).unwrap();
      setIsAuthenticated(true);
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error || 'Login failed') };
    }
  };

  const signOut = async () => {
    dispatch(clearAuthData());
    setIsAuthenticated(false);
  };

  const resetPassword = async (email: string) => {
    // Not implemented in authService currently
    return { error: new Error('Not implemented') };
  };

  const updatePassword = async (password: string) => {
    // Not implemented in authService currently
    return { error: new Error('Not implemented') };
  };

  return (
    <BackendAuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        refreshUser,
      }}
    >
      {children}
    </BackendAuthContext.Provider>
  );
};

export const useBackendAuth = () => {
  const context = useContext(BackendAuthContext);
  if (!context) {
    throw new Error('useBackendAuth must be used within a BackendAuthProvider');
  }
  return context;
};
