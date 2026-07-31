import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getWalletApi } from '~services/subcontractorWalletService';
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

// ── State shape ────────────────────────────────────────────────────────────────
// Mirrors the API response: balances come back as per-currency arrays.
//   { available: [{ amount, currency }], pending: [...], transactions: [...] }

const walletData = () => ({ available: [], pending: [], transactions: [] });

const walletState = () => ({ data: walletData(), loading: false, error: null });

// ── Slice ──────────────────────────────────────────────────────────────────────

const subcontractorWalletSlice = createSlice({
  name: 'subcontractorWallet',
  initialState: { wallet: walletState() },
  reducers: {
    clearWallet: (state) => { state.wallet = walletState(); },
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
      })
      .addCase(fetchWallet.rejected, (state, { payload }) => {
        state.wallet.loading = false;
        state.wallet.error   = payload ?? 'Failed to load wallet.';
      });
  },
});

export const { clearWallet } = subcontractorWalletSlice.actions;
export default subcontractorWalletSlice.reducer;
