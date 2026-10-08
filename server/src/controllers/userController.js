// src/controllers/userController.js
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as userService from '../services/userService.js';

/* =================================================================== */
/*                           BASIC USER CRUD                           */
/* =================================================================== */

// GET /api/users
export const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getUsers(req.user._id, req.query.search);
  res.json(new ApiResponse(200, users, 'Users fetched'));
});

// GET /api/users/:id
export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json(new ApiResponse(200, user, 'User fetched'));
});

// PUT /api/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateUserProfile(req.user._id, req.body);
  res.json(new ApiResponse(200, user, 'Profile updated'));
});

// POST /api/users/avatar
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(new ApiResponse(400, null, 'No file uploaded'));
  }
  const url = `/uploads/${req.file.filename}`;
  const user = await userService.updateUserProfile(req.user._id, {
    avatar: url,
  });
  res.json(new ApiResponse(200, user, 'Avatar uploaded'));
});

/* =================================================================== */
/*                          FRIEND REQUESTS                            */
/* =================================================================== */

// POST /api/users/friends/request/:userId
export const sendFriendRequest = asyncHandler(async (req, res) => {
  const result = await userService.sendFriendRequest(
    req.user._id,
    req.params.userId
  );
  res.json(new ApiResponse(200, result, 'Friend request sent'));
});

// POST /api/users/friends/accept/:userId
export const acceptFriendRequest = asyncHandler(async (req, res) => {
  const result = await userService.acceptFriendRequest(
    req.user._id,
    req.params.userId
  );
  res.json(new ApiResponse(200, result, 'Friend request accepted'));
});

// POST /api/users/friends/reject/:userId
export const rejectFriendRequest = asyncHandler(async (req, res) => {
  const result = await userService.rejectFriendRequest(
    req.user._id,
    req.params.userId
  );
  res.json(new ApiResponse(200, result, 'Friend request rejected'));
});

// DELETE /api/users/friends/:userId
export const removeFriend = asyncHandler(async (req, res) => {
  const result = await userService.removeFriend(
    req.user._id,
    req.params.userId
  );
  res.json(new ApiResponse(200, result, 'Friend removed'));
});

// GET /api/users/friends/list
export const getFriends = asyncHandler(async (req, res) => {
  const friends = await userService.getFriends(req.user._id);
  res.json(new ApiResponse(200, friends, 'Friends fetched'));
});

/* =================================================================== */
/*                          BLOCK / UNBLOCK                            */
/* =================================================================== */

// POST /api/users/block/:userId
export const blockUser = asyncHandler(async (req, res) => {
  const result = await userService.blockUser(req.user._id, req.params.userId);
  res.json(new ApiResponse(200, result, 'User blocked'));
});

// DELETE /api/users/block/:userId
export const unblockUser = asyncHandler(async (req, res) => {
  const result = await userService.unblockUser(req.user._id, req.params.userId);
  res.json(new ApiResponse(200, result, 'User unblocked'));
});

// GET /api/users/blocked/list
export const getBlockedUsers = asyncHandler(async (req, res) => {
  const users = await userService.getBlockedUsers(req.user._id);
  res.json(new ApiResponse(200, users, 'Blocked users fetched'));
});

/* =================================================================== */
/*                          STATUS UPDATE                              */
/* =================================================================== */

// PUT /api/users/status
export const updateStatus = asyncHandler(async (req, res) => {
  const user = await userService.updateUserProfile(req.user._id, {
    status: req.body.status,
  });
  res.json(new ApiResponse(200, user, 'Status updated'));
});