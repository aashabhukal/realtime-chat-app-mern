// src/services/messageService.js
import api from './api';

export const sendMessage = async (data) => {
  const res = await api.post('/messages', data);
  return res.data;
};

export const getMessages = async (conversationId, page = 1, limit = 30) => {
  const res = await api.get(
    `/messages/${conversationId}?page=${page}&limit=${limit}`
  );
  return res.data;
};

export const markAsRead = async (conversationId) => {
  const res = await api.put(`/messages/${conversationId}/read`);
  return res.data;
};

export const deleteMessage = async (messageId) => {
  const res = await api.delete(`/messages/${messageId}`);
  return res.data;
};

export const uploadAttachment = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/messages/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};