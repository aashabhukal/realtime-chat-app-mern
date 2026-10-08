// src/components/chat/MessageBubble.jsx
import { Check, CheckCheck, Trash2, Reply } from 'lucide-react';
import { useState } from 'react';
import { formatTime } from '../../utils/formatTime';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useChat } from '../../hooks/useChat';
import { SOCKET_EVENTS } from '../../utils/constants';

const MessageBubble = ({ message }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { activeConversation } = useChat();
  const [showMenu, setShowMenu] = useState(false);

  const isOwn = message.sender?._id === user._id || message.sender === user._id;
  const senderName = message.sender?.name || 'User';

  const otherParticipants = activeConversation?.participants?.filter(
    (p) => (p._id || p)?.toString() !== user._id?.toString()
  ) || [];

  const isRead = message.isRead || (Array.isArray(message.readBy) && message.readBy.length > 1) ||
    (Array.isArray(message.readBy) && otherParticipants.length > 0 && message.readBy.some(r => 
      otherParticipants.some(op => (op._id || op)?.toString() === (r._id || r)?.toString())
    ));

  const isDelivered = message.isDelivered || true; 
  const handleDelete = () => {
    if (!socket) return;
    socket.emit(SOCKET_EVENTS.MESSAGE_DELETE, {
      messageId: message._id,
      conversationId: activeConversation._id,
      forEveryone: true,
    });
    setShowMenu(false);
  };

  const renderTick = () => {
    if (!isOwn) return null;
    if (isRead) {
      return <CheckCheck className="w-4 h-4 text-sky-300" />; 
    }
    if (isDelivered) {
      return <CheckCheck className="w-4 h-4 opacity-70" />; 
    }
    return <Check className="w-4 h-4 opacity-70" />; 
  };

  return (
    <div className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-semibold shrink-0 mt-auto">
          {senderName[0]}
        </div>
      )}

      <div className={`group relative max-w-xs sm:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && activeConversation?.isGroup && (
          <span className="text-xs font-medium text-primary-600 mb-1 ml-1">
            {senderName}
          </span>
        )}

        <div
          className={`relative px-3 py-2 rounded-2xl text-sm break-words ${
            isOwn
              ? 'bg-primary-500 text-white rounded-br-sm'
              : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
          }`}
        >
          {message.messageType === 'image' && message.file?.url ? (
            <img
              src={message.file.url}
              alt="attachment"
              className="rounded-lg max-w-full"
            />
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}

          <div
            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
              isOwn ? 'text-white/80' : 'text-gray-400'
            }`}
          >
            <span>{formatTime(message.createdAt)}</span>
            {isOwn && <span className="flex">{renderTick()}</span>}
          </div>
        </div>

        <div
          className={`
            absolute top-0 ${isOwn ? '-left-16' : '-right-16'}
            opacity-0 group-hover:opacity-100 transition-opacity
            flex items-center gap-1
          `}
        >
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 bg-white shadow rounded-full hover:bg-gray-50"
          >
            <Reply className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>

        {showMenu && isOwn && (
          <div className="absolute z-10 mt-1 bg-white shadow-lg rounded-lg py-1">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 w-full"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;