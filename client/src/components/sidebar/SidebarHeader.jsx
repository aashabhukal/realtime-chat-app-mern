// src/components/sidebar/SidebarHeader.jsx
import { User, UserPlus, LogOut, MessageCircle } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';

const SidebarHeader = ({ onProfile, onAddFriend, onLogout }) => {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <Avatar src={user?.avatar} name={user?.name} size="md" />
        <div>
          <h2 className="font-semibold text-gray-800 text-sm">
            {user?.name || 'User'}
          </h2>
          <p className="text-xs text-gray-500">@{user?.username}</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onAddFriend}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Add Friend"
        >
          <UserPlus className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={onProfile}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Profile"
        >
          <User className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={onLogout}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default SidebarHeader;