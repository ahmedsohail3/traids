/**
 * payoutStatus
 *
 * Stripe's `return_url` fires whenever the user leaves Connect onboarding —
 * finished, half-finished, or abandoned — and closing the WebView by hand says
 * nothing either. Both cases are resolved by re-reading `/auth/profile`, where
 * the backend reports `stripeOnboardingComplete`.
 *
 * Only that flag lets a user through; anything else means "onboard again".
 */

// The flag the API actually returns, plus tolerated aliases in case the
// response is nested or named differently on some endpoints.
const COMPLETE_KEYS = [
  'stripeOnboardingComplete',
  'stripe_onboarding_complete',
  'onboardingComplete',
  'payoutsEnabled',
  'payouts_enabled',
];

// Places the flag might sit within a profile response
const CONTAINER_KEYS = ['stripe', 'stripeAccount', 'stripe_account', 'subcontractor', 'user', 'profile'];

const truthy = (v) => v === true || v === 'true';

const readFlag = (source) => {
  if (!source || typeof source !== 'object') return undefined;
  for (const key of COMPLETE_KEYS) {
    if (source[key] !== undefined) return source[key];
  }
  return undefined;
};

/**
 * @param {Object} response — raw body from GET /auth/profile
 * @returns {boolean} true only when the backend confirms onboarding finished
 */
export const isOnboardingComplete = (response) => {
  const root = response?.data ?? response;
  if (!root || typeof root !== 'object') return false;

  const atRoot = readFlag(root);
  if (atRoot !== undefined) return truthy(atRoot);

  // Fall back to one level of nesting before giving up
  for (const key of CONTAINER_KEYS) {
    const nested = readFlag(root[key]);
    if (nested !== undefined) return truthy(nested);
  }

  // Absent flag is not proof of completion — make them onboard again
  return false;
};
