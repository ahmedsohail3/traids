import axiosInstance from '~utils/axiosInstance';

export const getJobTimesheetsApi = (jobId) =>
  axiosInstance.get(`/timesheets/company/job/${jobId}`).then((r) => r.data);

export const approveTimesheetApi = (timesheetId) =>
  axiosInstance.post(`/timesheets/${timesheetId}/approve`).then((r) => r.data);
