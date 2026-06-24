import axiosInstance from '~utils/axiosInstance';

export const getNotificationsApi = () =>
  axiosInstance.get('/notifications').then((r) => r.data);

export const markNotificationAsReadApi = (notificationId) =>
  axiosInstance.put(`/notifications/${notificationId}/read`).then((r) => r.data);

export const markAllNotificationsAsReadApi = () =>
  axiosInstance.put('/notifications/read-all').then((r) => r.data);
