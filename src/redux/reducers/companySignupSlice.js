import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { companySignupApi, validateCompanyFieldsApi } from '~services/companySignupService';
import { getErrorMessage, getValidationErrors, getInvalidValidationFields } from '~utils';

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

// ── Which fields belong to which step ──────────────────────────────────────────
// Used to route server-side field errors back to the screen that owns the field.
export const STEP_FIELDS = {
  1: ['companyName', 'registrationNumber', 'vatNumber', 'industryType'],
  3: ['primaryContactName', 'workEmail', 'phoneNumber', 'password', 'confirmPassword', 'headOfficeAddress'],
  4: ['companyDocuments', 'insuranceCertificate', 'healthAndSafetyPolicy'],
};

// ── Fields each step asks the server to check for duplicates ───────────────────
export const STEP_VALIDATE_FIELDS = {
  1: ['registrationNumber'],
  3: ['workEmail', 'phoneNumber'],
};

// ── Async thunks ───────────────────────────────────────────────────────────────

/**
 * Checks the given fields against the server before the user leaves a step.
 * Resolves with the checked { field: value } map; rejects with per-field messages.
 */
export const validateCompanyFields = createAsyncThunk(
  'companySignup/validateFields',
  async (fields, { rejectWithValue }) => {
    const fieldNames = Object.keys(fields);
    try {
      const data = await validateCompanyFieldsApi(fields);
      // Taken values come back as a 200 with { data: { <field>: { valid: false, message } } }
      const invalid = getInvalidValidationFields(data);
      const messages = Object.entries(invalid);
      if (messages.length) {
        const fieldErrors = {};
        messages.forEach(([field, message]) => {
          // Pin anything the form doesn't own onto the first field being checked
          fieldErrors[fieldNames.includes(field) ? field : fieldNames[0]] = message;
        });
        return rejectWithValue(fieldErrors);
      }
      return fields;
    } catch (error) {
      const fieldErrors = {};
      getValidationErrors(error).forEach(({ field, message }) => {
        if (fieldNames.includes(field)) fieldErrors[field] = message;
      });
      // Fall back to pinning a general message on the first field being checked
      if (!Object.keys(fieldErrors).length) fieldErrors[fieldNames[0]] = getErrorMessage(error);
      return rejectWithValue(fieldErrors);
    }
  },
);

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
    formData:   { ...INITIAL_FORM_DATA },
    errors:     {},
    loading:    false,
    error:      null,
    submitted:  false,
    validating: false,
    validated:  {},   // field → last value the server confirmed as free
    // Card tokenised at step 2 (publishable key only) and confirmed against a
    // SetupIntent at the end, once the company account actually exists
    paymentMethodId: null,
    cardPreview:     null,   // { brand, last4 } for display
  },
  reducers: {
    updateFormField: (state, { payload: { field, value } }) => {
      state.formData[field] = value;
      // Editing a checked field invalidates its previous server check
      if (field in state.validated) delete state.validated[field];
    },
    setStepErrors: (state, { payload }) => {
      state.errors = { ...state.errors, ...payload };
    },
    clearFieldError: (state, { payload: field }) => {
      delete state.errors[field];
    },
    resetSignup: () => ({
      formData:   { ...INITIAL_FORM_DATA },
      errors:     {},
      loading:    false,
      error:      null,
      submitted:  false,
      validating: false,
      validated:  {},
      paymentMethodId: null,
      cardPreview:     null,
    }),
    // Stripe returns a pm_… id — a plain string, so it survives navigation and
    // unmounting in a way the native CardField's contents never could
    setPaymentMethod: (state, { payload }) => {
      state.paymentMethodId = payload?.id ?? null;
      state.cardPreview     = payload?.brand
        ? { brand: payload.brand, last4: payload.last4 }
        : null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateCompanyFields.pending, (state, { meta }) => {
        state.validating = true;
        Object.keys(meta.arg).forEach((field) => { delete state.errors[field]; });
      })
      .addCase(validateCompanyFields.fulfilled, (state, { payload }) => {
        state.validating = false;
        state.validated  = { ...state.validated, ...payload };
      })
      .addCase(validateCompanyFields.rejected, (state, { payload, meta }) => {
        state.validating = false;
        Object.keys(meta.arg).forEach((field) => { delete state.validated[field]; });
        state.errors = { ...state.errors, ...payload };
      })
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
  setPaymentMethod,
  setStepErrors,
  clearFieldError,
  resetSignup,
} = companySignupSlice.actions;

export default companySignupSlice.reducer;
