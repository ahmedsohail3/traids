import axiosInstance from '~utils/axiosInstance';
import { buildSubcontractorSignupFormData } from '~utils/buildFormData';

export const subcontractorSignupApi = (formData) =>
  axiosInstance
    .post(
      '/subcontractor/signup',
      buildSubcontractorSignupFormData(formData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    .then((r) => r.data);

/**
 * POST /subcontractor/validate
 * Checks whether an email is already registered before the signup call.
 */
export const validateSubcontractorEmailApi = (email) =>
  axiosInstance.post('/subcontractor/validate', { email }).then((r) => r.data);

/**
 * POST /subcontractor/onboarding-link
 * @returns {Promise<{ url: string }>} Stripe Connect Express hosted onboarding URL.
 * Its return_url already points at the web route carrying `stripeReturn=true`,
 * which the in-app WebView watches for instead of using a deep link.
 */
export const getOnboardingLinkApi = () =>
  axiosInstance.post('/subcontractor/onboarding-link').then((r) => r.data);

export const uploadSubcontractorDocumentApi = (documentType, file) => {
  const fd = new FormData();
  fd.append('documentType', documentType);
  fd.append('file', { uri: file.uri, type: file.type, name: file.name });
  return axiosInstance
    .post('/subcontractor/upload-document', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};
