import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  uploadSubcontractorDocument,
  clearDocumentUpload,
} from '~redux/reducers/subcontractorDocumentUploadSlice';

const FALLBACK = { uploading: false, error: null, documentUrl: null, expiresAt: null };

/**
 * useUploadSubcontractorDocument
 *
 * Manages upload state for a single document type ('insurance' | 'ticket' | 'certification').
 *
 * Returns:
 *   uploading   — true while the API call is in flight
 *   documentUrl — S3 URL returned by the server on success
 *   expiresAt   — ISO string if server extracted an expiry; null if not found
 *   error       — error message string on failure; null otherwise
 *   upload      — (file) → Promise<{ documentType, url, expiresAt }> (throws on error)
 *   clear       — () → reset state for this document type
 */
const useUploadSubcontractorDocument = (documentType) => {
  const dispatch = useDispatch();
  const state = useSelector(
    (s) => s.subcontractorDocumentUpload?.[documentType] ?? FALLBACK,
  );

  const upload = useCallback(
    (file) =>
      dispatch(uploadSubcontractorDocument({ documentType, file })).unwrap(),
    [dispatch, documentType],
  );

  const clear = useCallback(
    () => dispatch(clearDocumentUpload(documentType)),
    [dispatch, documentType],
  );

  return { ...state, upload, clear };
};

export default useUploadSubcontractorDocument;
