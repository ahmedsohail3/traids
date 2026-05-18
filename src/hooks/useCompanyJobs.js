import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCompanyJobs,
  fetchCompanyJobById,
  clearCompanyJobs,
  clearSelectedJob,
} from '~redux/reducers/companyJobsSlice';

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
  const selectedJob    = useSelector((s) => s.companyJobs.selectedJob);
  const detailLoading  = useSelector((s) => s.companyJobs.detailLoading);
  const detailError    = useSelector((s) => s.companyJobs.detailError);

  const getJobById      = useCallback((id) => dispatch(fetchCompanyJobById(id)), [dispatch]);
  const resetSelectedJob = useCallback(() => dispatch(clearSelectedJob()),        [dispatch]);

  return {
    // List
    jobs, jobCount, loading, error, getJobs, reset,
    // Detail
    selectedJob, detailLoading, detailError, getJobById, resetSelectedJob,
  };
};

export default useCompanyJobs;
