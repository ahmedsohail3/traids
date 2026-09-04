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

/**
 * Writes the whole session in one commit.
 *
 * The tokens and the user type were previously three separate setItem calls, so
 * a crash or kill between them could leave an access token stored with no user
 * type. On the next cold start that reads as an authenticated session of unknown
 * role — and the restore then defaulted it to 'company', dropping a
 * subcontractor into the company app with a valid token.
 *
 * multiSet is a single batched write, so the session is either fully stored or
 * not stored at all. Returns false if it failed, letting the caller treat the
 * login as unsuccessful rather than half-persisted.
 */
export const storeSession = async ({ accessToken, refreshToken, userType }) => {
  if (!accessToken || !userType) return false;

  const pairs = [
    ["accessToken", accessToken],
    ["userType", userType],
  ];
  if (refreshToken) pairs.push(["refreshToken", refreshToken]);

  try {
    await AsyncStorage.multiSet(pairs);
    return true;
  } catch (error) {
    console.warn("Error saving session:", error);
    return false;
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


const HTML_ENTITIES = {
  '&nbsp;': ' ',
  '&amp;':  '&',
  '&lt;':   '<',
  '&gt;':   '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;':  "'",
};

/**
 * Flattens an HTML description to plain text for display in a <Text>.
 *
 * Job descriptions are authored in a rich-text editor on the web side, so they
 * reach the app as markup. Unknown entities are left as-is rather than guessed at.
 */
export const stripHtml = (str) => {
  if (typeof str !== 'string' || !str) return '';

  return (
    str
      // Drop script/style bodies whole — stripping only their tags would leave
      // the CSS or JS behind as visible text.
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
      // Block-level ends become line breaks, otherwise '<p>a</p><p>b</p>'
      // collapses to 'ab' with the words run together.
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      // Decode after tag removal, so an encoded &lt;b&gt; is never treated as a tag.
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&[a-z]+;/gi, (entity) => HTML_ENTITIES[entity.toLowerCase()] ?? entity)
      // Tidy the whitespace the tags left behind, keeping paragraph breaks.
      .replace(/[ \t]+/g, ' ')
      .replace(/[ \t]*\n[ \t]*/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
};



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

// Single wording for every offline surface — the banner, thunk errors, alerts.
export const OFFLINE_MESSAGE =
  "No internet connection. Please check your connection and try again.";

/**
 * True when a request never reached the server: airplane mode, no signal, DNS
 * failure, TLS failure, timeout. Axios leaves `response` undefined for all of
 * these, which is what separates them from a 4xx/5xx the server actually sent.
 */
export const isNetworkError = (error) =>
  !!error && !error.response && (
    error.code === "ERR_NETWORK" ||
    error.code === "ECONNABORTED" ||
    error.message === "Network Error" ||
    !!error.request
  );

export const getErrorMessage = (error, firstOnly = true) => {
  if (!error) return "Something went wrong";

  // Checked before anything else: a request that never landed has no response
  // body to read a message out of, and "Network Error" is not user-facing.
  if (isNetworkError(error)) return OFFLINE_MESSAGE;

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


/**
 * timeAgo — compact relative time for review timestamps ("2h ago").
 *
 * Falls back to a plain date beyond four weeks, where "31d ago" stops being
 * easier to read than the date itself. Returns null for anything unparseable
 * so callers can hide the badge rather than render "Invalid Date ago".
 *
 * @param {string|number|Date|null} value
 * @returns {string|null}
 */
export const timeAgo = (value) => {
  if (!value) return null;
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return null;

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  return new Date(then).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
