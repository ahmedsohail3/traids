import axiosInstance from '~utils/axiosInstance';

export const getMyJobTimesheetApi = (jobId, weekNumber = 1) =>
  axiosInstance
    .get(`/timesheets/my/job/${jobId}`, { params: { weekNumber } })
    .then((r) => r.data);

export const logTimesheetHoursApi = ({ jobId, date, checkIn, checkOut }) =>
  axiosInstance
    .post('/timesheets/log', { jobId, date, checkIn, checkOut })
    .then((r) => r.data);

export const submitTimesheetApi = (timesheetId) =>
  axiosInstance
    .post(`/timesheets/${timesheetId}/submit`)
    .then((r) => r.data);
