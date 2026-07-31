import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWallet, clearWallet } from '~redux/reducers/subcontractorWalletSlice';

const selectWallet = (s) => s.subcontractorWallet.wallet;

const useSubcontractorWallet = () => {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector(selectWallet);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const getWallet   = useCallback(() => dispatch(fetchWallet()), [dispatch]);
  const resetWallet = useCallback(() => dispatch(clearWallet()), [dispatch]);

  return {
    // Balances are per-currency arrays; transactions are already paid out.
    available:    data.available,
    pending:      data.pending,
    transactions: data.transactions,

    loading,
    error,

    getWallet,
    resetWallet,
  };
};

export default useSubcontractorWallet;
