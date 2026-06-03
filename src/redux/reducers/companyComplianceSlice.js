import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getComplianceRecordsApi, getComplianceByProjectIdApi } from '~services/companyComplianceService';
import { getErrorMessage } from '~utils';

export const fetchComplianceRecords = createAsyncThunk(
  'companyCompliance/fetchRecords',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getComplianceRecordsApi();
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchComplianceByProjectId = createAsyncThunk(
  'companyCompliance/fetchByProjectId',
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await getComplianceByProjectIdApi(projectId);
      return res.data ?? res;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const companyComplianceSlice = createSlice({
  name: 'companyCompliance',
  initialState: {
    complianceRecords:  [],
    loading:            false,
    error:              null,
    selectedCompliance: null,
    loadingDetails:     false,
    detailError:        null,
  },
  reducers: {
    clearComplianceRecords: (state) => {
      state.complianceRecords = [];
      state.error             = null;
    },
    clearSelectedCompliance: (state) => {
      state.selectedCompliance = null;
      state.detailError        = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplianceRecords.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchComplianceRecords.fulfilled, (state, { payload }) => {
        state.loading           = false;
        state.complianceRecords = payload;
      })
      .addCase(fetchComplianceRecords.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload ?? 'Failed to load compliance records.';
      })

      .addCase(fetchComplianceByProjectId.pending, (state) => {
        state.loadingDetails = true;
        state.detailError    = null;
      })
      .addCase(fetchComplianceByProjectId.fulfilled, (state, { payload }) => {
        state.loadingDetails     = false;
        state.selectedCompliance = payload;
      })
      .addCase(fetchComplianceByProjectId.rejected, (state, { payload }) => {
        state.loadingDetails = false;
        state.detailError    = payload ?? 'Failed to load compliance details.';
      });
  },
});

export const { clearComplianceRecords, clearSelectedCompliance } = companyComplianceSlice.actions;
export default companyComplianceSlice.reducer;
