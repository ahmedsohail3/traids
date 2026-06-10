import axiosInstance from '~utils/axiosInstance';

export const getJobsApi = () =>
  axiosInstance.get('/jobs').then((r) => r.data);

export const getJobByIdApi = (jobId) =>
  axiosInstance.get(`/jobs/${jobId}`).then((r) => r.data);

export const getJobRatingsApi = (jobId) =>
  axiosInstance.get(`/jobs/${jobId}/ratings`).then((r) => r.data);

export const submitJobRatingApi = (jobId, subcontractorId, body) =>
  axiosInstance.post(`/jobs/${jobId}/rate/${subcontractorId}`, body).then((r) => r.data);

export const createJobApi = (formData) =>
  axiosInstance
    .post('/jobs', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);

export const acceptJobApplicationApi = (applicationId) =>
  axiosInstance.patch(`/job-applications/${applicationId}/accept`).then((r) => r.data);

export const rejectJobApplicationApi = (applicationId) =>
  axiosInstance.patch(`/job-applications/${applicationId}/reject`).then((r) => r.data);
