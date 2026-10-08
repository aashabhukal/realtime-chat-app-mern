// src/components/chat/ChatListItem.jsx
import Avatar from '../common/Avatar';
import { formatDate } from '../../utils/formatTime.js';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';

const ChatListItem = ({ conversation }) => {
  const { activeConversation, openConversation } = useChat();
  const { user } = useAuth();
  const { onlineUsers } = useSocket();

  const isActive = activeConversation?._id === conversation._id;

  // Determine display info
  let displayName = conversation.groupName || 'Unknown';
  let displayAvatar = conversation.groupAvatar || '';
  let isOnline = false;

  if (!conversation.isGroup) {
    const other = conversation.participantIds?.find(
      (p) => typeof p === 'object' && p._id !== user._id
    );
    if (other) {
      displayName = other.name;
      displayAvatar = other.avatar;
      isOnline = onlineUsers.has(other._id) || other.isOnline;
    }
  }

  const preview = conversation.lastMessagePreview || 'No messages yet';
  const lastAt = conversation.lastMessageAt;

  const unread = conversation.unreadCount || 0;

  return (
    <button
      onClick={() => openConversation(conversation)}
      className={`
        w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left
        ${isActive ? 'bg-primary-50 border-l-4 border-primary-500' : ''}
      `}
    >
      <Avatar
        src={displayAvatar}
        name={displayName}
        size="lg"
        online={isOnline}
        showStatus={!conversation.isGroup}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3
            className={`font-semibold text-sm truncate ${
              isActive ? 'text-primary-700' : 'text-gray-800'
            }`}
          >
            {displayName}
          </h3>
          {lastAt && (
            <span className="text-[11px] text-gray-400 shrink-0 ml-2">
              {formatDate(lastAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 truncate">{preview}</p>
          {unread > 0 && (
            <span className="ml-2 shrink-0 min-w-[20px] h-5 px-1.5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatListItem;