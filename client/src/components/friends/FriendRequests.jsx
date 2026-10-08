// src/components/friends/FriendRequests.jsx
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export default function FriendRequests() {
  const { user, updateUser } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // Friend requests user object mein hote hain
    setRequests(user?.friendRequests || []);
  }, [user]);

  const handleAccept = async (userId) => {
    try {
      await userService.acceptFriendRequest(userId);
      toast.success('Friend request accepted');
      const updated = requests.filter((r) => r.from._id !== userId);
      setRequests(updated);
      updateUser({ friendRequests: updated });
    } catch (err) {
      toast.error('Failed to accept');
    }
  };

  const handleReject = async (userId) => {
    try {
      await userService.rejectFriendRequest(userId);
      toast.success('Request rejected');
      const updated = requests.filter((r) => r.from._id !== userId);
      setRequests(updated);
      updateUser({ friendRequests: updated });
    } catch (err) {
      toast.error('Failed to reject');
    }
  };

  if (!requests.length) {
    return (
      <p className="text-center text-sm text-gray-500 p-6">
        No pending requests
      </p>
    );
  }

  return (
    <div>
      {requests.map((req) => (
        <div
          key={req.from._id}
          className="flex items-center gap-3 px-4 py-3 border-b border-gray-100"
        >
          <Avatar user={req.from} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">
              {req.from.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              @{req.from.username}
            </p>
          </div>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              onClick={() => handleAccept(req.from._id)}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleReject(req.from._id)}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}