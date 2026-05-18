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

// ── Future endpoints ───────────────────────────────────────────────────────────
// export const getAppliedJobsApi = ()    => axiosInstance.get('/subcontractor/applied-jobs').then((r) => r.data);
// export const getSavedJobsApi   = ()    => axiosInstance.get('/subcontractor/saved-jobs').then((r) => r.data);
// export const getJobDetailsApi  = (id)  => axiosInstance.get(`/subcontractor/jobs/${id}`).then((r) => r.data);
// export const applyJobApi       = (id)  => axiosInstance.post(`/subcontractor/jobs/${id}/apply`).then((r) => r.data);
