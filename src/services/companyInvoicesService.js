import axiosInstance from '~utils/axiosInstance';

export const getJobInvoicesApi = (jobId) =>
  axiosInstance.get(`/invoices/job/${jobId}`).then((r) => r.data);

export const getInvoiceByIdApi = (invoiceId) =>
  axiosInstance.get(`/invoices/${invoiceId}`).then((r) => r.data);

/**
 * POST /invoices/:invoiceId/pay
 *
 * Server-driven off-session charge against the company's saved card.
 * Returns { paymentIntentId, status } — and, when status is 'requires_action',
 * a clientSecret the app resolves in-app via Stripe's handleNextAction.
 */
export const payInvoiceApi = (invoiceId) =>
  axiosInstance.post(`/invoices/${invoiceId}/pay`).then((r) => r.data);
