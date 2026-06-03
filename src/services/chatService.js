import axiosInstance from '~utils/axiosInstance';

export const getConversationsApi = () =>
  axiosInstance.get('/chat/conversations').then((r) => r.data);

export const getMessagesApi = (chatId, limit = 50, skip = 0) =>
  axiosInstance
    .get(`/chat/messages/${chatId}`, { params: { limit, skip } })
    .then((r) => r.data);

export const markConversationAsReadApi = (chatId) =>
  axiosInstance.post(`/chat/read/${chatId}`).then((r) => r.data);

export const sendMessageApi = (formData) =>
  axiosInstance
    .post('/chat/send', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);
