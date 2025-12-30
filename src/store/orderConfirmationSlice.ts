
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';
import { getOrderById } from '@/services/orderService';

// export const fetchOrderDetailsAPI = createAsyncThunk(
//   'products/fetchProductById',
//   async (id: string, { rejectWithValue }) => {
//     try {
//       const response = await getOrderById(id);
//       return response;
//     } catch (error: any) {
//       return rejectWithValue(error.message || 'Failed to fetch product details');
//     }
//   }
// );

// --- Mock API Call ---
// This function simulates fetching order details from an API.
// const fetchOrderDetailsAPI = async (orderId: string) => {
//     console.log(`Fetching order details for orderId: ${orderId}`);
//     const apiResponse = {
//         "success": true,
//         "message": "Order details fetched successfully",
//         "data": {
//             "_id": "691dc2f2cd67736cfe5355f8",
//             "user": { "_id": "690d9c8657f818accb889701", "name": "Gokul", "email": "gokul@gmail.com" },
//             "products": [{ "product": { "_id": "69047ac37c63655a977df575", "name": "Cotton Saree 1", "price": 6852.65 }, "quantity": 1, "_id": "691dc2f2cd67736cfe5355f9" }],
//             "shippingAddress": { "_id": "69159ca41900c55a4c0d8fba", "user": "690d9c8657f818accb889701", "fullName": "Gok", "phone": "09042529808", "email": "gokul@gmail.com", "addressLine1": "22", "addressLine2": "323", "city": "salem", "state": "Tamilnadu", "pincode": "637502", "country": "India", "isDefault": false, "createdAt": "2025-11-13T08:53:56.047Z", "updatedAt": "2025-11-13T08:53:56.047Z", "__v": 0 },
//             "totalAmount": 6892.65,
//             "paymentStatus": "paid",
//             "orderStatus": "processing",
//             "razorpayOrderId": "order_RhbygBQeC8sRag",
//             "razorpayPaymentId": "pay_Rhbyr9sTdaNfer",
//             "createdAt": "2025-11-19T13:15:30.912Z",
//             "updatedAt": "2025-11-19T13:15:30.912Z",
//         }
//     };
//     // Simulate network delay
//     await new Promise(resolve => setTimeout(resolve, 500));

//     if (apiResponse.success) {
//         return {
//             order: apiResponse.data,
//             // Suggested products are not in the new API, so we mock them here.
//             suggestedProducts: [
//                 { _id: 'prod_1', name: 'V-Neck T-Shirt', description: 'A classic v-neck t-shirt made from premium cotton.', originalPrice: 1299, price: 799, category: 'T-Shirts', images: ['https://via.placeholder.com/300x300.png?text=V-Neck+T-Shirt'], fabric: 'Cotton', color: 'White', stock: 150, isBestSeller: true, isNewArrival: false, createdAt: '2025-11-18T10:00:00Z', updatedAt: '2025-11-18T10:00:00Z' },
//                 { _id: 'prod_2', name: 'Leather Jacket', description: 'A stylish leather jacket for all seasons.', originalPrice: 8999, price: 6999, category: 'Jackets', images: ['https://via.placeholder.com/300x300.png?text=Leather+Jacket'], fabric: 'Leather', color: 'Black', stock: 30, isBestSeller: false, isNewArrival: true, createdAt: '2025-11-17T12:00:00Z', updatedAt: '2025-11-17T12:00:00Z' },
//             ]
//         };
//     } else {
//         throw new Error('Failed to fetch order details.');
//     }
// };

// --- State Interface ---
interface OrderConfirmationState {
    order: any | null;
    suggestedProducts: Product[];
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: OrderConfirmationState = {
    order: null,
    suggestedProducts: [],
    loading: 'idle',
    error: null,
};

// --- Async Thunk ---
export const fetchOrderById = createAsyncThunk(
    'orderConfirmation/fetchById',
    async (orderId: string, { rejectWithValue }) => {
        try {
            const response:any = await getOrderById(orderId);
            return {
                order: response.data,
                suggestedProducts: [],
            };
        } catch (error:any) {
            return rejectWithValue(error.message || 'Failed to fetch order details');
        }
    }
);


// --- Slice Definition ---
const orderConfirmationSlice = createSlice({
    name: 'orderConfirmation',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrderById.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<{ order: any; suggestedProducts: Product[] }>) => {
                state.loading = 'succeeded';
                state.order = action.payload.order;
                state.suggestedProducts = action.payload.suggestedProducts || [];
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
            });
    },
});

export default orderConfirmationSlice.reducer;
