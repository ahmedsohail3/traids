import axiosInstance from '~utils/axiosInstance';
import { buildFormData } from '~utils/buildFormData';

/**
 * POST /company/signup — multipart/form-data
 * confirmPassword is stripped before sending (validation-only field).
 */
export const companySignupApi = ({
  confirmPassword: _,   // strip — not sent to API
  companyDocuments,
  insuranceCertificate,
  healthAndSafetyPolicy,
  ...textFields
}) =>
  axiosInstance
    .post(
      '/company/signup',
      buildFormData(textFields, { companyDocuments, insuranceCertificate, healthAndSafetyPolicy }),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    .then((r) => r.data);
