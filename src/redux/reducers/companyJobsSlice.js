import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getJobsApi, getJobByIdApi, getJobRatingsApi, submitJobRatingApi } from '~services/companyJobsService';
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

export const fetchJobRatings = createAsyncThunk(
  'companyJobs/fetchJobRatings',
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await getJobRatingsApi(jobId);
      return {
        totalRatings:  res.totalRatings  ?? 0,
        averageRating: res.averageRating ?? 0,
        ratings:       Array.isArray(res.ratings) ? res.ratings : [],
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const postJobRating = createAsyncThunk(
  'companyJobs/postJobRating',
  async ({ jobId, subcontractorId, rating, comment }, { rejectWithValue }) => {
    try {
      await submitJobRatingApi(jobId, subcontractorId, { rating, comment });
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
    // Ratings
    ratingsData: { totalRatings: 0, averageRating: 0, ratings: [] },
    loadingRatings:   false,
    submittingRating: false,
    ratingsError:     null,
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
    clearRatings: (state) => {
      state.ratingsData = { totalRatings: 0, averageRating: 0, ratings: [] };
      state.ratingsError = null;
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
      // Ratings — fetch
      .addCase(fetchJobRatings.pending, (state) => {
        state.loadingRatings = true;
        state.ratingsError   = null;
      })
      .addCase(fetchJobRatings.fulfilled, (state, { payload }) => {
        state.loadingRatings = false;
        state.ratingsData    = payload;
      })
      .addCase(fetchJobRatings.rejected, (state, { payload }) => {
        state.loadingRatings = false;
        state.ratingsError   = payload ?? 'Failed to load ratings.';
      })
      // Ratings — submit
      .addCase(postJobRating.pending, (state) => {
        state.submittingRating = true;
        state.ratingsError     = null;
      })
      .addCase(postJobRating.fulfilled, (state) => {
        state.submittingRating = false;
      })
      .addCase(postJobRating.rejected, (state, { payload }) => {
        state.submittingRating = false;
        state.ratingsError     = payload ?? 'Failed to submit rating.';
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

export const { clearCompanyJobs, clearSelectedJob, clearRatings } = companyJobsSlice.actions;
export default companyJobsSlice.reducer;
