import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

// import authReducer, { logout } from "../reducers/authReducer";
// import circleReducer from "../reducers/circleReducer";
// import listReducer from "../reducers/listReducer";
// import locationReducer from "../reducers/locationReducer";
// import notificationReducer from "../reducers/notificationReducer";
// import searchReducer from "../reducers/searchReducer";
// import sessionReducer from "../reducers/sessionReducer";
import themeReducer from "../reducers/themeReducer";
import authReducer, { logout } from "../reducers/authSlice";
import profileReducer from "../reducers/profileSlice";
import dashboardReducer from "../reducers/dashboardSlice";
import companySubcontractorsReducer from "../reducers/companySubcontractorsSlice";
import companyReportsReducer from "../reducers/companyReportsSlice";
import companySignupReducer from "../reducers/companySignupSlice";
import subcontractorJobsReducer from "../reducers/subcontractorJobsSlice";
import subcontractorBookingsReducer from "../reducers/subcontractorBookingsSlice";
import companyJobsReducer from "../reducers/companyJobsSlice";
import companyTimesheetReducer from "../reducers/companyTimesheetSlice";
import companyInvoicesReducer from "../reducers/companyInvoicesSlice";
import companyComplianceReducer from "../reducers/companyComplianceSlice";
import companyFinancialsReducer from "../reducers/companyFinancialsSlice";
import chatReducer from "../reducers/chatSlice";
import subcontractorProfileReducer from "../reducers/subcontractorProfileSlice";
import subcontractorSignupReducer from "../reducers/subcontractorSignupSlice";
import subcontractorDocumentUploadReducer from "../reducers/subcontractorDocumentUploadSlice";
import subcontractorTimesheetReducer from "../reducers/subcontractorTimesheetSlice";
import notificationsReducer from "../reducers/notificationsSlice";
import socketReducer from "../reducers/socketSlice";
import { disconnectSocket } from "../../services/socket/socketService";
// import settingsReducer from "../reducers/settingsReducer";

// ─── Combined slice reducer ────────────────────────────────────────────────────
const combinedReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  dashboard: dashboardReducer,
  companySubcontractors: companySubcontractorsReducer,
  companyReports: companyReportsReducer,
  companySignup: companySignupReducer,
  subcontractorJobs: subcontractorJobsReducer,
  subcontractorBookings: subcontractorBookingsReducer,
  companyJobs: companyJobsReducer,
  companyTimesheet: companyTimesheetReducer,
  companyInvoices: companyInvoicesReducer,
  companyCompliance: companyComplianceReducer,
  companyFinancials: companyFinancialsReducer,
  chat: chatReducer,
  subcontractorProfile: subcontractorProfileReducer,
  subcontractorSignup:           subcontractorSignupReducer,
  subcontractorDocumentUpload:   subcontractorDocumentUploadReducer,
  subcontractorTimesheet:        subcontractorTimesheetReducer,
  notifications:        notificationsReducer,
  socket:               socketReducer,
  theme: themeReducer,
});

// ─── Root reducer — full state reset on logout ─────────────────────────────────
// Passing `undefined` causes every slice to return its initialState.
const rootReducer = (state, action) => {
  if (action.type === logout.type) {
    // Full state reset on logout — every slice returns its initialState
    return combinedReducer(undefined, action);
  }
  return combinedReducer(state, action);
};

// ─── Persistence config ────────────────────────────────────────────────────────
//
// Slices to persist — chosen for UX (show cached data while fresh data loads):
//   profile               — user's own profile, stable between sessions
//   dashboard             — role-scoped dashboard data (nested: company / subcontractor)
//   companySubcontractors — subcontractor list, shows cached results while refetching
//   companyReports        — report data, slow to load so caching helps
//   theme                 — user preference, must survive restarts
//
// NOT persisted:
//   auth                  — tokens live in AsyncStorage, rehydrated by useAppInit
//   companySubcontractorProfile — per-navigation, always fetched fresh
//
const PERSISTED_KEYS = [
  "profile",
  "dashboard",
  "companySubcontractors",
  "companyReports",
  "theme",
];

// Recursively reset loading → false and error → null on any rehydrated object.
// Handles both flat slices ({ loading, error, data }) and nested ones
// like dashboard ({ company: { loading, error, data }, subcontractor: { ... } }).
const sanitizeSlice = (obj) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
  const out = { ...obj };
  for (const key of Object.keys(out)) {
    const lower = key.toLowerCase();
    if (lower.includes("loading")) {
      out[key] = false;
    } else if (lower === "error" || lower.endsWith("error")) {
      out[key] = null;
    } else if (out[key] && typeof out[key] === "object" && !Array.isArray(out[key])) {
      out[key] = sanitizeSlice(out[key]);
    }
  }
  return out;
};

const sanitizeLoadingState = (inboundState, _originalState, reducedState) => {
  const sanitized = { ...reducedState };
  for (const key of PERSISTED_KEYS) {
    const inbound = inboundState?.[key];
    if (inbound && typeof inbound === "object") {
      sanitized[key] = sanitizeSlice(inbound);
    }
  }
  return sanitized;
};

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: PERSISTED_KEYS,
  stateReconciler: sanitizeLoadingState,
};


const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

// // ─── logoutAndPurge ────────────────────────────────────────────────────────────
// // Server-gated logout for current device.
// // 1. POST /session/logout-current
// // 2. On success → dispatch(logout()) + persistor.purge()
// // 3. On failure → throws so the caller can show an error toast.
// export const logoutAndPurge = async () => {
//   const { logoutCurrentSession } = await import("../actions/sessionActions");

//   const result = await store.dispatch(logoutCurrentSession());

//   if (logoutCurrentSession.rejected.match(result)) {
//     throw new Error(result.payload || "Failed to logout. Please try again.");
//   }

//   store.dispatch(logout());
//   persistor.purge();
// };

// // ─── logoutAllAndPurge ─────────────────────────────────────────────────────────
// // Logout from ALL devices (including current).
// // 1. DELETE /session/logout-all  (invalidates every session server-side)
// // 2. On success → dispatch(logout()) + persistor.purge()
// //    This ensures the current device is logged out gracefully.
// // 3. On failure → throws so the caller can handle the error.
// export const logoutAllAndPurge = async () => {
//   const { logoutAllSessions } = await import("../actions/sessionActions");

//   const result = await store.dispatch(logoutAllSessions());

//   if (logoutAllSessions.rejected.match(result)) {
//     throw new Error(result.payload || "Failed to logout from all devices.");
//   }

//   // Wipe local state after server confirms all sessions ended
//   store.dispatch(logout());
//   persistor.purge();
// };

// ─── forceLogoutAndPurge ───────────────────────────────────────────────────────
// Bypass server — used by the 401 interceptor when the token is already expired.
export const forceLogoutAndPurge = () => {
  disconnectSocket();
  store.dispatch(logout());
  persistor.purge();
};
