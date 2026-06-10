import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateSubcontractorProfileApi } from '~services/subcontractorProfileService';
import { getErrorMessage } from '~utils';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const updateSubcontractorProfile = createAsyncThunk(
  'subcontractorProfile/update',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await updateSubcontractorProfileApi(formData);
      return res.data ?? res;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
  updatingProfile:     false,
  updateProfileError:  null,
};

const subcontractorProfileSlice = createSlice({
  name: 'subcontractorProfile',
  initialState,
  reducers: {
    clearUpdateProfileError: (state) => {
      state.updateProfileError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateSubcontractorProfile.pending, (state) => {
        state.updatingProfile    = true;
        state.updateProfileError = null;
      })
      .addCase(updateSubcontractorProfile.fulfilled, (state) => {
        state.updatingProfile = false;
      })
      .addCase(updateSubcontractorProfile.rejected, (state, { payload }) => {
        state.updatingProfile    = false;
        state.updateProfileError = payload ?? 'Failed to update profile.';
      });
  },
});

export const { clearUpdateProfileError } = subcontractorProfileSlice.actions;
export default subcontractorProfileSlice.reducer;
