import { io } from 'socket.io-client';
import { SOCKET_URL, TOKEN_KEY } from '../utils/constants';

let socket = null;

export const initSocket = (token) => {
  if (socket) return socket;
  
  const authToken = token || localStorage.getItem(TOKEN_KEY);
  if (!authToken) {
    console.log('Token nahi hai, socket connect nahi hoga');
    return null;
  }

  socket = io(SOCKET_URL, {
    auth: { token: authToken },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connect error:', err.message);
    if (err.message.includes('Authentication')) {
      disconnectSocket();
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    console.log('Socket cleaned up');
  }
};