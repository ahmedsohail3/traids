import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  login, logout, clearAuthError,
  forgotPassword, verifyResetToken, resetPassword,
  clearResetFlow, clearResetError,
} from '~redux/reducers/authSlice';
import { fetchProfile, clearProfile } from '~redux/reducers/profileSlice';
import { clearAllTokens } from '~utils';
import { disconnectSocket } from '~services/socket/socketService';

const useAuth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading, error, resetFlow } = useSelector((s) => s.auth);

  const handleLogin = useCallback(
    (email, password, userType) =>
      dispatch(login({ email, password, userType })).then((result) => {
        if (login.fulfilled.match(result)) dispatch(fetchProfile());
        return result;
      }),
    [dispatch],
  );

  const handleLogout = useCallback(async () => {
    disconnectSocket();
    await clearAllTokens();
    dispatch(clearProfile());
    dispatch(logout());
  }, [dispatch]);

  const handleForgotPassword = useCallback(
    (email, userType) => dispatch(forgotPassword({ email, userType })),
    [dispatch],
  );

  const handleVerifyResetToken = useCallback(
    (resetToken, userType) => dispatch(verifyResetToken({ email: resetFlow.email, resetToken, userType })),
    [dispatch, resetFlow.email],
  );

  const handleResetPassword = useCallback(
    (newPassword, userType) =>
      dispatch(resetPassword({ email: resetFlow.email, resetToken: resetFlow.token, userType, newPassword })),
    [dispatch, resetFlow.email, resetFlow.token],
  );

  const handleClearResetFlow = useCallback(() => dispatch(clearResetFlow()), [dispatch]);

  const clearError = useCallback(() => dispatch(clearAuthError()), [dispatch]);
  const clearResetErr = useCallback(() => dispatch(clearResetError()), [dispatch]);

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    clearError,
    // Reset flow
    resetFlow,
    forgotPassword: handleForgotPassword,
    verifyResetToken: handleVerifyResetToken,
    resetPassword: handleResetPassword,
    clearResetFlow: handleClearResetFlow,
    clearResetError: clearResetErr,
  };
};

export default useAuth;
