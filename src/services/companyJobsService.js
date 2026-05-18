import axiosInstance from '~utils/axiosInstance';

export const getJobsApi = () =>
  axiosInstance.get('/jobs').then((r) => r.data);

export const getJobByIdApi = (jobId) =>
  axiosInstance.get(`/jobs/${jobId}`).then((r) => r.data);
