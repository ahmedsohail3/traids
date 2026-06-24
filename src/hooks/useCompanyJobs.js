import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCompanyJobs,
  fetchCompanyJobById,
  fetchJobApplications,
  fetchJobRatings,
  postJobRating,
  createJob as createJobThunk,
  updateJob as updateJobThunk,
  acceptJobApplication as acceptJobApplicationThunk,
  rejectJobApplication as rejectJobApplicationThunk,
  deleteJob as deleteJobThunk,
  startJob as startJobThunk,
  completeJob as completeJobThunk,
  sendOffer as sendOfferThunk,
  sendOfferForJob as sendOfferForJobThunk,
  clearCompanyJobs,
  clearSelectedJob,
  clearRatings,
  clearJobApplications as clearJobApplicationsAction,
} from '~redux/reducers/companyJobsSlice';

const EMPTY_RATINGS = { totalRatings: 0, averageRating: 0, ratings: [] };

const selectRatingsData      = (s) => s.companyJobs.ratingsData      ?? EMPTY_RATINGS;
const selectLoadingRatings   = (s) => s.companyJobs.loadingRatings   ?? false;
const selectSubmittingRating = (s) => s.companyJobs.submittingRating ?? false;

const useCompanyJobs = () => {
  const dispatch = useDispatch();

  // ── List ─────────────────────────────────────────────────────────────────────
  const jobs     = useSelector((s) => s.companyJobs.jobs);
  const jobCount = useSelector((s) => s.companyJobs.jobCount);
  const loading  = useSelector((s) => s.companyJobs.listLoading);
  const error    = useSelector((s) => s.companyJobs.listError);

  const getJobs = useCallback(() => dispatch(fetchCompanyJobs()),  [dispatch]);
  const reset   = useCallback(() => dispatch(clearCompanyJobs()),  [dispatch]);

  // ── Detail ───────────────────────────────────────────────────────────────────
  const selectedJob   = useSelector((s) => s.companyJobs.selectedJob);
  const detailLoading = useSelector((s) => s.companyJobs.detailLoading);
  const detailError   = useSelector((s) => s.companyJobs.detailError);

  const getJobById       = useCallback((id) => dispatch(fetchCompanyJobById(id)), [dispatch]);
  const resetSelectedJob = useCallback(() => dispatch(clearSelectedJob()),        [dispatch]);

  // ── Ratings ──────────────────────────────────────────────────────────────────
  const ratingsData      = useSelector(selectRatingsData);
  const loadingRatings   = useSelector(selectLoadingRatings);
  const submittingRating = useSelector(selectSubmittingRating);

  const getJobRatings   = useCallback((jobId) => dispatch(fetchJobRatings(jobId)),    [dispatch]);
  const refetchRatings  = useCallback((jobId) => dispatch(fetchJobRatings(jobId)),    [dispatch]);
  const submitJobRating = useCallback(
    (jobId, subcontractorId, rating, comment) =>
      dispatch(postJobRating({ jobId, subcontractorId, rating, comment })).unwrap(),
    [dispatch],
  );
  const resetRatings = useCallback(() => dispatch(clearRatings()), [dispatch]);

  // ── Create ───────────────────────────────────────────────────────────────────
  const creatingJob    = useSelector((s) => s.companyJobs.creatingJob);
  const createJobError = useSelector((s) => s.companyJobs.createJobError);

  const createJob = useCallback(
    (formValues) => dispatch(createJobThunk(formValues)).unwrap(),
    [dispatch],
  );

  // ── Applications List ─────────────────────────────────────────────────────────
  const applications        = useSelector((s) => s.companyJobs.applications        ?? []);
  const loadingApplications = useSelector((s) => s.companyJobs.loadingApplications ?? false);
  const applicationsError   = useSelector((s) => s.companyJobs.applicationsError   ?? null);

  const getJobApplications   = useCallback(
    (jobId, status) => dispatch(fetchJobApplications({ jobId, status })),
    [dispatch],
  );
  const resetJobApplications = useCallback(() => dispatch(clearJobApplicationsAction()), [dispatch]);

  // ── Application Actions ───────────────────────────────────────────────────────
  const processingApplication  = useSelector((s) => s.companyJobs.processingApplication);
  const applicationActionError = useSelector((s) => s.companyJobs.applicationActionError);

  const acceptJobApplication = useCallback(
    (applicationId) => dispatch(acceptJobApplicationThunk(applicationId)).unwrap(),
    [dispatch],
  );

  const rejectJobApplication = useCallback(
    (applicationId) => dispatch(rejectJobApplicationThunk(applicationId)).unwrap(),
    [dispatch],
  );

  // ── Update ────────────────────────────────────────────────────────────────────
  const updatingJob    = useSelector((s) => s.companyJobs.updatingJob);
  const updateJobError = useSelector((s) => s.companyJobs.updateJobError);

  const updateJob = useCallback(
    (jobId, fields) => dispatch(updateJobThunk({ jobId, fields })).unwrap(),
    [dispatch],
  );

  // ── Delete ────────────────────────────────────────────────────────────────────
  const deletingJob    = useSelector((s) => s.companyJobs.deletingJob);
  const deleteJobError = useSelector((s) => s.companyJobs.deleteJobError);

  const deleteJob = useCallback(
    (jobId) => dispatch(deleteJobThunk(jobId)).unwrap(),
    [dispatch],
  );

  // ── Start ─────────────────────────────────────────────────────────────────────
  const startingJob   = useSelector((s) => s.companyJobs.startingJob);
  const startJobError = useSelector((s) => s.companyJobs.startJobError);

  const startJob = useCallback(
    (jobId) => dispatch(startJobThunk(jobId)).unwrap(),
    [dispatch],
  );

  // ── Complete ──────────────────────────────────────────────────────────────────
  const completingJob    = useSelector((s) => s.companyJobs.completingJob);
  const completeJobError = useSelector((s) => s.companyJobs.completeJobError);

  const completeJob = useCallback(
    (jobId) => dispatch(completeJobThunk(jobId)).unwrap(),
    [dispatch],
  );

  // ── Send Offer ────────────────────────────────────────────────────────────────
  const sendingOffer   = useSelector((s) => s.companyJobs.sendingOffer);
  const sendOfferError = useSelector((s) => s.companyJobs.sendOfferError);

  const sendOffer = useCallback(
    (fields) => dispatch(sendOfferThunk(fields)).unwrap(),
    [dispatch],
  );

  const sendOfferForJob = useCallback(
    (jobId, subcontractorId) => dispatch(sendOfferForJobThunk({ jobId, subcontractorId })).unwrap(),
    [dispatch],
  );

  return {
    // List
    jobs, jobCount, loading, error, getJobs, reset,
    // Detail
    selectedJob, detailLoading, detailError, getJobById, resetSelectedJob,
    // Ratings
    ratingsData, loadingRatings, submittingRating,
    getJobRatings, refetchRatings, submitJobRating, resetRatings,
    // Create
    createJob, creatingJob, createJobError,
    // Applications list
    applications, loadingApplications, applicationsError, getJobApplications, resetJobApplications,
    // Application actions
    acceptJobApplication, rejectJobApplication,
    processingApplication, applicationActionError,
    // Update
    updateJob, updatingJob, updateJobError,
    // Delete
    deleteJob, deletingJob, deleteJobError,
    // Start
    startJob, startingJob, startJobError,
    // Complete
    completeJob, completingJob, completeJobError,
    // Send Offer
    sendOffer, sendOfferForJob, sendingOffer, sendOfferError,
  };
};

export default useCompanyJobs;
