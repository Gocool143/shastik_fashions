import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { login, register, clearAuthData } from '@/store/userSlice';
import { User } from '@/types';

interface Session {
  access_token: string;
  user: User | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, token, status, error } = useSelector((state: RootState) => state.user);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      return { error: null };
    } else {
      return { error: result.payload };
    }
  }, [dispatch]);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    // Note: Backend requires mobile, passing empty string for now or would need UI update
    const result = await dispatch(register({
      email,
      password,
      name: fullName || '',
      mobile: ''
    }));
    if (register.fulfilled.match(result)) {
      return { error: null };
    } else {
      return { error: result.payload };
    }
  }, [dispatch]);

  const signOut = useCallback(async () => {
    dispatch(clearAuthData());
  }, [dispatch]);

  const resetPassword = async (email: string) => {
    console.warn("Reset password not implemented in backend yet");
    return { error: null };
  };

  const updatePassword = async (password: string) => {
    console.warn("Update password not implemented in backend yet");
    return { error: null };
  };

  const session = token ? { access_token: token, user: profile } : null;

  return (
    <AuthContext.Provider
      value={{
        user: profile,
        session,
        loading: status === 'loading',
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
