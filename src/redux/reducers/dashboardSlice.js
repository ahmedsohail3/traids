import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCompanyDashboardApi, getSubcontractorDashboardApi } from '~services/dashboardService';
import { getErrorMessage } from '~utils';

// ── Shared async thunk factory ─────────────────────────────────────────────────
// Keeps thunk logic identical across roles — only the API call differs.

const makeDashboardThunk = (typePrefix, apiFn) =>
  createAsyncThunk(typePrefix, async (_, { rejectWithValue }) => {
    try {
      const data = await apiFn();
      return data?.data ?? data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  });

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchCompanyDashboard = makeDashboardThunk(
  'dashboard/fetchCompany',
  getCompanyDashboardApi,
);

export const fetchSubcontractorDashboard = makeDashboardThunk(
  'dashboard/fetchSubcontractor',
  getSubcontractorDashboardApi,
);

// ── Shared role-slice builder ──────────────────────────────────────────────────
// Wires pending / fulfilled / rejected cases for any role thunk into its
// dedicated sub-state key (e.g. state.company, state.subcontractor).

const roleState = () => ({ data: null, loading: false, error: null });

const addRoleCases = (builder, thunk, key) => {
  builder
    .addCase(thunk.pending,   (state) => { state[key].loading = true;  state[key].error = null; })
    .addCase(thunk.fulfilled, (state, { payload }) => { state[key].loading = false; state[key].data = payload; })
    .addCase(thunk.rejected,  (state, { payload }) => { state[key].loading = false; state[key].error = payload ?? 'Failed to load dashboard.'; });
};

// ── Slice ──────────────────────────────────────────────────────────────────────

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    company:       roleState(),
    subcontractor: roleState(),
  },
  reducers: {
    clearCompanyDashboard:       (state) => { state.company       = roleState(); },
    clearSubcontractorDashboard: (state) => { state.subcontractor = roleState(); },
    clearAllDashboards:          ()      => ({ company: roleState(), subcontractor: roleState() }),
  },
  extraReducers: (builder) => {
    addRoleCases(builder, fetchCompanyDashboard,       'company');
    addRoleCases(builder, fetchSubcontractorDashboard, 'subcontractor');
  },
});

export const {
  clearCompanyDashboard,
  clearSubcontractorDashboard,
  clearAllDashboards,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
