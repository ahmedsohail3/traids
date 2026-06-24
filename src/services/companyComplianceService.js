import axiosInstance from '~utils/axiosInstance';

export const getComplianceRecordsApi = () =>
  axiosInstance.get('/compliance').then((r) => r.data);

export const getComplianceByProjectIdApi = (projectId) =>
  axiosInstance.get(`/compliance/project/${projectId}`).then((r) => r.data);

export const uploadComplianceDocumentApi = (projectId, tab, formData) =>
  axiosInstance
    .post(`/compliance/${projectId}/upload/${tab}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const deleteComplianceDocumentApi = (projectId, tab, fileUrl) =>
  axiosInstance
    .delete(`/compliance/${projectId}/${tab}`, { data: { fileUrl } })
    .then((r) => r.data);

export const shareComplianceApi = (complianceId, email) =>
  axiosInstance.post(`/compliance/${complianceId}/share`, { email }).then((r) => r.data);
