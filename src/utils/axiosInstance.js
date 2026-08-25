import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "react-native-config";
import { forceLogoutAndPurge, store } from "~redux/store";
import { networkRequestFailed, networkRequestSucceeded } from "~redux/reducers/networkSlice";
import { getRefreshToken, storeAccessToken, storeRefreshToken, clearAllTokens, isNetworkError } from "~utils";

// ── Axios Instance ─────────────────────────────────────────────────────────────

const axiosInstance = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: Number(Config.API_TIMEOUT) || 60000,
  headers: { "Content-Type": "application/json" },
});

// ── Request Interceptor — attach access token + debug logging ─────────────────

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `[API ➜] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      '\nHeaders:', config.headers,
      '\nData:', config.data,
      '\nParams:', config.params,
    );

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Token Refresh Queue ────────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ── Offline Read Queue ─────────────────────────────────────────────────────────
//
// A GET that dies because the device is offline is held open rather than
// rejected: its promise stays pending, so the thunk that issued it stays in its
// loading state, and when the connection returns we replay the request and
// resolve the ORIGINAL promise. The calling thunk then fulfils normally and the
// screen populates itself — no refetch wiring needed at any call site.
//
// Only reads are queued. Replaying a POST/PUT/PATCH/DELETE could duplicate a
// chat message, a timesheet approval or a Stripe call, since a write may well
// have reached the server even though its response never came back. Writes fail
// immediately with the offline message so the user can retry deliberately.

const MAX_QUEUED_READS = 20;
// Ceiling on how long a request may hang before we give up and surface the
// error, so a long offline stretch cannot leave spinners running forever.
const MAX_QUEUE_WAIT_MS = 90 * 1000;

let offlineQueue = [];

const isReadRequest = (config) =>
  (config?.method ?? "get").toLowerCase() === "get";

const removeFromQueue = (entry) => {
  clearTimeout(entry.timer);
  offlineQueue = offlineQueue.filter((e) => e !== entry);
};

/**
 * Replays every queued read. Called when connectivity returns.
 * Each entry resolves or rejects the promise its original caller is still awaiting.
 */
export const replayOfflineQueue = () => {
  if (offlineQueue.length === 0) return;

  const pending = offlineQueue;
  offlineQueue = [];

  pending.forEach((entry) => {
    clearTimeout(entry.timer);
    axiosInstance(entry.config).then(entry.resolve, entry.reject);
  });
};

/** Drops every queued read, rejecting each caller. Used on logout. */
export const clearOfflineQueue = (reason) => {
  const pending = offlineQueue;
  offlineQueue = [];
  pending.forEach((entry) => {
    clearTimeout(entry.timer);
    entry.reject(reason ?? new Error("Request cancelled"));
  });
};

const queueOfflineRead = (config, error) =>
  new Promise((resolve, reject) => {
    // Oldest first: a stale list fetch matters less than the one just issued.
    if (offlineQueue.length >= MAX_QUEUED_READS) {
      const oldest = offlineQueue.shift();
      clearTimeout(oldest.timer);
      oldest.reject(error);
    }

    const entry = { config, resolve, reject };
    entry.timer = setTimeout(() => {
      removeFromQueue(entry);
      reject(error);
    }, MAX_QUEUE_WAIT_MS);

    offlineQueue.push(entry);
  });

// ── Handle Unauthorized — session expired ──────────────────────────────────────

const handleUnauthorized = async () => {
  try {
    await clearAllTokens();
    forceLogoutAndPurge();
  } catch {
    // Silently fail — logout is best-effort here
  }
};

// ── Response Interceptor — handle errors & token refresh ───────────────────────

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `[API ✓] ${response.status} ${response.config?.method?.toUpperCase()} ${response.config?.url}`,
      '\nResponse:', response.data,
    );
    // Reaching the server is the only proof the network really works — NetInfo
    // reports "connected" on captive portals and dead Wi-Fi too.
    store.dispatch(networkRequestSucceeded());
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // ── Full error dump for debugging ──────────────────────────────────────────
    console.log(
      `[API ✗] ${error.response?.status ?? 'NO_RESPONSE'} ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
      '\nRequest headers:', originalRequest?.headers,
      '\nRequest data:', originalRequest?.data,
      '\nResponse status:', error.response?.status,
      '\nResponse headers:', error.response?.headers,
      '\nResponse body:', JSON.stringify(error.response?.data, null, 2),
      '\nError message:', error.message,
    );
    // ──────────────────────────────────────────────────────────────────────────

    if (!error.response) {
      // Network-level failure — the request never reached the server. Flag it so
      // the offline banner appears even when NetInfo still believes we are on.
      if (isNetworkError(error)) {
        store.dispatch(networkRequestFailed(Date.now()));

        // Hold reads open to be replayed on reconnect. `_offlineQueued` stops a
        // replayed request that fails again from being queued a second time.
        if (isReadRequest(originalRequest) && !originalRequest._offlineQueued) {
          originalRequest._offlineQueued = true;
          return queueOfflineRead(originalRequest, error);
        }
      }
      return Promise.reject(error);
    }

    const { status } = error.response;
    const errorMessage = error.response?.data?.message ?? "";
    const isLoginRequest = originalRequest.url?.includes("/auth/login");
    const isInvalidCredentials =
      errorMessage.toString().toLowerCase().includes("invalid credential") ||
      errorMessage.toString().toLowerCase().includes("incorrect password") ||
      errorMessage.toString().toLowerCase().includes("user not found");

    // 401 — attempt token refresh (skip for login / invalid-creds)
    if (status === 401 && !originalRequest._retry && !isLoginRequest && !isInvalidCredentials) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token available");

        const response = await axios.post(`${Config.API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const newAccessToken = response.data?.data?.accessToken ?? response.data?.accessToken;
        const newRefreshToken = response.data?.data?.refreshToken ?? response.data?.refreshToken;

        if (!newAccessToken) throw new Error("No access token in response");

        await storeAccessToken(newAccessToken);
        if (newRefreshToken) await storeRefreshToken(newRefreshToken);

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await handleUnauthorized();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
