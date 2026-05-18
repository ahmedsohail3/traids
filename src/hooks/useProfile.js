import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, clearProfile, clearProfileError } from '~redux/reducers/profileSlice';

const useProfile = () => {
  const dispatch = useDispatch();
  const { data: profile, loading, error } = useSelector((s) => s.profile);

  const getProfile = useCallback(() => dispatch(fetchProfile()), [dispatch]);
  const resetProfile = useCallback(() => dispatch(clearProfile()), [dispatch]);
  const clearError = useCallback(() => dispatch(clearProfileError()), [dispatch]);

  return {
    profile,   // Full profile object from /auth/profile
    loading,
    error,
    getProfile,   // Call to (re)fetch from API
    resetProfile, // Wipe local profile state
    clearError,
  };
};

export default useProfile;
