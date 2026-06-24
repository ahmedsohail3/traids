import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getJobsApi, getJobByIdApi, getJobRatingsApi, submitJobRatingApi, createJobApi, updateJobApi, acceptJobApplicationApi, rejectJobApplicationApi, deleteJobApi, getJobApplicationsApi, startJobApi, completeJobApi, sendOfferApi, sendOfferForJobApi } from '~services/companyJobsService';
import { buildCreateJobFormData, buildUpdateJobFormData, buildSendOfferFormData } from '~utils/buildFormData';
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

export const updateJob = createAsyncThunk(
  'companyJobs/updateJob',
  async ({ jobId, fields }, { rejectWithValue }) => {
    try {
      const formData = buildUpdateJobFormData(fields);
      const res      = await updateJobApi(jobId, formData);
      return { jobId, data: res.data ?? res };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteJob = createAsyncThunk(
  'companyJobs/deleteJob',
  async (jobId, { rejectWithValue }) => {
    try {
      await deleteJobApi(jobId);
      return jobId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const startJob = createAsyncThunk(
  'companyJobs/startJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await startJobApi(jobId);
      return { jobId, data: res.data ?? res };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const completeJob = createAsyncThunk(
  'companyJobs/completeJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await completeJobApi(jobId);
      return { jobId, data: res.data ?? res };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const sendOffer = createAsyncThunk(
  'companyJobs/sendOffer',
  async (fields, { rejectWithValue }) => {
    try {
      const formData = buildSendOfferFormData(fields);
      const res      = await sendOfferApi(formData);
      return res.data ?? res;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const sendOfferForJob = createAsyncThunk(
  'companyJobs/sendOfferForJob',
  async ({ jobId, subcontractorId }, { rejectWithValue }) => {
    try {
      const res = await sendOfferForJobApi(jobId, subcontractorId);
      return res.data ?? res;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchJobApplications = createAsyncThunk(
  'companyJobs/fetchJobApplications',
  async ({ jobId, status = 'pending' }, { rejectWithValue }) => {
    try {
      const res = await getJobApplicationsApi(jobId, status);
      return Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
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
    // Applications list
    applications:        [],
    loadingApplications: false,
    applicationsError:   null,
    // Application actions
    processingApplication:  false,
    applicationActionError: null,
    // Update
    updatingJob:      false,
    updateJobError:   null,
    // Delete
    deletingJob:      false,
    deleteJobError:   null,
    // Start
    startingJob:      false,
    startJobError:    null,
    // Complete
    completingJob:    false,
    completeJobError: null,
    // Send Offer
    sendingOffer:    false,
    sendOfferError:  null,
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
    clearJobApplications: (state) => {
      state.applications      = [];
      state.applicationsError = null;
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
      // Applications list
      .addCase(fetchJobApplications.pending, (state) => {
        state.loadingApplications = true;
        state.applicationsError   = null;
      })
      .addCase(fetchJobApplications.fulfilled, (state, { payload }) => {
        state.loadingApplications = false;
        state.applications        = payload;
      })
      .addCase(fetchJobApplications.rejected, (state, { payload }) => {
        state.loadingApplications = false;
        state.applicationsError   = payload ?? 'Failed to load applications.';
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
      // Update
      .addCase(updateJob.pending, (state) => {
        state.updatingJob    = true;
        state.updateJobError = null;
      })
      .addCase(updateJob.fulfilled, (state, { payload: { jobId, data } }) => {
        state.updatingJob = false;
        if (data) {
          state.jobs = state.jobs.map((j) => (j._id === jobId ? { ...j, ...data } : j));
          if (state.selectedJob?._id === jobId) {
            state.selectedJob = { ...state.selectedJob, ...data };
          }
        }
      })
      .addCase(updateJob.rejected, (state, { payload }) => {
        state.updatingJob    = false;
        state.updateJobError = payload ?? 'Failed to update job.';
      })
      // Delete
      .addCase(deleteJob.pending, (state) => {
        state.deletingJob    = true;
        state.deleteJobError = null;
      })
      .addCase(deleteJob.fulfilled, (state, { payload: jobId }) => {
        state.deletingJob = false;
        state.jobs        = state.jobs.filter((j) => (j._id ?? j.id) !== jobId);
        state.jobCount    = Math.max(0, state.jobCount - 1);
      })
      .addCase(deleteJob.rejected, (state, { payload }) => {
        state.deletingJob    = false;
        state.deleteJobError = payload ?? 'Failed to delete job.';
      })
      // Start
      .addCase(startJob.pending, (state) => {
        state.startingJob = true;
        state.startJobError = null;
      })
      .addCase(startJob.fulfilled, (state, { payload: { jobId, data } }) => {
        state.startingJob = false;
        if (data) {
          state.jobs = state.jobs.map((j) => (j._id === jobId ? { ...j, ...data } : j));
          if (state.selectedJob?._id === jobId) {
            state.selectedJob = { ...state.selectedJob, ...data };
          }
        }
      })
      .addCase(startJob.rejected, (state, { payload }) => {
        state.startingJob   = false;
        state.startJobError = payload ?? 'Failed to start job.';
      })
      // Complete
      .addCase(completeJob.pending, (state) => {
        state.completingJob    = true;
        state.completeJobError = null;
      })
      .addCase(completeJob.fulfilled, (state, { payload: { jobId, data } }) => {
        state.completingJob = false;
        if (data) {
          state.jobs = state.jobs.map((j) => (j._id === jobId ? { ...j, ...data } : j));
          if (state.selectedJob?._id === jobId) {
            state.selectedJob = { ...state.selectedJob, ...data };
          }
        }
      })
      .addCase(completeJob.rejected, (state, { payload }) => {
        state.completingJob    = false;
        state.completeJobError = payload ?? 'Failed to complete job.';
      })
      // Send Offer
      .addCase(sendOffer.pending, (state) => {
        state.sendingOffer   = true;
        state.sendOfferError = null;
      })
      .addCase(sendOffer.fulfilled, (state, { payload }) => {
        state.sendingOffer = false;
        if (payload?._id) {
          state.jobs.unshift(payload);
          state.jobCount += 1;
        }
      })
      .addCase(sendOffer.rejected, (state, { payload }) => {
        state.sendingOffer   = false;
        state.sendOfferError = payload ?? 'Failed to send offer.';
      })
      // Send Offer — existing job
      .addCase(sendOfferForJob.pending, (state) => {
        state.sendingOffer   = true;
        state.sendOfferError = null;
      })
      .addCase(sendOfferForJob.fulfilled, (state) => {
        state.sendingOffer = false;
      })
      .addCase(sendOfferForJob.rejected, (state, { payload }) => {
        state.sendingOffer   = false;
        state.sendOfferError = payload ?? 'Failed to send offer.';
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

export const { clearCompanyJobs, clearSelectedJob, clearRatings, clearJobApplications } = companyJobsSlice.actions;
export default companyJobsSlice.reducer;
