import axiosInstance from '~utils/axiosInstance';

export const getComplianceRecordsApi = () =>
  axiosInstance.get('/compliance').then((r) => r.data);

export const getComplianceByProjectIdApi = (projectId) =>
  axiosInstance.get(`/compliance/project/${projectId}`).then((r) => r.data);
