import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getJobTimesheetsApi, approveTimesheetApi } from '~services/companyTimesheetService';
import { getErrorMessage } from '~utils';

export const fetchJobTimesheets = createAsyncThunk(
  'companyTimesheet/fetchJobTimesheets',
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await getJobTimesheetsApi(jobId);
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const approveTimesheet = createAsyncThunk(
  'companyTimesheet/approveTimesheet',
  async (timesheetId, { rejectWithValue }) => {
    try {
      await approveTimesheetApi(timesheetId);
      return timesheetId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const companyTimesheetSlice = createSlice({
  name: 'companyTimesheet',
  initialState: {
    jobTimesheets:      [],
    loading:            false,
    error:              null,
    approvingTimesheet: false,
    approveError:       null,
  },
  reducers: {
    clearJobTimesheets: (state) => {
      state.jobTimesheets = [];
      state.error         = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobTimesheets.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchJobTimesheets.fulfilled, (state, { payload }) => {
        state.loading       = false;
        state.jobTimesheets = payload;
      })
      .addCase(fetchJobTimesheets.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload ?? 'Failed to load timesheets.';
      })
      .addCase(approveTimesheet.pending, (state) => {
        state.approvingTimesheet = true;
        state.approveError       = null;
      })
      .addCase(approveTimesheet.fulfilled, (state, { payload: timesheetId }) => {
        state.approvingTimesheet = false;
        const ts = state.jobTimesheets.find((t) => t._id === timesheetId);
        if (ts) ts.status = 'approved';
      })
      .addCase(approveTimesheet.rejected, (state, { payload }) => {
        state.approvingTimesheet = false;
        state.approveError       = payload ?? 'Failed to approve timesheet.';
      });
  },
});

export const { clearJobTimesheets } = companyTimesheetSlice.actions;
export default companyTimesheetSlice.reducer;
