// src/services/messageService.js
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import ApiError from '../utils/ApiError.js';

export const sendMessage = async ({ conversationId, senderId, content, attachments }) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  if (!conversation.participants.some((p) => p.toString() === senderId.toString())) {
    throw new ApiError(403, 'Not a participant');
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content,
    attachments: attachments || [],
    deliveredTo: [senderId],
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  const populatedMessage = await Message.findById(message._id).populate('sender', 'name email avatar');
  return populatedMessage;
};

export const getMessages = async (conversationId, userId, page = 1, limit = 30) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  if (!conversation.participants.some((p) => p.toString() === userId.toString())) {
    throw new ApiError(403, 'Not a participant');
  }

  const skip = (page - 1) * limit;
  const messages = await Message.find({ conversation: conversationId, deleted: false })
   .populate('sender', 'name email avatar')
   .sort({ createdAt: -1 })
   .skip(skip)
   .limit(limit);

  return messages.reverse();
};

export const markAsRead = async (conversationId, userId) => {
  await Message.updateMany(
    { conversation: conversationId, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );
};

export const deleteMessage = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, 'Message not found');
  if (message.sender.toString()!== userId.toString()) {
    throw new ApiError(403, 'Not allowed');
  }
  message.deleted = true;
  message.content = 'This message was deleted';
  await message.save();
  return message;
};