import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
    pingTimeout: 60000,
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication error: no token'));
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('Authentication error: user not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🔌 Connected: ${socket.user.name} (${socket.id})`);
    socket.join(userId);
    await User.findByIdAndUpdate(userId, { isOnline: true, status: 'online' });
    socket.broadcast.emit('user:online', { userId });

    socket.on('conversation:join', async (conversationId) => {
      try {
        if (!conversationId) return;
        const conv = await Conversation.findById(conversationId);
        if (!conv) return;
        const isMember = conv.participants.some((p) => p.toString() === userId);
        if (!isMember) {
          console.log(`⛔ ${socket.user.name} not a participant of ${conversationId}`);
          return;
        }
        socket.join(conversationId);
        console.log(`👥 ${socket.user.name} joined room ${conversationId}`);
        socket.to(conversationId).emit('conversation:user-joined', {
          conversationId,
          user: { _id: userId, name: socket.user.name },
        });
      } catch (err) {
        console.error('conversation:join error →', err.message);
      }
    });

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(conversationId);
      socket.to(conversationId).emit('conversation:user-left', { conversationId, userId });
    });

    socket.on('message:send', async (payload, callback) => {
      try {
        const { conversationId, content, messageType, file, attachments, replyTo } = payload;
        if (!conversationId) throw new Error('conversationId required');
        const conv = await Conversation.findById(conversationId);
        if (!conv) throw new Error('Conversation not found');
        const isMember = conv.participants.some((p) => p.toString() === userId);
        if (!isMember) throw new Error('Not a participant');
        const receiver =!conv.isGroup? conv.participants.find((p) => p.toString()!== userId) : null;

        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          receiver: receiver || undefined,
          content: content || '',
          messageType: messageType || 'text',
          file: file || {},
          attachments: attachments || [],
          replyTo: replyTo || null,
          deliveredTo: [userId],
          isDelivered: true,
          deliveredAt: new Date(),
        });

        conv.lastMessage = message._id;
        await conv.save();

        await message.populate([
          { path: 'sender', select: 'name username avatar' },
          { path: 'receiver', select: 'name username avatar' },
          { path: 'replyTo', populate: { path: 'sender', select: 'name username avatar' } },
        ]);
        const populated = message;

        io.to(conversationId).emit('message:new', populated);
        if (callback) callback({ success: true, message: populated });
      } catch (err) {
        console.error('message:send error →', err.message);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    socket.on('message:read', async ({ conversationId }) => {
      try {
        if (!conversationId) return;
        const conv = await Conversation.findById(conversationId);
        if (!conv) return;
        if (Message.markAllAsRead) {
          await Message.markAllAsRead(conversationId, userId);
        }
        socket.to(conversationId).emit('message:read', { conversationId, userId, readAt: new Date() });
      } catch (err) {
        console.error('message:read error →', err.message);
      }
    });

    socket.on('message:delete', async ({ messageId, conversationId, forEveryone }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        if (msg.sender.toString()!== userId) return;
        await msg.softDelete(userId,!!forEveryone);
        io.to(conversationId).emit('message:deleted', { messageId, forEveryone:!!forEveryone, userId });
      } catch (err) {
        console.error('message:delete error →', err.message);
      }
    });

    socket.on('message:react', async ({ messageId, conversationId, emoji }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        if (!emoji) {
          await msg.removeReaction(userId);
        } else {
          await msg.addReaction(userId, emoji);
        }
        io.to(conversationId).emit('message:reacted', { messageId, userId, emoji: emoji || null });
      } catch (err) {
        console.error('message:react error →', err.message);
      }
    });

    socket.on('typing:start', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(conversationId).emit('typing:start', { conversationId, user: { _id: userId, name: socket.user.name } });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(conversationId).emit('typing:stop', { conversationId, userId });
    });

    socket.on('call:offer', ({ to, offer }) => io.to(to).emit('call:offer', { from: userId, offer }));
    socket.on('call:answer', ({ to, answer }) => io.to(to).emit('call:answer', { from: userId, answer }));
    socket.on('call:ice-candidate', ({ to, candidate }) => io.to(to).emit('call:ice-candidate', { from: userId, candidate }));
    socket.on('call:end', ({ to }) => io.to(to).emit('call:end', { from: userId }));

    socket.on('disconnect', async () => {
      console.log(`❌ Disconnected: ${socket.user.name}`);
      await User.findByIdAndUpdate(userId, { isOnline: false, status: 'offline', lastSeen: new Date() });
      socket.broadcast.emit('user:offline', { userId, lastSeen: new Date() });
    });
  });

  return io;
};

export default initSocket;