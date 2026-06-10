import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCompanyJobs,
  fetchCompanyJobById,
  fetchJobRatings,
  postJobRating,
  createJob as createJobThunk,
  acceptJobApplication as acceptJobApplicationThunk,
  rejectJobApplication as rejectJobApplicationThunk,
  clearCompanyJobs,
  clearSelectedJob,
  clearRatings,
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
    // Application actions
    acceptJobApplication, rejectJobApplication,
    processingApplication, applicationActionError,
  };
};

export default useCompanyJobs;
