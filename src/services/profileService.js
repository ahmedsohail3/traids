import axiosInstance from '~utils/axiosInstance';

/**
 * GET /auth/profile
 * Returns the authenticated user's profile data.
 */
export const getProfileApi = () =>
  axiosInstance.get('/auth/profile').then((r) => r.data);
