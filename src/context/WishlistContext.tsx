import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchWishlist,
  addToWishlist as addToWishlistThunk,
  removeFromWishlist as removeFromWishlistThunk,
  clearWishlist as clearWishlistThunk,
  moveAllToCart as moveAllToCartThunk,
  selectWishlistItems,
  selectWishlistCount,
} from '@/store/wishlistSlice';
import { Product } from '@/types';
import { useBackendAuth } from '@/hooks/useBackendAuth';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  moveAllToCart: () => void;
  totalItems: number;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user } = useBackendAuth();
  const items = useAppSelector(selectWishlistItems) as Product[];
  const totalItems = useAppSelector(selectWishlistCount);
  const status = useAppSelector(state => state.wishlist.status);
  const loading = status === 'loading';

  // Fetch wishlist when user logs in or on mount if user is already logged in
  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [user, dispatch]);

  const addToWishlist = (product: Product) => {
    dispatch(addToWishlistThunk(product._id || (product as any).id));
  };

  const removeFromWishlist = (productId: string) => {
    dispatch(removeFromWishlistThunk(productId));
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => (item._id || (item as any).id) === productId);
  };

  const clearWishlist = () => {
    dispatch(clearWishlistThunk());
  };

  const moveAllToCart = () => {
    dispatch(moveAllToCartThunk(items));
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        moveAllToCart,
        totalItems,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export type { Product };
