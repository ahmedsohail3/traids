import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getJobInvoicesApi, getInvoiceByIdApi } from '~services/companyInvoicesService';
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

const companyInvoicesSlice = createSlice({
  name: 'companyInvoices',
  initialState: {
    invoices:             [],
    loading:              false,
    error:                null,
    selectedInvoice:      null,
    loadingInvoiceDetail: false,
    detailError:          null,
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
      });
  },
});

export const { clearJobInvoices, clearSelectedInvoice } = companyInvoicesSlice.actions;
export default companyInvoicesSlice.reducer;
