import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';
import { setupInterceptors } from '@/services/api';
import cartReducer from './cartSlice';
import userReducer from './userSlice';
import wishlistReducer from './wishlistSlice';
import categoryReducer from './categorySlice';
import homeReducer from './homeSlice';
import searchReducer from './searchSlice';
import productDetailsReducer from './productDetailsSlice';
import addressReducer from './addressSlice';
import orderConfirmationReducer from './orderConfirmationSlice';
import adminReducer from './adminSlice';
import adminProductReducer from './adminProductSlice';
import adminOrderReducer from './adminOrderSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    user: userReducer,
    wishlist: wishlistReducer,
    categories: categoryReducer,
    home: homeReducer,
    search: searchReducer,
    productDetails: productDetailsReducer,
    address: addressReducer,
    orderConfirmation: orderConfirmationReducer,
    admin: adminReducer,
    adminProduct: adminProductReducer,
    adminOrder: adminOrderReducer,
  },
});

setupInterceptors(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
