import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCompanyReportsApi } from '~services/companyReportsService';
import { getErrorMessage } from '~utils';

export const fetchCompanyReports = createAsyncThunk(
  'companyReports/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getCompanyReportsApi();
      return data?.data ?? data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const companyReportsSlice = createSlice({
  name: 'companyReports',
  initialState: { data: null, loading: false, error: null },
  reducers: {
    clearCompanyReports: (state) => {
      state.data    = null;
      state.loading = false;
      state.error   = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyReports.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchCompanyReports.fulfilled, (state, { payload }) => { state.loading = false; state.data = payload; })
      .addCase(fetchCompanyReports.rejected,  (state, { payload }) => { state.loading = false; state.error = payload ?? 'Failed to load reports.'; });
  },
});

export const { clearCompanyReports } = companyReportsSlice.actions;
export default companyReportsSlice.reducer;
