import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getComplianceRecordsApi,
  getComplianceByProjectIdApi,
  uploadComplianceDocumentApi,
  deleteComplianceDocumentApi,
  shareComplianceApi,
} from '~services/companyComplianceService';
import { buildFormData } from '~utils/buildFormData';
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

export const uploadComplianceDocument = createAsyncThunk(
  'companyCompliance/uploadDocument',
  async ({ projectId, tab, document }, { rejectWithValue }) => {
    try {
      const formData = buildFormData({}, { files: document });
      const res = await uploadComplianceDocumentApi(projectId, tab, formData);
      return res.data ?? res;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const shareCompliance = createAsyncThunk(
  'companyCompliance/share',
  async ({ complianceId, email }, { rejectWithValue }) => {
    try {
      const res = await shareComplianceApi(complianceId, email);
      return res.data ?? res;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteComplianceDocument = createAsyncThunk(
  'companyCompliance/deleteDocument',
  async ({ projectId, tab, fileUrl }, { rejectWithValue }) => {
    try {
      const res = await deleteComplianceDocumentApi(projectId, tab, fileUrl);
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
    uploading:          false,
    uploadError:        null,
    deleting:           false,
    deleteError:        null,
    sharing:            false,
    shareError:         null,
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
      })

      .addCase(uploadComplianceDocument.pending, (state) => {
        state.uploading   = true;
        state.uploadError = null;
      })
      .addCase(uploadComplianceDocument.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(uploadComplianceDocument.rejected, (state, { payload }) => {
        state.uploading   = false;
        state.uploadError = payload ?? 'Upload failed.';
      })

      .addCase(deleteComplianceDocument.pending, (state) => {
        state.deleting    = true;
        state.deleteError = null;
      })
      .addCase(deleteComplianceDocument.fulfilled, (state) => {
        state.deleting = false;
      })
      .addCase(deleteComplianceDocument.rejected, (state, { payload }) => {
        state.deleting    = false;
        state.deleteError = payload ?? 'Delete failed.';
      })

      .addCase(shareCompliance.pending, (state) => {
        state.sharing    = true;
        state.shareError = null;
      })
      .addCase(shareCompliance.fulfilled, (state) => {
        state.sharing = false;
      })
      .addCase(shareCompliance.rejected, (state, { payload }) => {
        state.sharing    = false;
        state.shareError = payload ?? 'Share failed.';
      });
  },
});

export const {
  clearComplianceRecords,
  clearSelectedCompliance,
} = companyComplianceSlice.actions;
export default companyComplianceSlice.reducer;
