import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWallet,
  requestWithdrawal,
  clearWallet,
  clearWithdrawal,
} from '~redux/reducers/subcontractorWalletSlice';

const selectWallet     = (s) => s.subcontractorWallet.wallet;
const selectWithdrawal = (s) => s.subcontractorWallet.withdrawal;

const useSubcontractorWallet = () => {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector(selectWallet);
  const withdrawal = useSelector(selectWithdrawal);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const getWallet   = useCallback(() => dispatch(fetchWallet()), [dispatch]);
  const resetWallet = useCallback(() => dispatch(clearWallet()), [dispatch]);

  // Takes `{ id, amount }` — the subcontractor id is part of the endpoint path.
  // Resolves to the fulfilled/rejected action so callers can branch on the result.
  const withdraw = useCallback(
    (payload) => dispatch(requestWithdrawal(payload)),
    [dispatch],
  );
  const resetWithdrawal = useCallback(() => dispatch(clearWithdrawal()), [dispatch]);

  return {
    // Balances are per-currency arrays; transactions are already paid out.
    available:    data.available,
    pending:      data.pending,
    transactions: data.transactions,

    // Optional — absent until the wallet endpoint returns it.
    bankAccount:  data.bankAccount,

    loading,
    error,

    withdrawalResult:  withdrawal.data,
    withdrawing:       withdrawal.loading,
    withdrawalError:   withdrawal.error,

    getWallet,
    resetWallet,
    withdraw,
    resetWithdrawal,
  };
};

export default useSubcontractorWallet;
