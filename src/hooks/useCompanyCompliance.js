import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchComplianceRecords,
  fetchComplianceByProjectId,
  uploadComplianceDocument,
  deleteComplianceDocument,
  shareCompliance,
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
const selectUploading          = (s) => s.companyCompliance?.uploading          ?? false;
const selectUploadError        = (s) => s.companyCompliance?.uploadError        ?? null;
const selectDeleting           = (s) => s.companyCompliance?.deleting           ?? false;
const selectDeleteError        = (s) => s.companyCompliance?.deleteError        ?? null;
const selectSharing            = (s) => s.companyCompliance?.sharing            ?? false;
const selectShareError         = (s) => s.companyCompliance?.shareError         ?? null;

const useCompanyCompliance = () => {
  const dispatch = useDispatch();

  const complianceRecords  = useSelector(selectRecords);
  const loading            = useSelector(selectLoading);
  const error              = useSelector(selectError);
  const selectedCompliance = useSelector(selectSelectedCompliance);
  const loadingDetails     = useSelector(selectLoadingDetails);
  const detailError        = useSelector(selectDetailError);
  const uploading          = useSelector(selectUploading);
  const uploadError        = useSelector(selectUploadError);
  const deleting           = useSelector(selectDeleting);
  const deleteError        = useSelector(selectDeleteError);
  const sharing            = useSelector(selectSharing);
  const shareError         = useSelector(selectShareError);

  const getComplianceRecords     = useCallback(() => dispatch(fetchComplianceRecords()), [dispatch]);
  const refetchComplianceRecords = useCallback(() => dispatch(fetchComplianceRecords()), [dispatch]);
  const reset                    = useCallback(() => dispatch(clearComplianceRecords()), [dispatch]);

  const getComplianceByProjectId = useCallback(
    (projectId) => dispatch(fetchComplianceByProjectId(projectId)),
    [dispatch],
  );
  const resetSelectedCompliance = useCallback(() => dispatch(clearSelectedCompliance()), [dispatch]);

  const uploadDocument = useCallback(
    ({ projectId, tab, document }) =>
      dispatch(uploadComplianceDocument({ projectId, tab, document })),
    [dispatch],
  );

  const deleteDocument = useCallback(
    ({ projectId, tab, fileUrl }) =>
      dispatch(deleteComplianceDocument({ projectId, tab, fileUrl })),
    [dispatch],
  );

  const shareDocument = useCallback(
    ({ complianceId, email }) =>
      dispatch(shareCompliance({ complianceId, email })),
    [dispatch],
  );

  return {
    complianceRecords,
    loading,
    error,
    selectedCompliance,
    loadingDetails,
    detailError,
    uploading,
    uploadError,
    deleting,
    deleteError,
    sharing,
    shareError,
    getComplianceRecords,
    refetchComplianceRecords,
    reset,
    getComplianceByProjectId,
    resetSelectedCompliance,
    uploadDocument,
    deleteDocument,
    shareDocument,
  };
};

export default useCompanyCompliance;
