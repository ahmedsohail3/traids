import axiosInstance from '~utils/axiosInstance';

// ── Wallet ─────────────────────────────────────────────────────────────────────
// Balances + paid transaction history for the signed-in subcontractor.

export const getWalletApi = () =>
  axiosInstance.get('/subcontractor/wallet').then((r) => r.data);

// ── Future endpoints (add here as the module grows) ───────────────────────────
// export const withdrawApi        = (body) => axiosInstance.post('/subcontractor/wallet/withdraw').then((r) => r.data);
// export const getTransactionApi  = (id)   => axiosInstance.get(`/subcontractor/wallet/transactions/${id}`).then((r) => r.data);
