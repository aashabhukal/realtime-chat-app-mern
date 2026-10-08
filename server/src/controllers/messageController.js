// src/controllers/messageController.js
import ApiResponse from '../utils/ApiResponse.js';
import * as messageService from '../services/messageService.js';

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const sendMessage = wrap(async (req, res) => {
  const { conversationId, content, attachments } = req.body;
  const message = await messageService.sendMessage({
    conversationId,
    senderId: req.user._id,
    content,
    attachments,
  });

  // Emit via socket
  const io = req.app.get('io');
  if (io) io.to(conversationId).emit('message:new', message);

  res.status(201).json(new ApiResponse(201, message, 'Message sent'));
});

export const getMessages = wrap(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 30 } = req.query;
  const messages = await messageService.getMessages(
    conversationId,
    req.user._id,
    Number(page),
    Number(limit)
  );
  res.json(new ApiResponse(200, messages, 'Messages fetched'));
});

export const markAsRead = wrap(async (req, res) => {
  await messageService.markAsRead(req.params.conversationId, req.user._id);
  res.json(new ApiResponse(200, null, 'Marked as read'));
});

export const deleteMessage = wrap(async (req, res) => {
  const msg = await messageService.deleteMessage(req.params.id, req.user._id);
  const io = req.app.get('io');
  if (io) io.to(msg.conversation.toString()).emit('message:deleted', msg);
  res.json(new ApiResponse(200, msg, 'Message deleted'));
});