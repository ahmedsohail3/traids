import axiosInstance from '~utils/axiosInstance';

// ── Wallet ─────────────────────────────────────────────────────────────────────
// Balances + paid transaction history for the signed-in subcontractor.

export const getWalletApi = () =>
  axiosInstance.get('/subcontractor/wallet').then((r) => r.data);

// ── Withdrawals ────────────────────────────────────────────────────────────────
// Moves available balance to the subcontractor's verified (Stripe Connect) bank
// account. Body is `{ amount }` in GBP (minimum £1); the response is
// `{ payoutId, amount, currency }`.

export const withdrawApi = (id, body) =>
  axiosInstance.post(`/subcontractor/${id}/withdraw`, body).then((r) => r.data);

// ── Future endpoints (add here as the module grows) ───────────────────────────
// export const getTransactionApi  = (id)   => axiosInstance.get(`/subcontractor/wallet/transactions/${id}`).then((r) => r.data);
