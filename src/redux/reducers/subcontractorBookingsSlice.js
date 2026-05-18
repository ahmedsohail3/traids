import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBookingsApi } from '~services/subcontractorBookingsService';
import { getErrorMessage } from '~utils';

// ── Shared thunk factory ───────────────────────────────────────────────────────

const makeBookingThunk = (typePrefix, apiFn) =>
  createAsyncThunk(typePrefix, async (arg, { rejectWithValue }) => {
    try {
      const data = await apiFn(arg);
      return data?.data ?? data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  });

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchBookings = makeBookingThunk(
  'subcontractorBookings/fetchBookings',
  getBookingsApi,
);

// Future thunks plug in here:
// export const fetchBookingDetails = makeBookingThunk('subcontractorBookings/fetchDetails', getBookingDetailsApi);
// export const acceptBooking       = makeBookingThunk('subcontractorBookings/accept',       acceptBookingApi);
// export const rejectBooking       = makeBookingThunk('subcontractorBookings/reject',       rejectBookingApi);

// ── State shape ────────────────────────────────────────────────────────────────
// Mirrors the API response: { offers, pending, inProgress, completed }

const bookingsData = () => ({
  offers:     [],
  pending:    [],
  inProgress: [],
  completed:  [],
});

const bookingsState = () => ({ data: bookingsData(), loading: false, error: null });

// ── Shared case builder ────────────────────────────────────────────────────────

const addBookingCases = (builder, thunk, key) => {
  builder
    .addCase(thunk.pending, (state) => {
      state[key].loading = true;
      state[key].error   = null;
    })
    .addCase(thunk.fulfilled, (state, { payload }) => {
      state[key].loading      = false;
      state[key].data.offers     = payload?.offers     ?? [];
      state[key].data.pending    = payload?.pending    ?? [];
      state[key].data.inProgress = payload?.inProgress ?? [];
      state[key].data.completed  = payload?.completed  ?? [];
    })
    .addCase(thunk.rejected, (state, { payload }) => {
      state[key].loading = false;
      state[key].error   = payload ?? 'Failed to load bookings.';
    });
};

// ── Slice ──────────────────────────────────────────────────────────────────────

const subcontractorBookingsSlice = createSlice({
  name: 'subcontractorBookings',
  initialState: {
    bookings: bookingsState(),
    // Future sub-states slot in here:
    // bookingDetails: { data: null, loading: false, error: null },
    // bookingHistory: bookingsState(),
  },
  reducers: {
    clearBookings: (state) => { state.bookings = bookingsState(); },
    clearAllBookings: () => ({ bookings: bookingsState() }),
  },
  extraReducers: (builder) => {
    addBookingCases(builder, fetchBookings, 'bookings');
    // Future:
    // addBookingCases(builder, fetchBookingHistory, 'bookingHistory');
  },
});

export const { clearBookings, clearAllBookings } = subcontractorBookingsSlice.actions;
export default subcontractorBookingsSlice.reducer;
