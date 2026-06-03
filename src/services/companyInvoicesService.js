import axiosInstance from '~utils/axiosInstance';

export const getJobInvoicesApi = (jobId) =>
  axiosInstance.get(`/invoices/job/${jobId}`).then((r) => r.data);

export const getInvoiceByIdApi = (invoiceId) =>
  axiosInstance.get(`/invoices/${invoiceId}`).then((r) => r.data);
