import axiosInstance from '~utils/axiosInstance';

// ── Active Bookings ────────────────────────────────────────────────────────────

export const getBookingsApi = () =>
  axiosInstance.get('/subcontractor/bookings').then((r) => r.data);

// ── Future endpoints (add here as the module grows) ───────────────────────────
// export const getBookingDetailsApi  = (id)     => axiosInstance.get(`/subcontractor/bookings/${id}`).then((r) => r.data);
// export const acceptBookingApi      = (id)     => axiosInstance.post(`/subcontractor/bookings/${id}/accept`).then((r) => r.data);
// export const rejectBookingApi      = (id)     => axiosInstance.post(`/subcontractor/bookings/${id}/reject`).then((r) => r.data);
// export const cancelBookingApi      = (id)     => axiosInstance.post(`/subcontractor/bookings/${id}/cancel`).then((r) => r.data);
// export const getBookingHistoryApi  = ()       => axiosInstance.get('/subcontractor/bookings/history').then((r) => r.data);
