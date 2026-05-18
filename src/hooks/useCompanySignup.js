import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateFormField,
  setStepErrors,
  clearFieldError,
  resetSignup,
  submitCompanySignup,
  STEP_VALIDATORS,
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
 *   submit          — () → dispatch the signup thunk
 *   reset           — () → wipe all form state
 */
const useCompanySignup = () => {
  const dispatch = useDispatch();
  const { formData, errors, loading, error, submitted } = useSelector(
    (s) => s.companySignup,
  );

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
    submit,
    reset,
  };
};

export default useCompanySignup;
