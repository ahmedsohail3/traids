import axiosInstance from '~utils/axiosInstance';

// ── Params builder — only sends non-empty values ───────────────────────────────
// Arrays are kept as arrays and serialized as repeated keys (trade=electrician&trade=plumber).

const buildJobParams = (filters = {}) => {
  const params = {};
  const add = (key, value) => {
    if (Array.isArray(value)) {
      const cleaned = value.filter((v) => v !== undefined && v !== null && v !== '');
      if (cleaned.length) params[key] = cleaned;
    } else if (value !== undefined && value !== null && value !== '') {
      params[key] = value;
    }
  };

  add('page',                 filters.page);
  add('trade',                filters.trade);
  add('location',             filters.location);
  add('maxHourlyRate',        filters.maxHourlyRate);
  add('startDate',            filters.startDate);
  add('minYearsOfExperience', filters.minYearsOfExperience);
  return params;
};

// Repeat the key instead of axios' default `trade[]=` bracket notation
const repeatedKeysSerializer = { indexes: null };

// ── Available Jobs ─────────────────────────────────────────────────────────────

export const getAvailableJobsApi = (filters = {}) =>
  axiosInstance
    .get('/jobs/available', {
      params: buildJobParams(filters),
      paramsSerializer: repeatedKeysSerializer,
    })
    .then((r) => r.data);

// ── Recommended Jobs ───────────────────────────────────────────────────────────

export const getRecommendedJobsApi = () =>
  axiosInstance.get('/subcontractor/recommended-jobs').then((r) => r.data);

// ── Job Details ───────────────────────────────────────────────────────────────

export const getJobDetailsApi = (jobId) =>
  axiosInstance.get(`/jobs/${jobId}`).then((r) => r.data);

// ── Apply For Job ─────────────────────────────────────────────────────────────

export const applyForJobApi = (formData) =>
  axiosInstance
    .post('/job-applications', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);

// ── Offer Actions ─────────────────────────────────────────────────────────────

export const acceptJobOfferApi = (offerId) =>
  axiosInstance.patch(`/offers/${offerId}/accept`).then((r) => r.data);

export const rejectJobOfferApi = (offerId) =>
  axiosInstance.patch(`/offers/${offerId}/reject`).then((r) => r.data);

// ── Future endpoints ───────────────────────────────────────────────────────────
// export const getAppliedJobsApi    = ()       => axiosInstance.get('/subcontractor/applied-jobs').then((r) => r.data);
// export const getSavedJobsApi      = ()       => axiosInstance.get('/subcontractor/saved-jobs').then((r) => r.data);
// export const updateApplicationApi = (id, fd) => axiosInstance.put(`/job-applications/${id}`, fd).then((r) => r.data);
// export const withdrawJobOfferApi  = (id)     => axiosInstance.patch(`/offers/${id}/withdraw`).then((r) => r.data);
// export const counterOfferApi      = (id, fd) => axiosInstance.patch(`/offers/${id}/counter`, fd).then((r) => r.data);
