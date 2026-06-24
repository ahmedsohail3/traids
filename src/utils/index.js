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


export const stripHtml = (str) =>
  str ? str.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : '';



export const formatErrorMsg = (err) =>
  (typeof err === 'string' ? err : 'Failed to delete job.')
    .replace(/\bin_progress\b/gi, 'In Progress');

/**
 * Clear all session data — tokens + user type.
 * Called on logout and by the 401 interceptor on session expiry.
 */
export const clearAllTokens = async () => {
  try {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "userType"]);
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

