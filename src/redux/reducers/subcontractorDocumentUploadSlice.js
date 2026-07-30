import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { uploadSubcontractorDocumentApi } from '~services/subcontractorSignupService';
import { getErrorMessage } from '~utils';

// The server wraps Claude AI errors as: "400 {\"type\":\"error\",\"error\":{...}}"
// Parse and translate them into a readable message.
const parseUploadError = (error) => {
  const raw = getErrorMessage(error);
  try {
    const jsonStart = raw.indexOf('{');
    if (jsonStart !== -1) {
      const parsed    = JSON.parse(raw.slice(jsonStart));
      const innerMsg  = parsed?.error?.message ?? '';
      if (innerMsg.includes('media_type') || innerMsg.includes('image/')) {
        return 'Please upload an image file (JPG, PNG, or WEBP). PDF files are not supported for automatic expiry extraction.';
      }
      if (innerMsg) return innerMsg;
    }
  } catch {}
  return raw;
};

// Also the `documentType` values POST /subcontractor/upload-document accepts.
const DOCUMENT_TYPES = ['insurance', 'tickets', 'certification'];

const makeEntry = () => ({
  uploading:   false,
  error:       null,
  documentUrl: null,
  expiresAt:   null,
});

const initialState = Object.fromEntries(DOCUMENT_TYPES.map((t) => [t, makeEntry()]));

// Returns the draft entry for a document type, creating it if the slice predates
// it. Without this, a state shape left over from a Fast Refresh — or a renamed
// document type — makes the reducers throw on `state[t].uploading`.
const entryFor = (state, documentType) => {
  if (!documentType) return null;
  if (!state[documentType]) state[documentType] = makeEntry();
  return state[documentType];
};

// ── Async Thunk ────────────────────────────────────────────────────────────────

export const uploadSubcontractorDocument = createAsyncThunk(
  'subcontractorDocumentUpload/upload',
  async ({ documentType, file }, { rejectWithValue }) => {
    try {
      const res = await uploadSubcontractorDocumentApi(documentType, file);
      return {
        documentType,
        url:       res.url       ?? null,
        expiresAt: res.expiresAt ?? null,
      };
    } catch (error) {
      return rejectWithValue({ documentType, message: parseUploadError(error) });
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const subcontractorDocumentUploadSlice = createSlice({
  name: 'subcontractorDocumentUpload',
  initialState,
  reducers: {
    clearDocumentUpload: (state, { payload: documentType }) => {
      if (documentType) state[documentType] = makeEntry();
    },
    resetAllDocumentUploads: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadSubcontractorDocument.pending, (state, { meta }) => {
        const entry = entryFor(state, meta.arg.documentType);
        if (!entry) return;
        entry.uploading   = true;
        entry.error       = null;
        entry.documentUrl = null;
        entry.expiresAt   = null;
      })
      .addCase(uploadSubcontractorDocument.fulfilled, (state, { payload }) => {
        const entry = entryFor(state, payload.documentType);
        if (!entry) return;
        entry.uploading   = false;
        entry.documentUrl = payload.url;
        entry.expiresAt   = payload.expiresAt;
      })
      .addCase(uploadSubcontractorDocument.rejected, (state, { payload }) => {
        const entry = entryFor(state, payload?.documentType);
        if (!entry) return;
        entry.uploading = false;
        entry.error     = payload.message ?? 'Upload failed.';
      });
  },
});

export const { clearDocumentUpload, resetAllDocumentUploads } =
  subcontractorDocumentUploadSlice.actions;

export default subcontractorDocumentUploadSlice.reducer;
