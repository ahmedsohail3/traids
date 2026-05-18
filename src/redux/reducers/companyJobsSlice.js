import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getJobsApi, getJobByIdApi } from '~services/companyJobsService';
import { getErrorMessage } from '~utils';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchCompanyJobs = createAsyncThunk(
  'companyJobs/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getJobsApi();
      return {
        jobs:  Array.isArray(res.data) ? res.data : [],
        count: res.count ?? 0,
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchCompanyJobById = createAsyncThunk(
  'companyJobs/fetchJobById',
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await getJobByIdApi(jobId);
      return res.data ?? res;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const companyJobsSlice = createSlice({
  name: 'companyJobs',
  initialState: {
    // List
    jobs:        [],
    jobCount:    0,
    listLoading: false,
    listError:   null,
    // Detail
    selectedJob:    null,
    detailLoading:  false,
    detailError:    null,
  },
  reducers: {
    clearCompanyJobs: (state) => {
      state.jobs        = [];
      state.jobCount    = 0;
      state.listError   = null;
    },
    clearSelectedJob: (state) => {
      state.selectedJob   = null;
      state.detailError   = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(fetchCompanyJobs.pending, (state) => {
        state.listLoading = true;
        state.listError   = null;
      })
      .addCase(fetchCompanyJobs.fulfilled, (state, { payload }) => {
        state.listLoading = false;
        state.jobs        = payload.jobs;
        state.jobCount    = payload.count;
      })
      .addCase(fetchCompanyJobs.rejected, (state, { payload }) => {
        state.listLoading = false;
        state.listError   = payload ?? 'Failed to load jobs.';
      })
      // Detail
      .addCase(fetchCompanyJobById.pending, (state) => {
        state.detailLoading = true;
        state.detailError   = null;
      })
      .addCase(fetchCompanyJobById.fulfilled, (state, { payload }) => {
        state.detailLoading = false;
        state.selectedJob   = payload;
      })
      .addCase(fetchCompanyJobById.rejected, (state, { payload }) => {
        state.detailLoading = false;
        state.detailError   = payload ?? 'Failed to load job details.';
      });
  },
});

export const { clearCompanyJobs, clearSelectedJob } = companyJobsSlice.actions;
export default companyJobsSlice.reducer;
