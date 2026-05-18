import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRecommendedJobsApi, getAvailableJobsApi } from '~services/subcontractorJobsService';
import { getErrorMessage } from '~utils';

// ── Shared thunk factory ───────────────────────────────────────────────────────

const makeJobThunk = (typePrefix, apiFn) =>
  createAsyncThunk(typePrefix, async (arg, { rejectWithValue }) => {
    try {
      const data = await apiFn(arg);
      return data?.data ?? data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  });

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchRecommendedJobs = makeJobThunk(
  'subcontractorJobs/fetchRecommended',
  getRecommendedJobsApi,
);

// Available jobs — custom thunk to extract pagination metadata alongside the list.
// Response shape: { message, count, total, page, totalPages, data: [] }
export const fetchAvailableJobs = createAsyncThunk(
  'subcontractorJobs/fetchAvailable',
  async (filters, { rejectWithValue }) => {
    try {
      const res = await getAvailableJobsApi(filters);
      return {
        jobs:       Array.isArray(res.data) ? res.data : [],
        page:       res.page       ?? filters?.page ?? 1,
        totalPages: res.totalPages ?? 1,
        totalCount: res.total      ?? 0,
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── State factories ────────────────────────────────────────────────────────────

const listState      = () => ({ data: [], loading: false, error: null });
const pagedListState = () => ({ data: [], loading: false, error: null, page: 1, totalPages: 1, totalCount: 0 });

// ── Shared case builder ────────────────────────────────────────────────────────

const addJobCases = (builder, thunk, key) => {
  builder
    .addCase(thunk.pending, (state) => {
      state[key].loading = true;
      state[key].error   = null;
    })
    .addCase(thunk.fulfilled, (state, { payload }) => {
      state[key].loading = false;
      state[key].data    = Array.isArray(payload) ? payload : payload?.jobs ?? payload?.data ?? [];
    })
    .addCase(thunk.rejected, (state, { payload }) => {
      state[key].loading = false;
      state[key].error   = payload ?? 'Failed to load jobs.';
    });
};

// ── Slice ──────────────────────────────────────────────────────────────────────

const subcontractorJobsSlice = createSlice({
  name: 'subcontractorJobs',
  initialState: {
    recommendedJobs: listState(),
    availableJobs:   pagedListState(),
  },
  reducers: {
    clearRecommendedJobs: (state) => { state.recommendedJobs = listState(); },
    clearAvailableJobs:   (state) => { state.availableJobs   = pagedListState(); },
    clearAllJobs: () => ({
      recommendedJobs: listState(),
      availableJobs:   pagedListState(),
    }),
  },
  extraReducers: (builder) => {
    addJobCases(builder, fetchRecommendedJobs, 'recommendedJobs');

    builder
      .addCase(fetchAvailableJobs.pending, (state) => {
        state.availableJobs.loading = true;
        state.availableJobs.error   = null;
      })
      .addCase(fetchAvailableJobs.fulfilled, (state, { payload }) => {
        state.availableJobs.loading    = false;
        state.availableJobs.data       = payload.jobs;
        state.availableJobs.page       = payload.page;
        state.availableJobs.totalPages = payload.totalPages;
        state.availableJobs.totalCount = payload.totalCount;
      })
      .addCase(fetchAvailableJobs.rejected, (state, { payload }) => {
        state.availableJobs.loading = false;
        state.availableJobs.error   = payload ?? 'Failed to load available jobs.';
      });
  },
});

export const {
  clearRecommendedJobs,
  clearAvailableJobs,
  clearAllJobs,
} = subcontractorJobsSlice.actions;

export default subcontractorJobsSlice.reducer;
