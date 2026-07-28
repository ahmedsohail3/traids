import axiosInstance from '~utils/axiosInstance';
import { buildFormData } from '~utils/buildFormData';

/**
 * POST /company/validate
 * Checks whether the given identifying fields are already registered.
 * Body carries only the fields being checked — e.g. { registrationNumber }
 * on step 1, { workEmail, phoneNumber } on step 3.
 */
export const validateCompanyFieldsApi = (fields) =>
  axiosInstance.post('/company/validate', fields).then((r) => r.data);

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
