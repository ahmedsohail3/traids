import axiosInstance from '~utils/axiosInstance';

export const getCompanyReportsApi = () =>
  axiosInstance.get('/company/reports').then((r) => r.data);
