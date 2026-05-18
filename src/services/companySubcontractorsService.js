import axiosInstance from '~utils/axiosInstance';

const buildParams = ({ primaryTrade, location, maxHourlyRate } = {}) => {
  const params = {};
  if (primaryTrade)  params.primaryTrade  = primaryTrade;
  if (location)      params.location      = location;
  if (maxHourlyRate) params.maxHourlyRate = maxHourlyRate;
  return params;
};

export const getCompanySubcontractorsApi = (filters = {}) =>
  axiosInstance.get('/company/subcontractors', { params: buildParams(filters) }).then((r) => r.data);

export const getCompanySubcontractorProfileApi = (subcontractorId) =>
  axiosInstance.get(`/company/subcontractors/${subcontractorId}`).then((r) => r.data);
