import api from './api';

export const getConversations = async () => {
  const res = await api.get('/conversations');
  return res.data;
};

export const accessConversation = async (userId) => {
  const res = await api.post('/conversations', { participantId: userId });
  return res.data;
};

export const createGroup = async (data) => {
  const res = await api.post('/conversations/group', data);
  return res.data;
};

export const updateGroup = async (id, data) => {
  const res = await api.put(`/conversations/group/${id}`, data);
  return res.data;
};

export const addToGroup = async (id, userId) => {
  const res = await api.put(`/conversations/group/${id}/add`, { userId });
  return res.data;
};

export const removeFromGroup = async (id, userId) => {
  const res = await api.put(`/conversations/group/${id}/remove/${userId}`);
  return res.data;
};