// src/hooks/useTyping.js
import { useRef, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useChat } from './useChat';
import { SOCKET_EVENTS } from '../utils/constants';

export const useTyping = () => {
  const { socket } = useSocket();
  const { activeConversation } = useChat();
  const timeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const handleTyping = useCallback(() => {
    if (!socket || !activeConversation) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit(SOCKET_EVENTS.TYPING_START, {
        conversationId: activeConversation._id,
      });
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit(SOCKET_EVENTS.TYPING_STOP, {
        conversationId: activeConversation._id,
      });
    }, 1500);
  }, [socket, activeConversation]);

  const stopTyping = useCallback(() => {
    if (!socket || !activeConversation) return;
    clearTimeout(timeoutRef.current);
    isTypingRef.current = false;
    socket.emit(SOCKET_EVENTS.TYPING_STOP, {
      conversationId: activeConversation._id,
    });
  }, [socket, activeConversation]);

  return { handleTyping, stopTyping };
};