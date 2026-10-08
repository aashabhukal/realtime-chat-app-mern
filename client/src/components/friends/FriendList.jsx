// src/components/friends/FriendList.jsx
import { useEffect, useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import Loader from '../common/Loader';
import { getFriends } from '../../services/userService';
import { useChat } from '../../hooks/useChat';
import toast from 'react-hot-toast';

const FriendList = ({ search = '', onAddFriend }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { startChatWithUser } = useChat();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFriends();
        setFriends(res.data);
      } catch (err) {
        toast.error('Failed to load friends');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = friends.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      f.name?.toLowerCase().includes(q) || f.username?.toLowerCase().includes(q)
    );
  });

  if (loading) return <Loader />;

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={search ? 'No friends found' : 'No friends yet'}
        description="Add friends to start chatting"
        action={
          <Button onClick={onAddFriend} size="sm">
            <UserPlus className="w-4 h-4" />
            Add Friend
          </Button>
        }
      />
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {filtered.map((friend) => (
        <button
          key={friend._id}
          onClick={() => startChatWithUser(friend._id)}
          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
        >
          <Avatar
            src={friend.avatar}
            name={friend.name}
            size="md"
            online={friend.isOnline}
            showStatus
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-800 truncate">
              {friend.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">@{friend.username}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default FriendList;