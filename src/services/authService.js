import axiosInstance from '~utils/axiosInstance';

export const loginApi = ({ email, password, userType }) =>
  axiosInstance.post('/auth/login', { email, password, userType }).then((r) => r.data);

export const forgotPasswordApi = ({ email, userType }) =>
  axiosInstance.post('/auth/forgot-password', { email, userType }).then((r) => r.data);

export const verifyResetTokenApi = ({ email, resetToken, userType }) =>
  axiosInstance.post('/auth/verify-reset-token', { email, resetToken, userType }).then((r) => r.data);

export const resetPasswordApi = ({ email, resetToken, userType, newPassword }) =>
  axiosInstance.post('/auth/reset-password', { email, resetToken, userType, newPassword }).then((r) => r.data);
