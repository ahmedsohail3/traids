import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getJobsApi, getJobByIdApi, getJobRatingsApi, submitJobRatingApi, createJobApi, acceptJobApplicationApi, rejectJobApplicationApi } from '~services/companyJobsService';
import { buildCreateJobFormData } from '~utils/buildFormData';
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

export const createJob = createAsyncThunk(
  'companyJobs/createJob',
  async (formValues, { rejectWithValue }) => {
    try {
      const formData = buildCreateJobFormData(formValues);
      const res      = await createJobApi(formData);
      return res.data ?? res;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const acceptJobApplication = createAsyncThunk(
  'companyJobs/acceptJobApplication',
  async (applicationId, { rejectWithValue }) => {
    try {
      const res = await acceptJobApplicationApi(applicationId);
      return res?.data ?? res;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const rejectJobApplication = createAsyncThunk(
  'companyJobs/rejectJobApplication',
  async (applicationId, { rejectWithValue }) => {
    try {
      const res = await rejectJobApplicationApi(applicationId);
      return res?.data ?? res;
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
    // Create
    creatingJob:    false,
    createJobError: null,
    // Ratings
    ratingsData: { totalRatings: 0, averageRating: 0, ratings: [] },
    loadingRatings:   false,
    submittingRating: false,
    ratingsError:     null,
    // Application actions
    processingApplication:  false,
    applicationActionError: null,
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
      // Create
      .addCase(createJob.pending, (state) => {
        state.creatingJob    = true;
        state.createJobError = null;
      })
      .addCase(createJob.fulfilled, (state, { payload }) => {
        state.creatingJob = false;
        if (payload) {
          state.jobs.unshift(payload);
          state.jobCount += 1;
        }
      })
      .addCase(createJob.rejected, (state, { payload }) => {
        state.creatingJob    = false;
        state.createJobError = payload ?? 'Failed to create job.';
      })
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
      // Accept application
      .addCase(acceptJobApplication.pending, (state) => {
        state.processingApplication  = true;
        state.applicationActionError = null;
      })
      .addCase(acceptJobApplication.fulfilled, (state) => {
        state.processingApplication = false;
      })
      .addCase(acceptJobApplication.rejected, (state, { payload }) => {
        state.processingApplication  = false;
        state.applicationActionError = payload ?? 'Failed to accept application.';
      })
      // Reject application
      .addCase(rejectJobApplication.pending, (state) => {
        state.processingApplication  = true;
        state.applicationActionError = null;
      })
      .addCase(rejectJobApplication.fulfilled, (state) => {
        state.processingApplication = false;
      })
      .addCase(rejectJobApplication.rejected, (state, { payload }) => {
        state.processingApplication  = false;
        state.applicationActionError = payload ?? 'Failed to reject application.';
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
