import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMyJobTimesheetApi, logTimesheetHoursApi, submitTimesheetApi } from '~services/subcontractorTimesheetService';
import { getErrorMessage } from '~utils';

export const fetchMyJobTimesheet = createAsyncThunk(
  'subcontractorTimesheet/fetchMyJobTimesheet',
  async ({ jobId, weekNumber }, { rejectWithValue }) => {
    try {
      const res = await getMyJobTimesheetApi(jobId, weekNumber);
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const logTimesheetHours = createAsyncThunk(
  'subcontractorTimesheet/logTimesheetHours',
  async ({ jobId, date, checkIn, checkOut }, { rejectWithValue }) => {
    try {
      const res = await logTimesheetHoursApi({ jobId, date, checkIn, checkOut });
      return res.data ?? res;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const submitTimesheet = createAsyncThunk(
  'subcontractorTimesheet/submitTimesheet',
  async (timesheetId, { rejectWithValue }) => {
    try {
      const res = await submitTimesheetApi(timesheetId);
      return { data: res.data ?? res, message: res.message ?? null };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const subcontractorTimesheetSlice = createSlice({
  name: 'subcontractorTimesheet',
  initialState: {
    timesheets: [],   // entries for the selected job + week (API returns an array; usually 0 or 1)
    loading:    false,
    error:      null,
    logging:    false,
    logError:   null,
    submitting:      false,
    submitError:     null,
    submitMessage:   null,
  },
  reducers: {
    clearMyJobTimesheet: (state) => {
      state.timesheets = [];
      state.error      = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyJobTimesheet.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchMyJobTimesheet.fulfilled, (state, { payload }) => {
        state.loading    = false;
        state.timesheets = payload;
      })
      .addCase(fetchMyJobTimesheet.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload ?? 'Failed to load timesheet.';
      })
      .addCase(logTimesheetHours.pending, (state) => {
        state.logging  = true;
        state.logError = null;
      })
      .addCase(logTimesheetHours.fulfilled, (state) => {
        state.logging = false;
      })
      .addCase(logTimesheetHours.rejected, (state, { payload }) => {
        state.logging  = false;
        state.logError = payload ?? 'Failed to log hours.';
      })
      .addCase(submitTimesheet.pending, (state) => {
        state.submitting    = true;
        state.submitError   = null;
        state.submitMessage = null;
      })
      .addCase(submitTimesheet.fulfilled, (state, { payload }) => {
        state.submitting    = false;
        state.submitMessage = payload.message;
        const data = payload.data;
        if (data?._id && state.timesheets[0]?._id === data._id) {
          state.timesheets[0] = data;
        }
      })
      .addCase(submitTimesheet.rejected, (state, { payload }) => {
        state.submitting  = false;
        state.submitError = payload ?? 'Failed to submit timesheet.';
      });
  },
});

export const { clearMyJobTimesheet } = subcontractorTimesheetSlice.actions;
export default subcontractorTimesheetSlice.reducer;
