// // src/socket/index.js
// import { Server } from 'socket.io';
// import jwt from 'jsonwebtoken';
// import env from '../config/env.js';
// import User from '../models/User.js';
// import registerChatHandlers from './chatSocket.js';

// const initSocket = (httpServer) => {
//   const io = new Server(httpServer, {
//     cors: {
//     //   origin: env.CLIENT_URL,
//       credentials: true,
//     },
//   });

//   // Auth middleware
//   io.use(async (socket, next) => {
//     try {
//       const token =
//         socket.handshake.auth?.token ||
//         socket.handshake.headers?.authorization?.split(' ')[1];

//       if (!token) return next(new Error('Authentication error'));

//       const decoded = jwt.verify(token, env.JWT_SECRET);
//       const user = await User.findById(decoded.id).select('-password');
//       if (!user) return next(new Error('User not found'));

//       socket.user = user;
//       next();
//     } catch (err) {
//       next(new Error('Authentication error'));
//     }
//   });

//   io.on('connection', async (socket) => {
//     const userId = socket.user._id.toString();
//     console.log(`🔌 Connected: ${socket.user.name} (${socket.id})`);

//     // Personal room for direct emits
//     socket.join(userId);

//     // Mark user online
//     await User.findByIdAndUpdate(userId, { isOnline: true });
//     socket.broadcast.emit('user:online', { userId });

//     registerChatHandlers(io, socket);

//     socket.on('disconnect', async () => {
//       console.log(`❌ Disconnected: ${socket.user.name}`);
//       await User.findByIdAndUpdate(userId, {
//         isOnline: false,
//         lastSeen: new Date(),
//       });
//       socket.broadcast.emit('user:offline', { userId, lastSeen: new Date() });
//     });
//   });

//   // Attach io to app for controller access
//   httpServer.io = io;
//   return io;
// };

// export default initSocket;