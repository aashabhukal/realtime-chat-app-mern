// src/components/friends/AddFriendModal.jsx
import { useState } from 'react';
import { Search, UserPlus, Check } from 'lucide-react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { getUsers, sendFriendRequest } from '../../services/userService';
import { useDebounce } from '../../hooks/useDebounce';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const AddFriendModal = ({ open, onClose }) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(new Set());
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await getUsers(debouncedSearch);
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [debouncedSearch, open]);

  const handleSendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId);
      setSent(new Set([...sent, userId]));
      toast.success('Friend request sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Friend">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, username or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto -mx-4">
          {loading ? (
            <p className="text-center text-sm text-gray-500 py-4">Searching...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-4">
              {search ? 'No users found' : 'Start typing to search'}
            </p>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50"
              >
                <Avatar src={u.avatar} name={u.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">
                    {u.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">@{u.username}</p>
                </div>
                {sent.has(u._id) ? (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Sent
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendRequest(u._id)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Add
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddFriendModal;