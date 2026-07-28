import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createSetupIntentApi,
  savePaymentMethodApi,
  getCompanyPaymentMethodApi,
} from '~services/companyPaymentService';
import { getErrorMessage } from '~utils';

// ── Async thunks ───────────────────────────────────────────────────────────────

/**
 * Step 1 of card setup — fetch the SetupIntent client secret.
 * The screen then confirms it on-device with Stripe's SDK.
 */
export const fetchSetupIntent = createAsyncThunk(
  'companyPayment/fetchSetupIntent',
  async (_, { rejectWithValue }) => {
    try {
      const res = await createSetupIntentApi();
      const clientSecret = res?.data?.clientSecret ?? res?.clientSecret;
      if (!clientSecret) return rejectWithValue('Could not start card setup. Please try again.');
      return clientSecret;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/**
 * Step 3 of card setup — persist the payment method from the confirmed SetupIntent.
 */
export const savePaymentMethod = createAsyncThunk(
  'companyPayment/savePaymentMethod',
  async (paymentMethodId, { rejectWithValue }) => {
    try {
      const res = await savePaymentMethodApi(paymentMethodId);
      return res?.data ?? res;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/**
 * The card currently on file — { brand, last4, ... }.
 */
export const fetchPaymentMethod = createAsyncThunk(
  'companyPayment/fetchPaymentMethod',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getCompanyPaymentMethodApi();
      return res?.data ?? null;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const INITIAL_STATE = {
  clientSecret:  null,   // live only for the duration of one card-setup attempt
  savingCard:    false,  // covers fetch-secret → confirm → save as one user-facing step
  cardSaved:     false,
  setupError:    null,
  paymentMethod: null,   // { brand, last4, … }
  loadingPaymentMethod: false,
  paymentMethodError:   null,
};

const companyPaymentSlice = createSlice({
  name: 'companyPayment',
  initialState: { ...INITIAL_STATE },
  reducers: {
    // Drops the client secret once an attempt ends — it is single-use
    clearSetupIntent: (state) => {
      state.clientSecret = null;
    },
    clearSetupError: (state) => {
      state.setupError = null;
    },
    // Confirming the SetupIntent happens on-device between the two thunks, so
    // the SDK's own failure is reported back into the slice from the hook
    setSetupError: (state, { payload }) => {
      state.savingCard   = false;
      state.clientSecret = null;
      state.setupError   = payload;
    },
    resetCardSetup: (state) => {
      state.clientSecret = null;
      state.savingCard   = false;
      state.cardSaved    = false;
      state.setupError   = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSetupIntent.pending, (state) => {
        state.savingCard  = true;
        state.setupError  = null;
        state.cardSaved   = false;
      })
      .addCase(fetchSetupIntent.fulfilled, (state, { payload }) => {
        state.clientSecret = payload;
      })
      .addCase(fetchSetupIntent.rejected, (state, { payload }) => {
        state.savingCard = false;
        state.setupError = payload ?? 'Could not start card setup.';
      })
      .addCase(savePaymentMethod.pending, (state) => {
        state.savingCard = true;
        state.setupError = null;
      })
      .addCase(savePaymentMethod.fulfilled, (state) => {
        state.savingCard   = false;
        state.cardSaved    = true;
        state.clientSecret = null;
      })
      .addCase(savePaymentMethod.rejected, (state, { payload }) => {
        state.savingCard   = false;
        state.clientSecret = null;
        state.setupError   = payload ?? 'Could not save your card.';
      })
      .addCase(fetchPaymentMethod.pending, (state) => {
        state.loadingPaymentMethod = true;
        state.paymentMethodError   = null;
      })
      .addCase(fetchPaymentMethod.fulfilled, (state, { payload }) => {
        state.loadingPaymentMethod = false;
        state.paymentMethod        = payload;
      })
      .addCase(fetchPaymentMethod.rejected, (state, { payload }) => {
        state.loadingPaymentMethod = false;
        state.paymentMethodError   = payload ?? 'Could not load your saved card.';
      });
  },
});

export const {
  clearSetupIntent,
  clearSetupError,
  setSetupError,
  resetCardSetup,
} = companyPaymentSlice.actions;

export default companyPaymentSlice.reducer;
