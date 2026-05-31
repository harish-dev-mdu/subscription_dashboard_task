import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SubscriptionState } from '../../types/subscription';
import api from '../../lib/axios';

const initialState: SubscriptionState = {
  currentSubscription: null,
  subscriptionHistory: [],
  isLoading: false,
  error: null,
};

export const fetchMySubscription = createAsyncThunk(
  'subscription/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/subscriptions/me');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription');
    }
  }
);

export const createSubscriptionOrder = createAsyncThunk(
  'subscription/createOrder',
  async (planId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/subscriptions/${planId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create subscription');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'subscription/verifyPayment',
  async (data: { orderId: string; paymentId: string; signature?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/subscriptions/verify', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (reason: string, { rejectWithValue }) => {
    try {
      const response = await api.delete('/subscriptions/cancel', { data: { reason } });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
    clearSubscription: (state) => {
      state.currentSubscription = null;
      state.subscriptionHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMySubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMySubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubscription = action.payload.currentSubscription;
        state.subscriptionHistory = action.payload.subscriptionHistory;
      })
      .addCase(fetchMySubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createSubscriptionOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSubscriptionOrder.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createSubscriptionOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.currentSubscription = action.payload.subscription;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.currentSubscription = action.payload.subscription;
      });
  },
});

export const { clearSubscriptionError, clearSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
