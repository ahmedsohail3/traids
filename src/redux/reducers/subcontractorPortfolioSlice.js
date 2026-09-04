import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getPortfolioApi,
  getPortfolioItemApi,
  createPortfolioItemApi,
  deletePortfolioItemApi,
} from '~services/subcontractorPortfolioService';
import { getErrorMessage } from '~utils';

// ── Normalisers ───────────────────────────────────────────────────────────────

// Photos arrive either as bare URLs or as objects; every screen wants URLs.
const toUrls = (value) =>
  (Array.isArray(value) ? value : value ? [value] : [])
    .map((p) => (typeof p === 'string' ? p : p?.url ?? p?.uri ?? p?.image ?? null))
    .filter(Boolean);

// One shape for the list card and the detail screen, so the card can seed the
// detail screen while its own request is still in flight.
const mapItem = (raw = {}) => ({
  id:             raw._id ?? raw.id ?? null,
  title:          raw.title ?? raw.projectTitle ?? '',
  specialty:      raw.specialty ?? raw.specialtyCategory ?? '',
  workType:       raw.workType ?? '',
  overview:       raw.overview ?? raw.briefOverview ?? '',
  description:    raw.description ?? raw.detailedDescription ?? '',
  clientName:     raw.clientName ?? raw.client ?? '',
  location:       raw.location ?? '',
  duration:       raw.duration ?? '',
  costRange:      raw.costRange ?? raw.cost ?? '',
  completionDate: raw.completionDate ?? raw.completedAt ?? null,
  compliance:     raw.complianceStatus ?? raw.compliance ?? '',
  rating:         raw.rating ?? null,
  verified:       raw.verified === true,
  status:         raw.status ?? 'submitted',
  photos:         toUrls(raw.photos ?? raw.gallery ?? raw.images),
  review:         raw.review ?? null,
});

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchPortfolio = createAsyncThunk(
  'subcontractorPortfolio/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getPortfolioApi();
      const list = res?.data ?? res?.portfolio ?? res;
      return (Array.isArray(list) ? list : []).map(mapItem);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchPortfolioItem = createAsyncThunk(
  'subcontractorPortfolio/fetchOne',
  async (portfolioId, { rejectWithValue }) => {
    try {
      const res = await getPortfolioItemApi(portfolioId);
      return mapItem(res?.data ?? res?.portfolio ?? res);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createPortfolioItem = createAsyncThunk(
  'subcontractorPortfolio/create',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await createPortfolioItemApi(formData);
      return mapItem(res?.data ?? res?.portfolio ?? res);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deletePortfolioItem = createAsyncThunk(
  'subcontractorPortfolio/delete',
  async (portfolioId, { rejectWithValue }) => {
    try {
      await deletePortfolioItemApi(portfolioId);
      return portfolioId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  items: [],
  loading: false,
  error: null,

  selected: null,
  selectedLoading: false,
  selectedError: null,

  creating: false,
  createError: null,

  deletingId: null,
  deleteError: null,
};

const subcontractorPortfolioSlice = createSlice({
  name: 'subcontractorPortfolio',
  initialState,
  reducers: {
    // Lets the detail screen paint from the list row it was opened from
    // instead of showing a blank card while its own request runs.
    seedSelected: (state, action) => {
      state.selected = action.payload ?? null;
      state.selectedError = null;
    },
    clearSelected: (state) => {
      state.selected = null;
      state.selectedError = null;
    },
    clearPortfolioErrors: (state) => {
      state.error = null;
      state.selectedError = null;
      state.createError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load your portfolio.';
      })

      .addCase(fetchPortfolioItem.pending, (state) => {
        state.selectedLoading = true;
        state.selectedError = null;
      })
      .addCase(fetchPortfolioItem.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchPortfolioItem.rejected, (state, action) => {
        state.selectedLoading = false;
        state.selectedError = action.payload ?? 'Failed to load this project.';
      })

      .addCase(createPortfolioItem.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createPortfolioItem.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload?.id) state.items.unshift(action.payload);
      })
      .addCase(createPortfolioItem.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload ?? 'Failed to upload this project.';
      })

      .addCase(deletePortfolioItem.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.deleteError = null;
      })
      .addCase(deletePortfolioItem.fulfilled, (state, action) => {
        state.deletingId = null;
        state.items = state.items.filter((i) => i.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      })
      .addCase(deletePortfolioItem.rejected, (state, action) => {
        state.deletingId = null;
        state.deleteError = action.payload ?? 'Failed to remove this project.';
      });
  },
});

export const { seedSelected, clearSelected, clearPortfolioErrors } =
  subcontractorPortfolioSlice.actions;
export default subcontractorPortfolioSlice.reducer;
