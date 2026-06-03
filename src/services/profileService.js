import axiosInstance from '~utils/axiosInstance';

/**
 * GET /auth/profile
 * Returns the authenticated user's profile data.
 */
export const getProfileApi = () =>
  axiosInstance.get('/auth/profile').then((r) => r.data);

/**
 * PUT /company/update-profile
 * Updates the authenticated company's profile with multipart/form-data.
 */
export const updateCompanyProfileApi = (formData) =>
  axiosInstance.put('/company/update-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
