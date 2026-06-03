import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFinancialSummaryApi } from '~services/companyFinancialsService';
import { getErrorMessage } from '~utils';

export const fetchFinancialSummary = createAsyncThunk(
  'companyFinancials/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getFinancialSummaryApi();
      return res.data ?? res;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const companyFinancialsSlice = createSlice({
  name: 'companyFinancials',
  initialState: {
    financialSummary: null,
    loading:          false,
    error:            null,
  },
  reducers: {
    clearFinancialSummary: (state) => {
      state.financialSummary = null;
      state.error            = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinancialSummary.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchFinancialSummary.fulfilled, (state, { payload }) => {
        state.loading          = false;
        state.financialSummary = payload;
      })
      .addCase(fetchFinancialSummary.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload ?? 'Failed to load financial summary.';
      });
  },
});

export const { clearFinancialSummary } = companyFinancialsSlice.actions;
export default companyFinancialsSlice.reducer;
