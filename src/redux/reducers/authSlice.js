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
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false, // Default false to enforce login flow
  user: {
    type: 'company', // 'company' | 'subcontractor'
    id: null,
    name: null,
    email: null,
  },
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
    },

    // ── DEV ONLY ────────────────────────────────────────────────────────────
    // Remove this action before release
    setUserType: (state, action) => {
      state.user.type = action.payload; // 'company' | 'subcontractor'
    },
    // ── END DEV ONLY ────────────────────────────────────────────────────────
  },
});

export const { setCredentials, logout, setUserType } = authSlice.actions;
export default authSlice.reducer;
