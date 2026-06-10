import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateSubcontractorProfile as updateSubcontractorProfileAction,
  clearUpdateProfileError,
} from '~redux/reducers/subcontractorProfileSlice';
import { fetchProfile } from '~redux/reducers/profileSlice';

// ── Memoized selectors ─────────────────────────────────────────────────────────

const selectUpdatingProfile    = (s) => s.subcontractorProfile.updatingProfile;
const selectUpdateProfileError = (s) => s.subcontractorProfile.updateProfileError;

// ── Hook ───────────────────────────────────────────────────────────────────────

const useSubcontractorProfile = () => {
  const dispatch = useDispatch();

  const updatingProfile    = useSelector(selectUpdatingProfile);
  const updateProfileError = useSelector(selectUpdateProfileError);

  const updateProfile = useCallback(
    async (formData) => {
      const result = await dispatch(updateSubcontractorProfileAction(formData)).unwrap();
      await dispatch(fetchProfile());
      return result;
    },
    [dispatch],
  );

  const resetUpdateProfileError = useCallback(
    () => dispatch(clearUpdateProfileError()),
    [dispatch],
  );

  return {
    updateProfile,
    updatingProfile,
    updateProfileError,
    resetUpdateProfileError,
  };
};

export default useSubcontractorProfile;
