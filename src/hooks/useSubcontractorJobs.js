import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRecommendedJobs,
  fetchAvailableJobs,
  fetchJobDetails,
  applyForJob as applyForJobThunk,
  withdrawJobApplication as withdrawJobApplicationThunk,
  acceptJobOffer as acceptJobOfferThunk,
  rejectJobOffer as rejectJobOfferThunk,
  clearRecommendedJobs,
  clearAvailableJobs,
  clearJobDetails,
  clearApplyForJob,
  clearOfferAction,
  clearAllJobs,
} from '~redux/reducers/subcontractorJobsSlice';

// ── Memoized selectors ─────────────────────────────────────────────────────────

const selectRecommended    = (s) => s.subcontractorJobs.recommendedJobs;
const selectAvailable      = (s) => s.subcontractorJobs.availableJobs;
const selectJobDetails     = (s) => s.subcontractorJobs.jobDetails;
const selectApplyingForJob        = (s) => s.subcontractorJobs.applyingForJob;
const selectApplyError            = (s) => s.subcontractorJobs.applyForJobError;
const selectWithdrawingApplication = (s) => s.subcontractorJobs.withdrawingApplication;
const selectProcessingOfferAction = (s) => s.subcontractorJobs.processingOfferAction;
const selectOfferActionError      = (s) => s.subcontractorJobs.offerActionError;

const useSubcontractorJobs = () => {
  const dispatch = useDispatch();

  const recommended    = useSelector(selectRecommended);
  const available      = useSelector(selectAvailable);
  const details        = useSelector(selectJobDetails);
  const applyingForJob        = useSelector(selectApplyingForJob);
  const applyForJobError      = useSelector(selectApplyError);
  const withdrawingApplication = useSelector(selectWithdrawingApplication);
  const processingOfferAction = useSelector(selectProcessingOfferAction);
  const offerActionError      = useSelector(selectOfferActionError);

  // ── Recommended Jobs ─────────────────────────────────────────────────────────
  const getRecommendedJobs   = useCallback(() => dispatch(fetchRecommendedJobs()),        [dispatch]);
  const resetRecommendedJobs = useCallback(() => dispatch(clearRecommendedJobs()),        [dispatch]);

  // ── Available Jobs ───────────────────────────────────────────────────────────
  const getAvailableJobs   = useCallback((filters = {}) => dispatch(fetchAvailableJobs(filters)), [dispatch]);
  const resetAvailableJobs = useCallback(() => dispatch(clearAvailableJobs()),            [dispatch]);

  // ── Job Details ──────────────────────────────────────────────────────────────
  const getJobDetails   = useCallback((jobId) => dispatch(fetchJobDetails(jobId)),        [dispatch]);
  const resetJobDetails = useCallback(() => dispatch(clearJobDetails()),                  [dispatch]);

  // ── Apply For Job ────────────────────────────────────────────────────────────
  const applyForJob      = useCallback((formData) => dispatch(applyForJobThunk(formData)).unwrap(), [dispatch]);
  const withdrawApplication = useCallback(
    (applicationId) => dispatch(withdrawJobApplicationThunk(applicationId)).unwrap(),
    [dispatch],
  );
  const resetApplyForJob = useCallback(() => dispatch(clearApplyForJob()),                [dispatch]);

  // ── Offer Actions ─────────────────────────────────────────────────────────────
  const acceptJobOffer      = useCallback((offerId) => dispatch(acceptJobOfferThunk(offerId)).unwrap(), [dispatch]);
  const rejectJobOffer      = useCallback((offerId) => dispatch(rejectJobOfferThunk(offerId)).unwrap(), [dispatch]);
  const resetOfferAction    = useCallback(() => dispatch(clearOfferAction()),              [dispatch]);

  // ── Shared ───────────────────────────────────────────────────────────────────
  const resetAll = useCallback(() => dispatch(clearAllJobs()), [dispatch]);

  return {
    // Recommended jobs
    recommendedJobs:    recommended.data,
    recommendedLoading: recommended.loading,
    recommendedError:   recommended.error,
    getRecommendedJobs,
    resetRecommendedJobs,

    // Available jobs
    availableJobs:       available.data,
    availableLoading:    available.loading,
    availableError:      available.error,
    availablePage:       available.page,
    availableTotalPages: available.totalPages,
    availableTotalCount: available.totalCount,
    getAvailableJobs,
    resetAvailableJobs,

    // Job details
    selectedJob:       details.data,
    loadingJobDetails: details.loading,
    jobDetailsError:   details.error,
    getJobDetails,
    resetJobDetails,

    // Apply for job
    applyForJob,
    withdrawApplication,
    withdrawingApplication,
    applyingForJob,
    applyForJobError,
    resetApplyForJob,

    // Offer actions
    acceptJobOffer,
    rejectJobOffer,
    processingOfferAction,
    offerActionError,
    resetOfferAction,

    // Shared
    resetAll,
  };
};

export default useSubcontractorJobs;
