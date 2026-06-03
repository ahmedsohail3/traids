import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchComplianceRecords,
  fetchComplianceByProjectId,
  clearComplianceRecords,
  clearSelectedCompliance,
} from '~redux/reducers/companyComplianceSlice';

const EMPTY_ARRAY = [];

const selectRecords            = (s) => s.companyCompliance?.complianceRecords  ?? EMPTY_ARRAY;
const selectLoading            = (s) => s.companyCompliance?.loading            ?? false;
const selectError              = (s) => s.companyCompliance?.error              ?? null;
const selectSelectedCompliance = (s) => s.companyCompliance?.selectedCompliance ?? null;
const selectLoadingDetails     = (s) => s.companyCompliance?.loadingDetails     ?? false;
const selectDetailError        = (s) => s.companyCompliance?.detailError        ?? null;

const useCompanyCompliance = () => {
  const dispatch = useDispatch();

  const complianceRecords  = useSelector(selectRecords);
  const loading            = useSelector(selectLoading);
  const error              = useSelector(selectError);
  const selectedCompliance = useSelector(selectSelectedCompliance);
  const loadingDetails     = useSelector(selectLoadingDetails);
  const detailError        = useSelector(selectDetailError);

  const getComplianceRecords     = useCallback(() => dispatch(fetchComplianceRecords()), [dispatch]);
  const refetchComplianceRecords = useCallback(() => dispatch(fetchComplianceRecords()), [dispatch]);
  const reset                    = useCallback(() => dispatch(clearComplianceRecords()), [dispatch]);

  const getComplianceByProjectId  = useCallback((projectId) => dispatch(fetchComplianceByProjectId(projectId)), [dispatch]);
  const resetSelectedCompliance   = useCallback(() => dispatch(clearSelectedCompliance()), [dispatch]);

  return {
    complianceRecords,
    loading,
    error,
    selectedCompliance,
    loadingDetails,
    detailError,
    getComplianceRecords,
    refetchComplianceRecords,
    reset,
    getComplianceByProjectId,
    resetSelectedCompliance,
  };
};

export default useCompanyCompliance;
