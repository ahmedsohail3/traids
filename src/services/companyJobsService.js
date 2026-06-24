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

export const getJobApplicationsApi = (jobId, status = 'pending') =>
  axiosInstance.get(`/job-applications/job/${jobId}`, { params: { status } }).then((r) => r.data);

export const acceptJobApplicationApi = (applicationId) =>
  axiosInstance.patch(`/job-applications/${applicationId}/accept`).then((r) => r.data);

export const rejectJobApplicationApi = (applicationId) =>
  axiosInstance.patch(`/job-applications/${applicationId}/reject`).then((r) => r.data);

export const updateJobApi = (jobId, formData) =>
  axiosInstance
    .patch(`/jobs/${jobId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);

export const deleteJobApi = (jobId) =>
  axiosInstance.delete(`/jobs/${jobId}`).then((r) => r.data);

export const startJobApi = (jobId) =>
  axiosInstance.post(`/jobs/${jobId}/start`).then((r) => r.data);

export const completeJobApi = (jobId) =>
  axiosInstance.post(`/jobs/${jobId}/complete`).then((r) => r.data);

export const sendOfferApi = (formData) =>
  axiosInstance
    .post('/offers', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);

export const sendOfferForJobApi = (jobId, subcontractorId) =>
  axiosInstance.post(`/offers/send/${jobId}`, { subcontractorId }).then((r) => r.data);
