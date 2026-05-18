import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCompanySubcontractorsApi,
  getCompanySubcontractorProfileApi,
} from '~services/companySubcontractorsService';
import { getErrorMessage } from '~utils';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchCompanySubcontractors = createAsyncThunk(
  'companySubcontractors/fetchList',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await getCompanySubcontractorsApi(filters);
      return data?.data ?? data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchCompanySubcontractorProfile = createAsyncThunk(
  'companySubcontractors/fetchProfile',
  async (subcontractorId, { rejectWithValue }) => {
    try {
      const data = await getCompanySubcontractorProfileApi(subcontractorId);
      return data?.data ?? data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const companySubcontractorsSlice = createSlice({
  name: 'companySubcontractors',
  initialState: {
    list:    { data: [], loading: false, error: null },
    profile: { data: null, loading: false, error: null },
  },
  reducers: {
    clearCompanySubcontractors: (state) => {
      state.list = { data: [], loading: false, error: null };
    },
    clearCompanySubcontractorProfile: (state) => {
      state.profile = { data: null, loading: false, error: null };
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(fetchCompanySubcontractors.pending,   (state) => { state.list.loading = true;  state.list.error = null; })
      .addCase(fetchCompanySubcontractors.fulfilled, (state, { payload }) => { state.list.loading = false; state.list.data = payload; })
      .addCase(fetchCompanySubcontractors.rejected,  (state, { payload }) => { state.list.loading = false; state.list.error = payload ?? 'Failed to load subcontractors.'; })
      // Profile
      .addCase(fetchCompanySubcontractorProfile.pending,   (state) => { state.profile.loading = true;  state.profile.error = null; })
      .addCase(fetchCompanySubcontractorProfile.fulfilled, (state, { payload }) => { state.profile.loading = false; state.profile.data = payload; })
      .addCase(fetchCompanySubcontractorProfile.rejected,  (state, { payload }) => { state.profile.loading = false; state.profile.error = payload ?? 'Failed to load profile.'; });
  },
});

export const {
  clearCompanySubcontractors,
  clearCompanySubcontractorProfile,
} = companySubcontractorsSlice.actions;

export default companySubcontractorsSlice.reducer;
