import { useSelector, useDispatch } from 'react-redux';
import {
  updateFormField,
  setStepErrors,
  clearFieldError,
  resetSignup,
  submitSubcontractorSignup,
  validateSubcontractorEmail,
  fetchOnboardingLink,
  clearOnboardingUrl,
  clearOnboardingError,
  STEP_VALIDATORS,
  STEP_FIELDS,
} from '~redux/reducers/subcontractorSignupSlice';

/**
 * useSubcontractorSignup
 *
 * Centralises all state and logic for the multi-step subcontractor signup flow.
 * Mirrors useCompanySignup exactly.
 *
 * Exposed API:
 *   formData     — current values for every field (API-named keys)
 *   errors       — field-level error map
 *   loading      — true while the signup API call is in flight
 *   error        — global error string from the API (or null)
 *   submitted    — true once the API call succeeds
 *   updateField  — (field, value) → update a single field
 *   clearError   — (field) → clear a single field's error
 *   validateStep — (step) → run step rules, store errors, return boolean
 *   validatingEmail — true while the email availability check is in flight
 *   validateEmail — () → Promise<boolean>, server check for an existing email
 *   stepWithErrors — () → first step number holding a field error, or null
 *   onboardingUrl / onboardingLoading / onboardingError — Stripe Connect payout setup
 *   startOnboarding / closeOnboarding — open & dismiss the onboarding WebView
 *   submit       — () → dispatch the signup thunk
 *   reset        — () → wipe all form state
 */
const useSubcontractorSignup = () => {
  const dispatch = useDispatch();
  const {
    formData, errors, loading, error, submitted, validatingEmail, validatedEmail,
    onboardingUrl, onboardingLoading, onboardingError,
  } = useSelector((s) => s.subcontractorSignup);

  const updateField = (field, value) =>
    dispatch(updateFormField({ field, value }));

  const clearError = (field) => dispatch(clearFieldError(field));

  const validateStep = (step) => {
    const validator = STEP_VALIDATORS[step];
    if (!validator) return true;
    const stepErrors = validator(formData);
    if (Object.keys(stepErrors).length > 0) {
      dispatch(setStepErrors(stepErrors));
      return false;
    }
    return true;
  };

  // Server-side field errors can belong to an earlier step's screen — this tells
  // the caller which step to send the user back to so the errors are visible.
  const stepWithErrors = () => {
    const failed = Object.keys(errors);
    if (!failed.length) return null;
    const step = Object.keys(STEP_FIELDS).find((s) =>
      STEP_FIELDS[s].some((field) => failed.includes(field)),
    );
    return step ? Number(step) : null;
  };

  /**
   * Asks the server whether the current email is free.
   * Skips the round-trip when the same email was already confirmed.
   * @returns {Promise<boolean>} true when the email is available
   */
  const validateEmail = async () => {
    const email = formData.email?.trim();
    if (!email) return false;
    if (validatedEmail === email) return true;
    try {
      await dispatch(validateSubcontractorEmail(email)).unwrap();
      return true;
    } catch {
      return false; // message is already in errors.email
    }
  };

  // ── Stripe Connect payout onboarding (step 4) ────────────────────────────────
  // Fetching the link opens the in-app WebView; the modal closes itself once the
  // return_url's `stripeReturn=true` marker shows up in the navigation state.
  const startOnboarding = () => dispatch(fetchOnboardingLink());
  const closeOnboarding = () => dispatch(clearOnboardingUrl());
  const dismissOnboardingError = () => dispatch(clearOnboardingError());

  const submit = () => dispatch(submitSubcontractorSignup(formData));

  const reset = () => dispatch(resetSignup());

  return {
    formData,
    errors,
    loading,
    error,
    submitted,
    updateField,
    clearError,
    validateStep,
    validatingEmail,
    validateEmail,
    stepWithErrors,
    onboardingUrl,
    onboardingLoading,
    onboardingError,
    startOnboarding,
    closeOnboarding,
    dismissOnboardingError,
    submit,
    reset,
  };
};

export default useSubcontractorSignup;
