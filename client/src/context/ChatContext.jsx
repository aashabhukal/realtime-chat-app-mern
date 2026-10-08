import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { SocketContext } from './SocketContext';
import { SOCKET_EVENTS } from '../utils/constants';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const socketCtx = useContext(SocketContext);
  const socket = socketCtx?.socket || null;

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('chat_token');
      const res = await api.get('/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data.data || res.data || []);
    } catch (err) {
      console.error('fetchConversations error:', err);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('chat_token');
      const res = await api.get(`/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.data || res.data || []);
    } catch (err) {
      console.error('fetchMessages error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const startChatWithUser = useCallback(async (friend) => {
    try {
      const token = localStorage.getItem('chat_token');
      const friendId = typeof friend === 'string'? friend : (friend._id || friend.id);
      if (!friendId) {
        console.error('friendId missing', friend);
        return;
      }
      const res = await api.post('/conversations',
        {
          type: 'direct',
          participants: [friendId],
          participantId: friendId,
          userId: friendId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const conv = res.data.data || res.data;
      await fetchConversations();
      setActiveConversation(conv);
    } catch (err) {
      console.error('startChatWithUser error:', err?.response?.data || err.message);
    }
  }, [fetchConversations]);

  const sendMessage = (content) => {
    if (!socket) {
      console.log('SEND FAILED: socket not connected');
      return;
    }
    if (!activeConversation?._id) return;
    if (!content?.trim()) return;

    socket.emit(SOCKET_EVENTS.MESSAGE_SEND, {
      conversationId: activeConversation._id,
      content,
      messageType: 'text'
    }, (ack) => {
      console.log('message:send ack:', ack);
      const newMsg = ack?.message || ack?.data;
      if (ack?.success && newMsg) {
        setMessages((prev) => {
          if (prev.some(m => (m._id || m.id) === (newMsg._id || newMsg.id))) return prev;
          return [...prev, newMsg];
        });
        fetchConversations();
      }
    });
  };

  const deleteMessage = (messageId) => {
    if (!socket ||!activeConversation?._id) return;
    socket.emit(SOCKET_EVENTS.MESSAGE_DELETE,
      { messageId, conversationId: activeConversation._id },
      (res) => console.log('delete ack:', res)
    );
  };

  useEffect(() => {
    if (activeConversation?._id) {
      fetchMessages(activeConversation._id);
      if (socket) socket.emit(SOCKET_EVENTS.CONVERSATION_JOIN, activeConversation._id);
    }
  }, [activeConversation?._id, fetchMessages, socket]);

  useEffect(() => {
    if (!socket) return;
    const onNewMessage = (msg) => {
      const cid = msg.conversationId || msg.conversation?._id || msg.conversation;
      if (cid?.toString() === activeConversation?._id?.toString()) {
        setMessages((prev) => {
          if (prev.some(m => (m._id || m.id) === (msg._id || msg.id))) return prev;
          return [...prev, msg];
        });
      }
      fetchConversations();
    };
    const onMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id!== messageId && m.id!== messageId));
    };
    socket.on(SOCKET_EVENTS.MESSAGE_NEW, onNewMessage);
    socket.on(SOCKET_EVENTS.MESSAGE_DELETED, onMessageDeleted);
    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_NEW, onNewMessage);
      socket.off(SOCKET_EVENTS.MESSAGE_DELETED, onMessageDeleted);
    };
  }, [socket, activeConversation?._id, fetchConversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      setActiveConversation,
      messages,
      loading,
      sendMessage,
      deleteMessage,
      fetchConversations,
      fetchMessages,
      startChatWithUser
    }}>
      {children}
    </ChatContext.Provider>
  );
};