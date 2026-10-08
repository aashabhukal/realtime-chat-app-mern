// src/components/profile/ProfileModal.jsx
import { useState } from 'react';
import { Camera, Save } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, uploadAvatar } from '../../services/userService';
import toast from 'react-hot-toast';

const ProfileModal = ({ open, onClose }) => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    status: user?.status || 'offline',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File too large (max 5MB)');
    }

    setUploading(true);
    try {
      const res = await uploadAvatar(file);
      updateUser({ avatar: res.data.avatar });
      toast.success('Avatar updated');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateProfile(form);
      updateUser(res.data);
      toast.success('Profile updated');
      onClose();
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="My Profile">
      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar src={user?.avatar} name={user?.name} size="xl" />
            <label className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
                disabled={uploading}
              />
            </label>
          </div>
          {uploading && (
            <p className="text-xs text-gray-500 mt-2">Uploading...</p>
          )}
          <p className="text-xs text-gray-400 mt-2">@{user?.username}</p>
        </div>

        {/* Name */}
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            maxLength={200}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            {form.bio.length}/200
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="online">🟢 Online</option>
            <option value="away">🟡 Away</option>
            <option value="busy">🔴 Busy</option>
            <option value="invisible">⚫ Invisible</option>
          </select>
        </div>

        <Button onClick={handleSave} loading={loading} className="w-full">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </Modal>
  );
};

export default ProfileModal;