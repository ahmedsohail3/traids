import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProfile,
  clearProfile,
  clearProfileError,
  updateCompanyProfile as updateCompanyProfileAction,
} from '~redux/reducers/profileSlice';

const selectUpdatingProfile = (s) => s.profile.updatingProfile;
const selectUpdateError = (s) => s.profile.updateError;

const useProfile = () => {
  const dispatch = useDispatch();
  const { data: profile, loading, error } = useSelector((s) => s.profile);
  const updatingProfile = useSelector(selectUpdatingProfile);
  const updateError = useSelector(selectUpdateError);

  const getProfile = useCallback(() => dispatch(fetchProfile()), [dispatch]);
  const resetProfile = useCallback(() => dispatch(clearProfile()), [dispatch]);
  const clearError = useCallback(() => dispatch(clearProfileError()), [dispatch]);
  const updateCompanyProfile = useCallback(
    async (formData) => {
      const result = await dispatch(updateCompanyProfileAction(formData)).unwrap();
      await dispatch(fetchProfile());
      return result;
    },
    [dispatch],
  );

  return {
    profile,   // Full profile object from /auth/profile
    loading,
    error,
    getProfile,           // Call to (re)fetch from API
    resetProfile,         // Wipe local profile state
    clearError,
    updatingProfile,
    updateError,
    updateCompanyProfile, // Call to update company profile
  };
};

export default useProfile;
