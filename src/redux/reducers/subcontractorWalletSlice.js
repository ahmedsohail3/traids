import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getWalletApi, withdrawApi } from '~services/subcontractorWalletService';
import { getErrorMessage } from '~utils';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchWallet = createAsyncThunk(
  'subcontractorWallet/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getWalletApi();
      return data?.data ?? data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const requestWithdrawal = createAsyncThunk(
  'subcontractorWallet/requestWithdrawal',
  async ({ id, amount }, { rejectWithValue }) => {
    try {
      const data = await withdrawApi(id, { amount });
      return data?.data ?? data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── State shape ────────────────────────────────────────────────────────────────
// Mirrors the API response: balances come back as per-currency arrays.
//   { available: [{ amount, currency }], pending: [...], transactions: [...] }
//
// `bankAccount` is optional — the wallet endpoint does not return it yet, so
// the screens fall back to a generic "verified bank account" label.

const walletData = () => ({
  available: [],
  pending: [],
  transactions: [],
  bankAccount: null,
});

const walletState = () => ({ data: walletData(), loading: false, error: null });

// Result of the most recent withdrawal, consumed by the success screen.
const withdrawalState = () => ({ data: null, loading: false, error: null });

// ── Slice ──────────────────────────────────────────────────────────────────────

const subcontractorWalletSlice = createSlice({
  name: 'subcontractorWallet',
  initialState: { wallet: walletState(), withdrawal: withdrawalState() },
  reducers: {
    clearWallet:     (state) => { state.wallet     = walletState(); },
    clearWithdrawal: (state) => { state.withdrawal = withdrawalState(); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.wallet.loading = true;
        state.wallet.error   = null;
      })
      .addCase(fetchWallet.fulfilled, (state, { payload }) => {
        state.wallet.loading           = false;
        state.wallet.data.available    = payload?.available    ?? [];
        state.wallet.data.pending      = payload?.pending      ?? [];
        state.wallet.data.transactions = payload?.transactions ?? [];
        state.wallet.data.bankAccount  = payload?.bankAccount  ?? null;
      })
      .addCase(fetchWallet.rejected, (state, { payload }) => {
        state.wallet.loading = false;
        state.wallet.error   = payload ?? 'Failed to load wallet.';
      })

      .addCase(requestWithdrawal.pending, (state) => {
        state.withdrawal.loading = true;
        state.withdrawal.error   = null;
      })
      .addCase(requestWithdrawal.fulfilled, (state, { payload }) => {
        state.withdrawal.loading = false;
        state.withdrawal.data    = payload ?? null;
      })
      .addCase(requestWithdrawal.rejected, (state, { payload }) => {
        state.withdrawal.loading = false;
        state.withdrawal.error   = payload ?? 'Withdrawal failed.';
      });
  },
});

export const { clearWallet, clearWithdrawal } = subcontractorWalletSlice.actions;
export default subcontractorWalletSlice.reducer;
