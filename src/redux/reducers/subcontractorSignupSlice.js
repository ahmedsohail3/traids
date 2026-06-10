import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subcontractorSignupApi } from '~services/subcontractorSignupService';
import { getErrorMessage, getValidationErrors } from '~utils';

// ── Initial form state (mirrors API field names) ───────────────────────────────

export const INITIAL_FORM_DATA = {
  // Step 1 — Personal Details
  fullName:               '',
  primaryTrade:           '',
  yearsOfExperience:      '',
  postcode:               '',
  cityLocation:           '',
  // Step 2 — Qualifications (files: { uri, type, name })
  insuranceDocuments:     null,
  insuranceExpiresAt:     '',   // DD/MM/YYYY, converted to ISO in form builder
  ticketDocuments:        null,
  ticketExpiresAt:        '',
  certificationDocuments: null,
  certificationExpiresAt: '',
  // Step 3 — Profile Setup
  profileImage:           null,
  hourlyRate:             '',
  password:               '',
  confirmPassword:        '',   // validation only, stripped before API call
  email:                  '',
  professionalBio:        '',
  workExamples:           null,
};

// ── Per-step validation rules ──────────────────────────────────────────────────

export const STEP_VALIDATORS = {
  1: ({ fullName, primaryTrade, postcode, cityLocation }) => {
    const e = {};
    if (!fullName?.trim())     e.fullName     = 'Full name is required';
    if (!primaryTrade)         e.primaryTrade = 'Please select a primary trade';
    if (!postcode?.trim())     e.postcode     = 'Postcode is required';
    if (!cityLocation?.trim()) e.cityLocation = 'City / Location is required';
    return e;
  },
  // Step 2 — documents are optional; no required validation
  3: ({ hourlyRate, password, confirmPassword, email }) => {
    const e = {};
    if (!hourlyRate?.trim())   e.hourlyRate   = 'Hourly rate is required';
    if (!password)             e.password     = 'Password is required';
    else if (password.length < 8) e.password  = 'Password must be at least 8 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!email?.trim())        e.email        = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    return e;
  },
};

// ── Async thunk ────────────────────────────────────────────────────────────────

export const submitSubcontractorSignup = createAsyncThunk(
  'subcontractorSignup/submit',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await subcontractorSignupApi(formData);
      return data?.data ?? data;
    } catch (error) {
      const validationErrors = getValidationErrors(error);
      const fieldErrors = {};
      validationErrors.forEach(({ field, message }) => { fieldErrors[field] = message; });
      return rejectWithValue({ message: getErrorMessage(error), fieldErrors });
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const subcontractorSignupSlice = createSlice({
  name: 'subcontractorSignup',
  initialState: {
    formData:  { ...INITIAL_FORM_DATA },
    errors:    {},
    loading:   false,
    error:     null,
    submitted: false,
  },
  reducers: {
    updateFormField: (state, { payload: { field, value } }) => {
      state.formData[field] = value;
    },
    setStepErrors: (state, { payload }) => {
      state.errors = { ...state.errors, ...payload };
    },
    clearFieldError: (state, { payload: field }) => {
      delete state.errors[field];
    },
    resetSignup: () => ({
      formData:  { ...INITIAL_FORM_DATA },
      errors:    {},
      loading:   false,
      error:     null,
      submitted: false,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitSubcontractorSignup.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(submitSubcontractorSignup.fulfilled, (state) => {
        state.loading   = false;
        state.submitted = true;
      })
      .addCase(submitSubcontractorSignup.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload?.message ?? 'Signup failed. Please try again.';
        if (payload?.fieldErrors) {
          state.errors = { ...state.errors, ...payload.fieldErrors };
        }
      });
  },
});

export const {
  updateFormField,
  setStepErrors,
  clearFieldError,
  resetSignup,
} = subcontractorSignupSlice.actions;

export default subcontractorSignupSlice.reducer;
