import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getJobInvoicesApi, getInvoiceByIdApi, payInvoiceApi } from '~services/companyInvoicesService';
import { getErrorMessage } from '~utils';

export const fetchJobInvoices = createAsyncThunk(
  'companyInvoices/fetchJobInvoices',
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await getJobInvoicesApi(jobId);
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchInvoiceById = createAsyncThunk(
  'companyInvoices/fetchInvoiceById',
  async (invoiceId, { rejectWithValue }) => {
    try {
      const res = await getInvoiceByIdApi(invoiceId);
      return res.data ?? null;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/**
 * Charges an invoice against the saved card. The backend confirms the
 * PaymentIntent off-session, so this usually settles server-side in one call —
 * a `requires_action` status hands 3DS back to the app to resolve in-app.
 */
export const payInvoice = createAsyncThunk(
  'companyInvoices/payInvoice',
  async (invoiceId, { rejectWithValue }) => {
    try {
      const res = await payInvoiceApi(invoiceId);
      const data = res?.data ?? res;
      return {
        invoiceId,
        status:          data?.status ?? 'succeeded',
        paymentIntentId: data?.paymentIntentId ?? null,
        clientSecret:    data?.clientSecret ?? null,
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const companyInvoicesSlice = createSlice({
  name: 'companyInvoices',
  initialState: {
    invoices:             [],
    loading:              false,
    error:                null,
    selectedInvoice:      null,
    loadingInvoiceDetail: false,
    detailError:          null,
    paying:               false,
    payError:             null,
  },
  reducers: {
    clearJobInvoices: (state) => {
      state.invoices = [];
      state.error    = null;
    },
    clearSelectedInvoice: (state) => {
      state.selectedInvoice      = null;
      state.detailError          = null;
    },
    clearPayError: (state) => {
      state.payError = null;
    },
    // 3DS is resolved on-device after the thunk resolves, so its failure is
    // reported back into the slice from the hook
    setPayError: (state, { payload }) => {
      state.paying   = false;
      state.payError = payload;
    },
    // Flips the invoice locally once payment has settled — covers the 3DS path,
    // where the charge only completes after handleNextAction resolves on-device
    markInvoicePaid: (state, { payload: invoiceId }) => {
      if (state.selectedInvoice?._id === invoiceId) {
        state.selectedInvoice.paymentStatus = 'paid';
      }
      const listed = state.invoices.find((i) => i._id === invoiceId);
      if (listed) listed.paymentStatus = 'paid';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobInvoices.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchJobInvoices.fulfilled, (state, { payload }) => {
        state.loading  = false;
        state.invoices = payload;
      })
      .addCase(fetchJobInvoices.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload ?? 'Failed to load invoices.';
      })
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loadingInvoiceDetail = true;
        state.detailError          = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, { payload }) => {
        state.loadingInvoiceDetail = false;
        state.selectedInvoice      = payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, { payload }) => {
        state.loadingInvoiceDetail = false;
        state.detailError          = payload ?? 'Failed to load invoice.';
      })
      .addCase(payInvoice.pending, (state) => {
        state.paying   = true;
        state.payError = null;
      })
      .addCase(payInvoice.fulfilled, (state, { payload }) => {
        state.paying = false;
        // 'requires_action' isn't settled yet — the screen resolves 3DS, then
        // dispatches markInvoicePaid once handleNextAction succeeds
        if (payload.status === 'succeeded') {
          companyInvoicesSlice.caseReducers.markInvoicePaid(state, {
            payload: payload.invoiceId,
          });
        }
      })
      .addCase(payInvoice.rejected, (state, { payload }) => {
        state.paying   = false;
        state.payError = payload ?? 'Payment failed. Please try again.';
      });
  },
});

export const {
  clearJobInvoices,
  clearSelectedInvoice,
  clearPayError,
  setPayError,
  markInvoicePaid,
} = companyInvoicesSlice.actions;
export default companyInvoicesSlice.reducer;
