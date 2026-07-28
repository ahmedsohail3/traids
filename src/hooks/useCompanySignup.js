import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateFormField,
  setStepErrors,
  clearFieldError,
  resetSignup,
  submitCompanySignup,
  validateCompanyFields,
  STEP_VALIDATORS,
  STEP_VALIDATE_FIELDS,
  STEP_FIELDS,
} from '~redux/reducers/companySignupSlice';

/**
 * useCompanySignup
 *
 * Centralises all state and logic for the multi-step company signup flow.
 *
 * Exposed API:
 *   formData        — current values for every field (API-named keys)
 *   errors          — field-level error map
 *   loading         — true while the signup API call is in flight
 *   error           — global error string from the API (or null)
 *   submitted       — true once the API call succeeds
 *   updateField     — (field, value) → update a single field
 *   clearError      — (field) → clear a single field's error
 *   validateStep    — (step) → run step rules, store errors, return boolean
 *   validating      — true while a server duplicate-check is in flight
 *   validateOnServer— (step) → Promise<boolean>, duplicate-check that step's fields
 *   stepWithErrors  — () → first step number holding a field error, or null
 *   submit          — () → dispatch the signup thunk
 *   reset           — () → wipe all form state
 */
const useCompanySignup = () => {
  const dispatch = useDispatch();
  const {
    formData, errors, loading, error, submitted, validating, validated,
    paymentMethodId, cardPreview,
  } = useSelector((s) => s.companySignup);

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

  /**
   * Asks the server whether this step's identifying fields are already taken.
   * Skips the round-trip when every field still holds its last confirmed value.
   * @returns {Promise<boolean>} true when the fields are free (or nothing to check)
   */
  const validateOnServer = async (step) => {
    const fieldNames = STEP_VALIDATE_FIELDS[step];
    if (!fieldNames) return true;

    const fields = {};
    fieldNames.forEach((field) => {
      const value = formData[field]?.trim();
      if (value && validated[field] !== value) fields[field] = value;
    });
    if (!Object.keys(fields).length) return true;

    try {
      await dispatch(validateCompanyFields(fields)).unwrap();
      return true;
    } catch {
      return false; // messages are already in errors[field]
    }
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

  const submit = () => dispatch(submitCompanySignup(formData));

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
    validating,
    validateOnServer,
    stepWithErrors,
    // Card tokenised at step 2, confirmed once the account exists
    paymentMethodId,
    cardPreview,
    submit,
    reset,
  };
};

export default useCompanySignup;
