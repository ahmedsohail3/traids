import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProfileApi } from '~services/profileService';
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

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
  data: null,   // Populated after fetchProfile resolves
  loading: false,
  error: null,
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
      });
  },
});

export const { clearProfile, clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
