import axiosInstance from '~utils/axiosInstance';
import { buildSubcontractorSignupFormData } from '~utils/buildFormData';

/**
 * POST /subcontractor/signup — multipart/form-data
 * confirmPassword is stripped inside the form-data builder (validation-only field).
 */
export const subcontractorSignupApi = (formData) =>
  axiosInstance
    .post(
      '/subcontractor/signup',
      buildSubcontractorSignupFormData(formData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    .then((r) => r.data);
