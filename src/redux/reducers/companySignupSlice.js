import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { companySignupApi } from '~services/companySignupService';
import { getErrorMessage, getValidationErrors } from '~utils';

// ── Initial form state (mirrors API field names) ───────────────────────────────
export const INITIAL_FORM_DATA = {
  // Step 1 — Business Details
  companyName:          '',
  registrationNumber:   '',
  vatNumber:            '',
  industryType:         '',
  // Step 3 — Company Details
  primaryContactName:   '',
  workEmail:            '',
  phoneNumber:          '',
  password:             '',
  confirmPassword:      '',   // validation only, stripped before API call
  headOfficeAddress:    '',
  // Step 4 — Verification (files: { uri, type, name })
  companyDocuments:     null,
  insuranceCertificate: null,
  healthAndSafetyPolicy:null,
};

// ── Per-step validation rules ──────────────────────────────────────────────────
export const STEP_VALIDATORS = {
  1: ({ companyName, registrationNumber, industryType }) => {
    const e = {};
    if (!companyName?.trim())        e.companyName        = 'Company name is required';
    if (!registrationNumber?.trim()) e.registrationNumber = 'Registration number is required';
    if (!industryType)               e.industryType       = 'Please select an industry type';
    return e;
  },
  // Step 2 (CardDetails) is UI-only — no API validation needed
  3: ({ primaryContactName, workEmail, phoneNumber, password, confirmPassword, headOfficeAddress }) => {
    const e = {};
    if (!primaryContactName?.trim()) e.primaryContactName = 'Primary contact name is required';
    if (!workEmail?.trim())          e.workEmail          = 'Work email is required';
    else if (!/\S+@\S+\.\S+/.test(workEmail)) e.workEmail = 'Enter a valid email';
    if (!phoneNumber?.trim())        e.phoneNumber        = 'Phone number is required';
    if (!password)                   e.password           = 'Password is required';
    else if (password.length < 8)    e.password           = 'Password must be at least 8 characters';
    if (password !== confirmPassword) e.confirmPassword   = 'Passwords do not match';
    if (!headOfficeAddress?.trim())  e.headOfficeAddress  = 'Head office address is required';
    return e;
  },
  4: ({ companyDocuments, insuranceCertificate }) => {
    const e = {};
    if (!companyDocuments)     e.companyDocuments     = 'Company document is required';
    if (!insuranceCertificate) e.insuranceCertificate = 'Insurance certificate is required';
    return e;
  },
};

// ── Async thunk ────────────────────────────────────────────────────────────────
export const submitCompanySignup = createAsyncThunk(
  'companySignup/submit',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await companySignupApi(formData);
      console.log('data', data);
      return data?.data ?? data;
    } catch (error) {
      console.log('error', error);
      // Map API field-level validation errors so the UI can show them per-field
      const validationErrors = getValidationErrors(error);
      const fieldErrors = {};
      validationErrors.forEach(({ field, message }) => { fieldErrors[field] = message; });
      return rejectWithValue({ message: getErrorMessage(error), fieldErrors });
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────────
const companySignupSlice = createSlice({
  name: 'companySignup',
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
      .addCase(submitCompanySignup.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(submitCompanySignup.fulfilled, (state) => {
        state.loading   = false;
        state.submitted = true;
      })
      .addCase(submitCompanySignup.rejected, (state, { payload }) => {
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
} = companySignupSlice.actions;

export default companySignupSlice.reducer;
