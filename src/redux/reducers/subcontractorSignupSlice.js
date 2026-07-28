import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  subcontractorSignupApi,
  validateSubcontractorEmailApi,
} from '~services/subcontractorSignupService';
import { getErrorMessage, getValidationErrors, getInvalidValidationFields } from '~utils';

// ── Initial form state (mirrors API field names) ───────────────────────────────

export const INITIAL_FORM_DATA = {
  // Step 1 — Personal Details
  fullName:               '',
  email:                  '',
  password:               '',
  confirmPassword:        '',   // validation only, stripped before API call
  primaryTrade:           '',
  yearsOfExperience:      '',
  hourlyRate:             '',
  postcode:               '',
  cityLocation:           '',
  // Step 2 — Qualifications (files: { uri, type, name } for UI; URLs sent to signup API)
  insuranceDocuments:     null,   // file object — display only
  insuranceDocumentUrl:   null,   // S3 URL from upload-document API
  insuranceExpiresAt:     '',     // DD/MM/YYYY, converted to ISO in form builder
  ticketDocuments:        null,
  ticketDocumentUrl:      null,
  ticketExpiresAt:        '',
  certificationDocuments: null,
  certificationDocumentUrl: null,
  certificationExpiresAt: '',
  // Step 3 — Profile Setup
  profileImage:           null,
  professionalBio:        '',
  workExamples:           null,
};

// ── Which fields belong to which step ──────────────────────────────────────────
// Used to route server-side field errors back to the screen that owns the field.

export const STEP_FIELDS = {
  1: ['fullName', 'email', 'password', 'confirmPassword', 'primaryTrade', 'yearsOfExperience', 'hourlyRate', 'postcode', 'cityLocation'],
  2: ['insuranceDocuments', 'insuranceExpiresAt', 'ticketDocuments', 'ticketExpiresAt', 'certificationDocuments', 'certificationExpiresAt'],
  3: ['profileImage', 'professionalBio', 'workExamples'],
};

// ── Per-step validation rules ──────────────────────────────────────────────────

export const STEP_VALIDATORS = {
  1: ({ fullName, email, password, confirmPassword, primaryTrade, hourlyRate, postcode, cityLocation }) => {
    const e = {};
    if (!fullName?.trim())     e.fullName     = 'Full name is required';
    if (!email?.trim())        e.email        = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password)             e.password     = 'Password is required';
    else if (password.length < 8) e.password  = 'Password must be at least 8 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!primaryTrade)         e.primaryTrade = 'Please select a primary trade';
    if (!hourlyRate?.trim())   e.hourlyRate   = 'Hourly rate is required';
    if (!postcode?.trim())     e.postcode     = 'Postcode is required';
    if (!cityLocation?.trim()) e.cityLocation = 'City / Location is required';
    return e;
  },
  // Step 2 — documents are optional; no required validation
  // Step 3 — profile image, bio and work examples are optional; no required validation
};

// ── Async thunks ───────────────────────────────────────────────────────────────

/**
 * Checks the email against the server before letting the user leave step 1.
 * Resolves with the validated email; rejects with a message to show under the field.
 */
export const validateSubcontractorEmail = createAsyncThunk(
  'subcontractorSignup/validateEmail',
  async (email, { rejectWithValue }) => {
    try {
      const data = await validateSubcontractorEmailApi(email);
      // A taken email comes back as a 200 with { data: { email: { valid: false, message } } }
      const invalid = getInvalidValidationFields(data);
      if (Object.keys(invalid).length) {
        return rejectWithValue(invalid.email ?? Object.values(invalid)[0]);
      }
      return email;
    } catch (error) {
      const emailError = getValidationErrors(error).find(({ field }) => field === 'email');
      return rejectWithValue(emailError?.message ?? getErrorMessage(error));
    }
  },
);

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
    formData:        { ...INITIAL_FORM_DATA },
    errors:          {},
    loading:         false,
    error:           null,
    submitted:       false,
    validatingEmail: false,
    validatedEmail:  null,   // last email confirmed available — skips repeat calls
  },
  reducers: {
    updateFormField: (state, { payload: { field, value } }) => {
      state.formData[field] = value;
      // Editing the email invalidates any previous server check
      if (field === 'email') state.validatedEmail = null;
    },
    setStepErrors: (state, { payload }) => {
      state.errors = { ...state.errors, ...payload };
    },
    clearFieldError: (state, { payload: field }) => {
      delete state.errors[field];
    },
    resetSignup: () => ({
      formData:        { ...INITIAL_FORM_DATA },
      errors:          {},
      loading:         false,
      error:           null,
      submitted:       false,
      validatingEmail: false,
      validatedEmail:  null,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateSubcontractorEmail.pending, (state) => {
        state.validatingEmail = true;
        delete state.errors.email;
      })
      .addCase(validateSubcontractorEmail.fulfilled, (state, { payload }) => {
        state.validatingEmail = false;
        state.validatedEmail  = payload;
      })
      .addCase(validateSubcontractorEmail.rejected, (state, { payload }) => {
        state.validatingEmail = false;
        state.validatedEmail  = null;
        state.errors.email    = payload ?? 'Could not verify this email. Please try again.';
      })
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
