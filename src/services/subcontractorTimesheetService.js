import axiosInstance from '~utils/axiosInstance';

export const getMyJobTimesheetApi = (jobId, weekNumber = 1) =>
  axiosInstance
    .get(`/timesheets/my/job/${jobId}`, { params: { weekNumber } })
    .then((r) => r.data);

// `date` is a local calendar date ("2026-08-12") — no time, no Z. It is the sole
// source of truth for both the day and the week the log belongs to.
//
// `weekNumber` is deprecated: the new backend derives it from `date` and ignores
// what we send. It stays until that backend is deployed everywhere, because the
// old one falls back to a creation counter when the field is absent, which
// diverges from the calendar as soon as a week is skipped.
export const logTimesheetHoursApi = ({ jobId, date, checkIn, checkOut, weekNumber }) =>
  axiosInstance
    .post('/timesheets/log', { jobId, date, checkIn, checkOut, weekNumber })
    .then((r) => r.data);

export const submitTimesheetApi = (timesheetId) =>
  axiosInstance
    .post(`/timesheets/${timesheetId}/submit`)
    .then((r) => r.data);
