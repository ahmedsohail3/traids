import axiosInstance from '~utils/axiosInstance';

export const getFinancialSummaryApi = () =>
  axiosInstance.get('/company/financials/summary').then((r) => r.data);
