import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRecommendedJobs,
  fetchAvailableJobs,
  clearRecommendedJobs,
  clearAvailableJobs,
  clearAllJobs,
} from '~redux/reducers/subcontractorJobsSlice';

const useSubcontractorJobs = () => {
  const dispatch = useDispatch();

  const recommended = useSelector((s) => s.subcontractorJobs.recommendedJobs);
  const available   = useSelector((s) => s.subcontractorJobs.availableJobs);

  // ── Recommended Jobs ─────────────────────────────────────────────────────────
  const getRecommendedJobs   = useCallback(() => dispatch(fetchRecommendedJobs()),        [dispatch]);
  const resetRecommendedJobs = useCallback(() => dispatch(clearRecommendedJobs()),        [dispatch]);

  // ── Available Jobs ───────────────────────────────────────────────────────────
  const getAvailableJobs  = useCallback((filters = {}) => dispatch(fetchAvailableJobs(filters)), [dispatch]);
  const resetAvailableJobs = useCallback(() => dispatch(clearAvailableJobs()),            [dispatch]);

  const resetAll = useCallback(() => dispatch(clearAllJobs()), [dispatch]);

  return {
    // Recommended jobs
    recommendedJobs:    recommended.data,
    recommendedLoading: recommended.loading,
    recommendedError:   recommended.error,
    getRecommendedJobs,
    resetRecommendedJobs,

    // Available jobs
    availableJobs:    available.data,
    availableLoading: available.loading,
    availableError:   available.error,
    availablePage:    available.page,
    availableTotalPages: available.totalPages,
    availableTotalCount: available.totalCount,
    getAvailableJobs,
    resetAvailableJobs,

    // Shared
    resetAll,
  };
};

export default useSubcontractorJobs;
