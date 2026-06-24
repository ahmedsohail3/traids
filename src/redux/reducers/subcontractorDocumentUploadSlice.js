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

const DOCUMENT_TYPES = ['insurance', 'ticket', 'certification'];

const makeEntry = () => ({
  uploading:   false,
  error:       null,
  documentUrl: null,
  expiresAt:   null,
});

const initialState = Object.fromEntries(DOCUMENT_TYPES.map((t) => [t, makeEntry()]));

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
      state[documentType] = makeEntry();
    },
    resetAllDocumentUploads: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadSubcontractorDocument.pending, (state, { meta }) => {
        const t = meta.arg.documentType;
        state[t].uploading   = true;
        state[t].error       = null;
        state[t].documentUrl = null;
        state[t].expiresAt   = null;
      })
      .addCase(uploadSubcontractorDocument.fulfilled, (state, { payload }) => {
        const t = payload.documentType;
        state[t].uploading   = false;
        state[t].documentUrl = payload.url;
        state[t].expiresAt   = payload.expiresAt;
      })
      .addCase(uploadSubcontractorDocument.rejected, (state, { payload }) => {
        const t = payload?.documentType;
        if (t) {
          state[t].uploading = false;
          state[t].error     = payload.message ?? 'Upload failed.';
        }
      });
  },
});

export const { clearDocumentUpload, resetAllDocumentUploads } =
  subcontractorDocumentUploadSlice.actions;

export default subcontractorDocumentUploadSlice.reducer;
