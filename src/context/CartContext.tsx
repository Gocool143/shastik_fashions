import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchCart,
  addToCart as addToCartThunk,
  removeCartItem,
  updateCartItemQuantity,
  clearCart as clearCartThunk,
  localClearCart,
  selectCartItems,
  selectTotalItems,
  selectTotalPrice,
  selectUpdatingItemId,
  CartItem,
} from '@/store/cartSlice';
import { Product } from '@/types';
import { useBackendAuth } from '@/hooks/useBackendAuth';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, color?: string, quantity?: number, image?: string) => Promise<any>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  updatingItemId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user } = useBackendAuth();
  const items = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectTotalItems);
  const totalPrice = useAppSelector(selectTotalPrice);
  const updatingItemId = useAppSelector(selectUpdatingItemId);
  const status = useAppSelector(state => state.cart.status);
  const loading = status === 'loading';

  // Fetch cart when user logs in or on mount if user is already logged in
  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    } else {
      dispatch(localClearCart());
    }
  }, [user, dispatch]);

  const addToCart = async (product: Product, color?: string, quantity: number = 1, image?: string) => {
    return await dispatch(addToCartThunk({ productId: product._id || (product as any).id, quantity, color, image })).unwrap();
  };

  const removeFromCart = (productId: string) => {
    dispatch(removeCartItem(productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch(updateCartItemQuantity({ productId, quantity }));
  };

  const handleClearCart = () => {
    dispatch(localClearCart()); // Immediate local clear
    if (user) {
      dispatch(clearCartThunk()); // Sync with backend
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart: handleClearCart,
        totalItems,
        totalPrice,
        loading,
        updatingItemId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export type { CartItem };
