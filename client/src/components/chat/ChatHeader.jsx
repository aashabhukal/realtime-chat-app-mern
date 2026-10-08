// src/components/chat/ChatHeader.jsx
import { ArrowLeft, Phone, Video, Info } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { useSocket } from '../../hooks/useSocket';
import { formatLastSeen } from '../../utils/formatTime';

const ChatHeader = ({ conversation }) => {
  const { user } = useAuth();
  const { closeConversation } = useChat();
  const { onlineUsers } = useSocket();

  if (!conversation) return null;

  let displayName = conversation.groupName || 'Chat';
  let displayAvatar = conversation.groupAvatar || '';
  let isOnline = false;
  let statusText = '';

  if (conversation.isGroup) {
    const count = conversation.participantIds?.length || 0;
    statusText = `${count} members`;
  } else {
    const other = conversation.participantIds?.find(
      (p) => typeof p === 'object' && p._id !== user._id
    );
    if (other) {
      displayName = other.name;
      displayAvatar = other.avatar;
      isOnline = onlineUsers.has(other._id) || other.isOnline;
      statusText = isOnline ? 'Online' : formatLastSeen(other.lastSeen);
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
      <button
        onClick={closeConversation}
        className="p-1.5 hover:bg-gray-100 rounded-lg sm:hidden"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <Avatar
        src={displayAvatar}
        name={displayName}
        size="md"
        online={isOnline}
        showStatus={!conversation.isGroup}
      />

      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-gray-800 text-sm truncate">
          {displayName}
        </h2>
        <p
          className={`text-xs truncate ${
            isOnline ? 'text-green-500' : 'text-gray-500'
          }`}
        >
          {statusText}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Phone className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Video className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Info className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;