import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanyDashboard, clearCompanyDashboard } from '~redux/reducers/dashboardSlice';

const useDashboard = () => {
  const dispatch = useDispatch();
  const { data: dashboard, loading, error } = useSelector((s) => s.dashboard.company);

  const getDashboard   = useCallback(() => dispatch(fetchCompanyDashboard()),    [dispatch]);
  const resetDashboard = useCallback(() => dispatch(clearCompanyDashboard()),    [dispatch]);

  return {
    dashboard,
    loading,
    error,
    hasData: dashboard !== null,
    getDashboard,
    resetDashboard,
  };
};

export default useDashboard;
