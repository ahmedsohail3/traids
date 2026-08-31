import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getRecommendedJobsApi,
  getAvailableJobsApi,
  getJobDetailsApi,
  applyForJobApi,
  withdrawJobApplicationApi,
  acceptJobOfferApi,
  rejectJobOfferApi,
} from '~services/subcontractorJobsService';
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

export const fetchJobDetails = makeJobThunk(
  'subcontractorJobs/fetchJobDetails',
  getJobDetailsApi,
);

// Available jobs — custom thunk to extract pagination metadata alongside the list.
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

// Offer actions — accept / reject a company-sent offer.
const makeOfferActionThunk = (typePrefix, apiFn) =>
  createAsyncThunk(typePrefix, async (offerId, { rejectWithValue }) => {
    try {
      const res = await apiFn(offerId);
      return { offerId, data: res?.data ?? res };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  });

export const acceptJobOffer = makeOfferActionThunk('subcontractorJobs/acceptJobOffer', acceptJobOfferApi);
export const rejectJobOffer = makeOfferActionThunk('subcontractorJobs/rejectJobOffer', rejectJobOfferApi);

// Apply for job — sends multipart/form-data to POST /job-applications.
export const applyForJob = createAsyncThunk(
  'subcontractorJobs/applyForJob',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await applyForJobApi(formData);
      return res?.data ?? res;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const withdrawJobApplication = createAsyncThunk(
  'subcontractorJobs/withdrawJobApplication',
  async (applicationId, { rejectWithValue }) => {
    try {
      const res = await withdrawJobApplicationApi(applicationId);
      return res?.data ?? res;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── State factories ────────────────────────────────────────────────────────────

const listState      = () => ({ data: [], loading: false, error: null });
const pagedListState = () => ({ data: [], loading: false, error: null, page: 1, totalPages: 1, totalCount: 0 });
const detailState    = () => ({ data: null, loading: false, error: null });

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
    recommendedJobs:  listState(),
    availableJobs:    pagedListState(),
    jobDetails:       detailState(),
    // Apply for job
    applyingForJob:   false,
    applyForJobError: null,
    // Withdrawing an application from the Requested tab
    withdrawingApplication: false,
    withdrawApplicationError: null,
    // Offer actions (accept / reject / future: withdraw, counter)
    processingOfferAction: false,
    offerActionError:      null,
  },
  reducers: {
    clearRecommendedJobs: (state) => { state.recommendedJobs = listState(); },
    clearAvailableJobs:   (state) => { state.availableJobs   = pagedListState(); },
    clearJobDetails:      (state) => { state.jobDetails       = detailState(); },
    clearApplyForJob:     (state) => { state.applyingForJob = false; state.applyForJobError = null; },
    clearOfferAction:     (state) => { state.processingOfferAction = false; state.offerActionError = null; },
    clearAllJobs: () => ({
      recommendedJobs:       listState(),
      availableJobs:         pagedListState(),
      jobDetails:            detailState(),
      applyingForJob:           false,
      applyForJobError:         null,
      withdrawingApplication:   false,
      withdrawApplicationError: null,
      processingOfferAction: false,
      offerActionError:      null,
    }),
  },
  extraReducers: (builder) => {
    addJobCases(builder, fetchRecommendedJobs, 'recommendedJobs');

    // Job details
    builder
      .addCase(fetchJobDetails.pending, (state) => {
        state.jobDetails.loading = true;
        state.jobDetails.error   = null;
      })
      .addCase(fetchJobDetails.fulfilled, (state, { payload }) => {
        state.jobDetails.loading = false;
        state.jobDetails.data    = payload;
      })
      .addCase(fetchJobDetails.rejected, (state, { payload }) => {
        state.jobDetails.loading = false;
        state.jobDetails.error   = payload ?? 'Failed to load job details.';
      });

    // Available jobs
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

    // Offer actions — shared pending/rejected handler, fulfilled is stateless (caller refreshes)
    [acceptJobOffer, rejectJobOffer].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.processingOfferAction = true;
          state.offerActionError      = null;
        })
        .addCase(thunk.fulfilled, (state) => {
          state.processingOfferAction = false;
        })
        .addCase(thunk.rejected, (state, { payload }) => {
          state.processingOfferAction = false;
          state.offerActionError      = payload ?? 'Failed to process offer.';
        });
    });

    // Apply for job
    builder
      .addCase(applyForJob.pending, (state) => {
        state.applyingForJob   = true;
        state.applyForJobError = null;
      })
      .addCase(applyForJob.fulfilled, (state) => {
        state.applyingForJob = false;
      })
      .addCase(applyForJob.rejected, (state, { payload }) => {
        state.applyingForJob   = false;
        state.applyForJobError = payload ?? 'Failed to submit application.';
      });

    // Withdraw an application — fulfilled is stateless, the caller refetches
    builder
      .addCase(withdrawJobApplication.pending, (state) => {
        state.withdrawingApplication   = true;
        state.withdrawApplicationError = null;
      })
      .addCase(withdrawJobApplication.fulfilled, (state) => {
        state.withdrawingApplication = false;
      })
      .addCase(withdrawJobApplication.rejected, (state, { payload }) => {
        state.withdrawingApplication   = false;
        state.withdrawApplicationError = payload ?? 'Failed to withdraw application.';
      });
  },
});

export const {
  clearRecommendedJobs,
  clearAvailableJobs,
  clearJobDetails,
  clearApplyForJob,
  clearOfferAction,
  clearAllJobs,
} = subcontractorJobsSlice.actions;

export default subcontractorJobsSlice.reducer;
