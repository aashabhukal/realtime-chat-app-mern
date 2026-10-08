import api from "./api";

export const getUsers = async (search = "") => {
  const res = await api.get(
    `/users${search ? `?search=${encodeURIComponent(search)}` : ""}`
  );
  return res.data;
};

export const getUserById = async (id) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put("/users/profile", data);
  return res.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await api.post("/users/avatar", formData);
  return res.data;
};

// --- FRIENDS - FINAL FIX ---
export const sendFriendRequest = async (userId) => {
  const res = await api.post(`/users/friends/request/${userId}`);
  return res.data;
};

export const acceptFriendRequest = async (userId) => {
  const res = await api.post(`/users/friends/accept/${userId}`);
  return res.data;
};

export const rejectFriendRequest = async (userId) => {
  const res = await api.post(`/users/friends/reject/${userId}`);
  return res.data;
};

export const getFriends = async () => {
  const res = await api.get("/users/friends/list");
  return res.data;
};

export const removeFriend = async (userId) => {
  const res = await api.delete(`/users/friends/${userId}`);
  return res.data;
};

export const blockUser = async (userId) => {
  const res = await api.post(`/users/block/${userId}`);
  return res.data;
};

export const unblockUser = async (userId) => {
  const res = await api.delete(`/users/block/${userId}`);
  return res.data;
};