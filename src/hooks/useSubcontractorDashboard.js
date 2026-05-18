import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubcontractorDashboard, clearSubcontractorDashboard } from '~redux/reducers/dashboardSlice';

const useSubcontractorDashboard = () => {
  const dispatch = useDispatch();
  const { data: dashboard, loading, error } = useSelector((s) => s.dashboard.subcontractor);

  const getDashboard   = useCallback(() => dispatch(fetchSubcontractorDashboard()),    [dispatch]);
  const resetDashboard = useCallback(() => dispatch(clearSubcontractorDashboard()),    [dispatch]);

  return {
    dashboard,
    loading,
    error,
    hasData: dashboard !== null,
    getDashboard,
    resetDashboard,
  };
};

export default useSubcontractorDashboard;
