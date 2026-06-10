import axiosInstance from '~utils/axiosInstance';

// ── Params builder — only sends non-empty values ───────────────────────────────

const buildJobParams = (filters = {}) => {
  const params = {};
  if (filters.page)                 params.page                 = filters.page;
  if (filters.trade)                params.trade                = filters.trade;
  if (filters.location)             params.location             = filters.location;
  if (filters.maxHourlyRate)        params.maxHourlyRate        = filters.maxHourlyRate;
  if (filters.startDate)            params.startDate            = filters.startDate;
  if (filters.minYearsOfExperience) params.minYearsOfExperience = filters.minYearsOfExperience;
  return params;
};

// ── Available Jobs ─────────────────────────────────────────────────────────────

export const getAvailableJobsApi = (filters = {}) =>
  axiosInstance.get('/jobs/available', { params: buildJobParams(filters) }).then((r) => r.data);

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
// export const withdrawJobApi       = (id)     => axiosInstance.delete(`/job-applications/${id}`).then((r) => r.data);
// export const updateApplicationApi = (id, fd) => axiosInstance.put(`/job-applications/${id}`, fd).then((r) => r.data);
// export const withdrawJobOfferApi  = (id)     => axiosInstance.patch(`/offers/${id}/withdraw`).then((r) => r.data);
// export const counterOfferApi      = (id, fd) => axiosInstance.patch(`/offers/${id}/counter`, fd).then((r) => r.data);
