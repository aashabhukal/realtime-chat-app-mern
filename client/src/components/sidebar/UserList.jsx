// src/components/sidebar/UserList.jsx
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../common/Avatar';
import Loader from '../common/Loader';

export default function UserList() {
  const { startDirectChat } = useChat();
  const { onlineUsers } = useSocket();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getUsers(search);
        setUsers(res.data || []);
      } catch (err) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleClick = async (userId) => {
    await startDirectChat(userId);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="p-3">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/30 transition"
        />
      </div>
      {users.length === 0 ? (
        <p className="text-center text-sm text-gray-500 p-6">No users found</p>
      ) : (
        <div>
          {users.map((u) => (
            <button
              key={u._id}
              onClick={() => handleClick(u._id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
            >
              <Avatar
                user={{ ...u, isOnline: onlineUsers.has(u._id) }}
                size="md"
                showStatus
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {u.name}
                </p>
                <p className="text-xs text-gray-500 truncate">@{u.username}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}