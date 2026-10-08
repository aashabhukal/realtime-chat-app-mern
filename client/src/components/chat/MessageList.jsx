// src/components/chat/MessageList.jsx
import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import Loader from '../common/Loader';
import { useChat } from '../../hooks/useChat';

const MessageList = () => {
  const { messages, loading, activeConversation } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) return <Loader />;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-sm text-gray-400 bg-white/80 px-4 py-2 rounded-full">
            No messages yet. Say hi! 👋
          </p>
        </div>
      ) : (
        messages.map((msg) => <MessageBubble key={msg._id} message={msg} />)
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;