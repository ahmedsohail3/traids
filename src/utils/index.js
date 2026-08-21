import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Token Management ───────────────────────────────────────────────────────────

export const storeAccessToken = async (token) => {
  try {
    if (token) await AsyncStorage.setItem("accessToken", token);
  } catch (error) {
    console.warn("Error saving access token:", error);
  }
};

export const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem("accessToken");
  } catch {
    return null;
  }
};

export const clearAccessToken = async () => {
  try {
    await AsyncStorage.removeItem("accessToken");
  } catch {
    // Silent fail
  }
};

export const storeRefreshToken = async (token) => {
  try {
    if (token) await AsyncStorage.setItem("refreshToken", token);
  } catch (error) {
    console.warn("Error saving refresh token:", error);
  }
};

export const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem("refreshToken");
  } catch {
    return null;
  }
};

export const clearRefreshToken = async () => {
  try {
    await AsyncStorage.removeItem("refreshToken");
  } catch {
    // Silent fail
  }
};

export const storeUserType = async (type) => {
  try {
    if (type) await AsyncStorage.setItem("userType", type);
  } catch {
    // Silent fail
  }
};

export const getUserType = async () => {
  try {
    return await AsyncStorage.getItem("userType");
  } catch {
    return null;
  }
};

// The plan a company picked on ChoosePlanScreen. Persisted so the picker is not
// shown again on cold start before the profile fetch comes back.
export const storeAccountType = async (accountType) => {
  try {
    if (accountType) await AsyncStorage.setItem("accountType", accountType);
  } catch {
    // Silent fail
  }
};

export const getAccountType = async () => {
  try {
    return await AsyncStorage.getItem("accountType");
  } catch {
    return null;
  }
};


export const stripHtml = (str) =>
  str ? str.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : '';



export const formatErrorMsg = (err) =>
  (typeof err === 'string' ? err : 'Failed to delete job.')
    .replace(/\bin_progress\b/gi, 'In Progress');

/**
 * Clear all session data — tokens + user type + account type.
 * Called on logout and by the 401 interceptor on session expiry.
 */
export const clearAllTokens = async () => {
  try {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "userType", "accountType"]);
  } catch {
    // Silent fail
  }
};


// ── Error Handling ─────────────────────────────────────────────────────────────

export const getErrorMessage = (error, firstOnly = true) => {
  if (!error) return "Something went wrong";

  const data = error.response?.data;
  
  // Check for the new structured `errors` array from validation
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    // If it's the structured { field, message } format
    if (data.errors[0]?.message) {
      // Just returning the first message, or we could pass the whole array for the screens to parse
      return firstOnly ? data.errors[0].message : data.errors.map(e => e.message).join("\n");
    }
  }

  const apiMessage = data?.message;

  if (apiMessage) {
    if (Array.isArray(apiMessage)) {
      return firstOnly ? apiMessage[0] : apiMessage.join("\n");
    }
    if (typeof apiMessage === "string") return apiMessage;
  }

  return error.message || "Something went wrong";
};

// Add a new utility specifically for extracting structured validation errors
export const getValidationErrors = (error) => {
  const data = error?.response?.data;
  if (data?.errors && Array.isArray(data.errors)) {
    return data.errors; // Returns array of { field, message }
  }
  return [];
};

/**
 * Reads a successful /validate response body and returns { field: message } for
 * every field the server flagged as unavailable.
 *
 * Expected shape — a 200 carrying per-field results:
 *   { success: true, data: { email: { valid: false, message: 'Email already in use' } } }
 * Also tolerates `exists: true` / `available: false` in place of `valid: false`.
 *
 * @param {Object} response — raw API response body
 * @returns {Object} field → message (empty when everything is available)
 */
export const getInvalidValidationFields = (response) => {
  const payload = response?.data ?? response;
  if (!payload || typeof payload !== "object") return {};

  const invalid = {};
  for (const [field, result] of Object.entries(payload)) {
    if (!result || typeof result !== "object") continue;
    if (result.valid === false || result.exists === true || result.available === false) {
      invalid[field] = result.message ?? "This value is already registered";
    }
  }
  return invalid;
};

// ── Persisted State ────────────────────────────────────────────────────────────

/**
 * Clear Redux persisted state from AsyncStorage
 */
export const clearPersistedState = async () => {
  try {
    await AsyncStorage.removeItem("persist:root");
  } catch {
    // Silent fail
  }
};

