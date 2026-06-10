import axiosInstance from '~utils/axiosInstance';

/**
 * PUT /subcontractor/update-profile
 * Updates the authenticated subcontractor's profile with multipart/form-data.
 */
export const updateSubcontractorProfileApi = (formData) =>
  axiosInstance.put('/subcontractor/update-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
