// src/services/userService.js (complete updated file)
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

/* ------------------------- BASIC ------------------------- */

export const getUsers = async (currentUserId, search = '') => {
  const query = { _id: { $ne: currentUserId } };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  return User.find(query).select('-password').sort({ name: 1 });
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

export const updateUserProfile = async (userId, updates) => {
  const allowed = ['name', 'bio', 'avatar', 'status'];
  const filtered = {};
  for (const k of allowed) {
    if (updates[k] !== undefined) filtered[k] = updates[k];
  }
  const user = await User.findByIdAndUpdate(userId, filtered, {
    new: true,
    runValidators: true,
  }).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

/* ------------------------- FRIEND REQUESTS ------------------------- */

export const sendFriendRequest = async (userId, targetId) => {
  if (userId.toString() === targetId.toString()) {
    throw new ApiError(400, 'Cannot send request to yourself');
  }

  const [user, target] = await Promise.all([
    User.findById(userId),
    User.findById(targetId),
  ]);
  if (!target) throw new ApiError(404, 'User not found');

  // Block checks
  if (user.hasBlocked(targetId)) throw new ApiError(403, 'You blocked this user');
  if (user.isBlockedBy(targetId)) throw new ApiError(403, 'You are blocked');

  // Already friends?
  if (user.isFriend(targetId)) throw new ApiError(400, 'Already friends');
  if (user.hasSentRequest(targetId)) throw new ApiError(400, 'Request already sent');

  // Incoming request already exists? Then accept
  if (user.hasIncomingRequest(targetId)) {
    return await acceptFriendRequest(userId, targetId);
  }

  user.sentRequests.push(targetId);
  target.friendRequests.push({ from: userId });

  await Promise.all([user.save(), target.save()]);
  return { message: 'Friend request sent' };
};

export const acceptFriendRequest = async (userId, requesterId) => {
  const [user, requester] = await Promise.all([
    User.findById(userId),
    User.findById(requesterId),
  ]);
  if (!requester) throw new ApiError(404, 'Requester not found');

  if (!user.hasIncomingRequest(requesterId)) {
    throw new ApiError(400, 'No pending request from this user');
  }

  // Remove request from both sides
  user.friendRequests = user.friendRequests.filter(
    (r) => r.from.toString() !== requesterId.toString()
  );
  requester.sentRequests = requester.sentRequests.filter(
    (id) => id.toString() !== userId.toString()
  );

  // Add to friends
  if (!user.isFriend(requesterId)) user.friends.push(requesterId);
  if (!requester.isFriend(userId)) requester.friends.push(userId);

  await Promise.all([user.save(), requester.save()]);
  return { message: 'Friend request accepted' };
};

export const rejectFriendRequest = async (userId, requesterId) => {
  const [user, requester] = await Promise.all([
    User.findById(userId),
    User.findById(requesterId),
  ]);
  if (!requester) throw new ApiError(404, 'Requester not found');

  user.friendRequests = user.friendRequests.filter(
    (r) => r.from.toString() !== requesterId.toString()
  );
  requester.sentRequests = requester.sentRequests.filter(
    (id) => id.toString() !== userId.toString()
  );

  await Promise.all([user.save(), requester.save()]);
  return { message: 'Friend request rejected' };
};

export const removeFriend = async (userId, friendId) => {
  const [user, friend] = await Promise.all([
    User.findById(userId),
    User.findById(friendId),
  ]);
  if (!friend) throw new ApiError(404, 'Friend not found');

  user.friends = user.friends.filter((id) => id.toString() !== friendId.toString());
  friend.friends = friend.friends.filter((id) => id.toString() !== userId.toString());

  await Promise.all([user.save(), friend.save()]);
  return { message: 'Friend removed' };
};

export const getFriends = async (userId) => {
  const user = await User.findById(userId).populate(
    'friends',
    'name username email avatar bio status isOnline lastSeen isVerified'
  );
  if (!user) throw new ApiError(404, 'User not found');
  return user.friends;
};

/* ------------------------- BLOCK / UNBLOCK ------------------------- */

export const blockUser = async (userId, targetId) => {
  if (userId.toString() === targetId.toString()) {
    throw new ApiError(400, 'Cannot block yourself');
  }

  const [user, target] = await Promise.all([
    User.findById(userId),
    User.findById(targetId),
  ]);
  if (!target) throw new ApiError(404, 'User not found');

  if (!user.hasBlocked(targetId)) {
    user.blockedUsers.push(targetId);
  }

  // Remove friendship if exists
  user.friends = user.friends.filter((id) => id.toString() !== targetId.toString());
  target.friends = target.friends.filter((id) => id.toString() !== userId.toString());

  // Remove pending requests
  user.friendRequests = user.friendRequests.filter(
    (r) => r.from.toString() !== targetId.toString()
  );
  target.sentRequests = target.sentRequests.filter(
    (id) => id.toString() !== userId.toString()
  );
  user.sentRequests = user.sentRequests.filter(
    (id) => id.toString() !== targetId.toString()
  );
  target.friendRequests = target.friendRequests.filter(
    (r) => r.from.toString() !== userId.toString()
  );

  // Add to target's blockedBy
  if (!target.blockedBy.some((id) => id.toString() === userId.toString())) {
    target.blockedBy.push(userId);
  }

  await Promise.all([user.save(), target.save()]);
  return { message: 'User blocked' };
};

export const unblockUser = async (userId, targetId) => {
  const [user, target] = await Promise.all([
    User.findById(userId),
    User.findById(targetId),
  ]);
  if (!target) throw new ApiError(404, 'User not found');

  user.blockedUsers = user.blockedUsers.filter(
    (id) => id.toString() !== targetId.toString()
  );
  target.blockedBy = target.blockedBy.filter(
    (id) => id.toString() !== userId.toString()
  );

  await Promise.all([user.save(), target.save()]);
  return { message: 'User unblocked' };
};

export const getBlockedUsers = async (userId) => {
  const user = await User.findById(userId).populate(
    'blockedUsers',
    'name username email avatar'
  );
  if (!user) throw new ApiError(404, 'User not found');
  return user.blockedUsers;
};