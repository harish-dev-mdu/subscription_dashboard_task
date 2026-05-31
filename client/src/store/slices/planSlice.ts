import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PlanState } from '../../types/subscription';
import api from '../../lib/axios';

const initialState: PlanState = {
  plans: [],
  selectedPlan: null,
  isLoading: false,
  error: null,
};

export const fetchPlans = createAsyncThunk(
  'plans/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/plans');
      return response.data.data.plans;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch plans');
    }
  }
);

export const fetchPlanById = createAsyncThunk(
  'plans/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/plans/${id}`);
      return response.data.data.plan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch plan');
    }
  }
);

const planSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    selectPlan: (state, action) => {
      state.selectedPlan = action.payload;
    },
    clearSelectedPlan: (state) => {
      state.selectedPlan = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPlanById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPlanById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPlan = action.payload;
      })
      .addCase(fetchPlanById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectPlan, clearSelectedPlan } = planSlice.actions;
export default planSlice.reducer;
