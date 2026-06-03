import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProfileApi, updateCompanyProfileApi } from '~services/profileService';
import { getErrorMessage } from '~utils';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getProfileApi();
      // Support both { data: { ...profile } } and { ...profile } response shapes
      const profileData = { ...(data?.profile || data), userType: data?.userType };
      return profileData;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateCompanyProfile = createAsyncThunk(
  'profile/update',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await updateCompanyProfileApi(formData);
      return res.data ?? res;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
  data: null,   // Populated after fetchProfile resolves
  loading: false,
  error: null,
  updatingProfile: false,
  updateError: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: () => initialState,
    clearProfileError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load profile.';
      })
      .addCase(updateCompanyProfile.pending, (state) => {
        state.updatingProfile = true;
        state.updateError = null;
      })
      .addCase(updateCompanyProfile.fulfilled, (state, action) => {
        state.updatingProfile = false;
        if (state.data && action.payload) {
          Object.assign(state.data, action.payload);
        }
      })
      .addCase(updateCompanyProfile.rejected, (state, action) => {
        state.updatingProfile = false;
        state.updateError = action.payload ?? 'Failed to update profile.';
      });
  },
});

export const { clearProfile, clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
