import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "react-native-config";
import { forceLogoutAndPurge } from "~redux/store";
import { getRefreshToken, storeAccessToken, storeRefreshToken, clearAllTokens } from "~utils";

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
      // Network-level failure (no response received)
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
