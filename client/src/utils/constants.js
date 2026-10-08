export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';

export const TOKEN_KEY = 'chat_token';
export const USER_KEY = 'chat_user';

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
  SYSTEM: 'system',
};

export const STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy',
  INVISIBLE: 'invisible',
};

export const SOCKET_EVENTS = {
  CONVERSATION_JOIN: 'conversation:join',
  CONVERSATION_LEAVE: 'conversation:leave',
  MESSAGE_SEND: 'message:send',
  MESSAGE_NEW: 'message:new',
  MESSAGE_READ: 'message:read',
  MESSAGE_DELETE: 'message:delete',
  MESSAGE_DELETED: 'message:deleted',
  MESSAGE_REACT: 'message:react',
  MESSAGE_REACTED: 'message:reacted',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  CALL_OFFER: 'call:offer',
  CALL_ANSWER: 'call:answer',
  CALL_ICE: 'call:ice-candidate',
  CALL_END: 'call:end',
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
};