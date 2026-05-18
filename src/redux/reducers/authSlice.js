/**
 * authSlice.js
 *
 * Manages authentication state and user role.
 * `isAuthenticated` → false when the token is cleared by the backend.
 * `user.type`       → 'company' | 'subcontractor', set on login.
 *
 * DEV ONLY: `setUserType` lets you hot-swap the role without a real login.
 * Remove the DEV ONLY block (setUserType action + export) before going to production.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, forgotPasswordApi, verifyResetTokenApi, resetPasswordApi } from '~services/authService';
import { getErrorMessage, storeAccessToken, storeRefreshToken, storeUserType } from '~utils';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email, userType }, { rejectWithValue }) => {
    try {
      await forgotPasswordApi({ email, userType });
      return { email };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const verifyResetToken = createAsyncThunk(
  'auth/verifyResetToken',
  async ({ email, resetToken, userType }, { rejectWithValue }) => {
    try {
      const data = await verifyResetTokenApi({ email, resetToken, userType });
      const verifiedToken = data?.data?.token ?? data?.token ?? resetToken;
      return { token: verifiedToken };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, resetToken, userType, newPassword }, { rejectWithValue }) => {
    try {
      await resetPasswordApi({ email, resetToken, userType, newPassword });
      return true;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, userType }, { rejectWithValue }) => {
    try {
      const data = await loginApi({ email, password, userType });
      // Support both { data: { accessToken } } and { accessToken } response shapes

      console.log("auth data", data);
      const payload = data?.data ?? data;
      const { accessToken, refreshToken, user } = payload;

      await storeAccessToken(accessToken);
      if (refreshToken) await storeRefreshToken(refreshToken);
      await storeUserType(userType);

      return { user, userType };
    } catch (error) {
      console.log("auth error", error);
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const RESET_FLOW_INITIAL = {
  loading: false,
  error: null,
  email: '',
  token: '',
  isTokenVerified: false,
  isComplete: false,
};

const initialState = {
  isAuthenticated: false,
  user: {
    type: 'company', // 'company' | 'subcontractor'
    id: null,
    name: null,
    email: null,
  },
  loading: false,
  error: null,
  resetFlow: { ...RESET_FLOW_INITIAL },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.isAuthenticated = true;
      state.user = { ...state.user, ...action.payload };
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = initialState.user;
      state.loading = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },

    clearResetFlow: (state) => {
      state.resetFlow = { ...RESET_FLOW_INITIAL };
    },
    clearResetError: (state) => {
      state.resetFlow.error = null;
    },

    // ── DEV ONLY ────────────────────────────────────────────────────────────
    // Remove this action before release
    setUserType: (state, action) => {
      state.user.type = action.payload; // 'company' | 'subcontractor'
    },
    // ── END DEV ONLY ────────────────────────────────────────────────────────
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = {
          ...state.user,
          ...action.payload.user,
          type: action.payload.userType ?? state.user.type,
        };
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Login failed. Please try again.';
      })
      // ── Forgot Password ──────────────────────────────────────────────────
      .addCase(forgotPassword.pending, (state) => {
        state.resetFlow.loading = true;
        state.resetFlow.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, { payload }) => {
        state.resetFlow.loading = false;
        state.resetFlow.email = payload.email;
      })
      .addCase(forgotPassword.rejected, (state, { payload }) => {
        state.resetFlow.loading = false;
        state.resetFlow.error = payload ?? 'Failed to send reset email. Please try again.';
      })
      // ── Verify Reset Token ───────────────────────────────────────────────
      .addCase(verifyResetToken.pending, (state) => {
        state.resetFlow.loading = true;
        state.resetFlow.error = null;
      })
      .addCase(verifyResetToken.fulfilled, (state, { payload }) => {
        state.resetFlow.loading = false;
        state.resetFlow.token = payload.token;
        state.resetFlow.isTokenVerified = true;
      })
      .addCase(verifyResetToken.rejected, (state, { payload }) => {
        state.resetFlow.loading = false;
        state.resetFlow.error = payload ?? 'Invalid or expired code. Please try again.';
      })
      // ── Reset Password ───────────────────────────────────────────────────
      .addCase(resetPassword.pending, (state) => {
        state.resetFlow.loading = true;
        state.resetFlow.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetFlow.loading = false;
        state.resetFlow.isComplete = true;
      })
      .addCase(resetPassword.rejected, (state, { payload }) => {
        state.resetFlow.loading = false;
        state.resetFlow.error = payload ?? 'Failed to reset password. Please try again.';
      });
  },
});

export const { setCredentials, logout, clearAuthError, setUserType, clearResetFlow, clearResetError } = authSlice.actions;
export default authSlice.reducer;
