// src/services/conversationService.js (fixed)
import Conversation from '../models/Conversation.js';
import ApiError from '../utils/ApiError.js';

export const accessConversation = async (userId, otherUserId) => {
  if (!otherUserId) throw new ApiError(400, 'otherUserId is required');
  if (userId.toString() === otherUserId.toString()) {
    throw new ApiError(400, 'Cannot chat with yourself');
  }

  let conversation = await Conversation.findDirect(userId, otherUserId);

  if (!conversation) {
    conversation = await Conversation.create({
      isGroup: false,
      participants: [
        { user: userId, role: 'member' },
        { user: otherUserId, role: 'member' },
      ],
      participantIds: [userId, otherUserId],
    });
  }

  return Conversation.findById(conversation._id)
   .populate('participantIds', 'name username avatar isOnline lastSeen status')
   .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name username avatar' },
    });
};

export const getUserConversations = async (userId) =>
  Conversation.getUserConversations(userId);

export const createGroupChat = async (
  userId,
  { groupName, participants, groupAvatar, groupDescription }
) => {
  if (!groupName) throw new ApiError(400, 'Group name is required');
  if (!Array.isArray(participants) || participants.length < 2) {
    throw new ApiError(400, 'At least 2 other participants required');
  }

  const allIds = [...new Set([...participants, userId.toString()])];

  const group = await Conversation.create({
    isGroup: true,
    groupName,
    groupAvatar: groupAvatar || '',
    groupDescription: groupDescription || '',
    groupOwner: userId,
    groupAdmins: [userId],
    participants: allIds.map((id) => ({
      user: id,
      role: id.toString() === userId.toString()? 'owner' : 'member',
    })),
    participantIds: allIds,
  });

  await group.populate('participantIds', 'name username avatar isOnline status');
  return group;
};

export const updateGroup = async (conversationId, userId, updates) => {
  const group = await Conversation.findById(conversationId);
  if (!group) throw new ApiError(404, 'Group not found');
  if (!group.isGroup) throw new ApiError(400, 'Not a group');
  if (!group.isAdmin(userId)) {
    throw new ApiError(403, 'Only admins can update group');
  }

  if (updates.groupName!== undefined) group.groupName = updates.groupName;
  if (updates.groupAvatar!== undefined) group.groupAvatar = updates.groupAvatar;
  if (updates.groupDescription!== undefined)
    group.groupDescription = updates.groupDescription;

  await group.save();
  await group.populate('participantIds', 'name username avatar');
  return group;
};

export const addToGroup = async (conversationId, userId, newUserId) => {
  const group = await Conversation.findById(conversationId);
  if (!group ||!group.isGroup) throw new ApiError(404, 'Group not found');
  if (!group.isAdmin(userId)) {
    throw new ApiError(403, 'Only admins can add members');
  }
  if (group.hasParticipant(newUserId)) {
    throw new ApiError(400, 'User already in group');
  }
  await group.addParticipant(newUserId, 'member');
  await group.populate('participantIds', 'name username avatar');
  return group;
};

export const removeFromGroup = async (conversationId, userId, removeId) => {
  const group = await Conversation.findById(conversationId);
  if (!group ||!group.isGroup) throw new ApiError(404, 'Group not found');
  if (!group.isAdmin(userId)) {
    throw new ApiError(403, 'Only admins can remove members');
  }
  if (group.groupOwner?.toString() === removeId.toString()) {
    throw new ApiError(400, 'Cannot remove group owner');
  }
  await group.removeParticipant(removeId);
  await group.populate('participantIds', 'name username avatar');
  return group;
};