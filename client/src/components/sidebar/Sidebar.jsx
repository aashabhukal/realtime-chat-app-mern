// src/components/sidebar/Sidebar.jsx
import { useState, useEffect } from 'react';
import { Search, MessageSquare, Users, UserPlus, User, LogOut, X } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import api from '../../api/api';

const getMyUser = () => {
  try {
    const raw =
      localStorage.getItem('user') ||
      localStorage.getItem('chat_user') ||
      '{}';
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const getMyId = () => {
  const u = getMyUser();
  if (u._id) return u._id.toString();
  if (u.id) return u.id.toString();
  return (localStorage.getItem('chat_userId') || localStorage.getItem('userId') || '').toString();
};

const getToken = () => localStorage.getItem('chat_token') || localStorage.getItem('token') || '';
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

const getDisplayName = (u) => u?.name || u?.fullName || u?.username || 'Unknown';

const getChatName = (conv) => {
  const myId = getMyId();
  if (conv?.otherUser) return getDisplayName(conv.otherUser);
  if (conv?.participants?.length) {
    for (const p of conv.participants) {
      if (!p || typeof p!== 'object') continue;
      const pid = (p._id || p.id || '').toString();
      if (pid && pid!== myId) {
        return getDisplayName(p);
      }
    }
    const only = conv.participants.find(p => typeof p === 'object' && (p?.name || p?.fullName));
    if (only) return getDisplayName(only);
  }
  return conv?.name || 'Unknown';
};

const getChatUsername = (conv) => {
  const myId = getMyId();
  if (conv?.otherUser?.username) return conv.otherUser.username;
  if (conv?.participants?.length) {
    for (const p of conv.participants) {
      if (!p || typeof p!== 'object') continue;
      const pid = (p._id || p.id || '').toString();
      if (pid && pid!== myId) return p.username || 'user';
    }
  }
  return 'user';
};

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const [search, setSearch] = useState('');
  const [friendsList, setFriendsList] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { conversations, setActiveConversation, activeConversation, startChatWithUser } = useChat();

  useEffect(() => {
    console.log('CONVERSATIONS:', conversations);
    console.log('MY_ID:', getMyId());
  }, [conversations]);

  const fetchFriends = async () => {
    try {
      const res = await api.get('/users/friends/list', authHeader());
      const data = res.data.data || res.data || [];
      setFriendsList(Array.isArray(data)? data : []);
    } catch {}
  };

  useEffect(() => { fetchFriends(); }, []);

  const handleLogout = (e) => {
    e.stopPropagation();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const handleUserSearch = async (q) => {
    setUserSearch(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      const res = await api.get(`/users?search=${encodeURIComponent(q)}`, authHeader());
      let data = res.data.data || res.data.users || res.data || [];
      if (!Array.isArray(data)) data = [];
      const myId = getMyId();
      data = data.filter(u => (u._id || u.id)?.toString()!== myId);
      setSearchResults(data);
    } catch { setSearchResults([]); }
  };

  const handleAddFriend = async (u) => {
    const fid = u._id || u.id;
    if (!fid) return;
    try {
      await api.post(`/users/friends/request/${fid}`, {}, authHeader());
      alert('Friend request bhej di');
      setSearchResults(prev => prev.filter(x => (x._id || x.id)!== fid));
      fetchFriends();
    } catch (err) {
      alert(err?.response?.data?.message || 'Request fail ho gayi');
    }
  };

  const myUser = getMyUser();
  const myDisplayName = getDisplayName(myUser);
  const myInitial = (myDisplayName[0] || 'U').toUpperCase();

  const isChatTab = activeTab === 'chats';
  const list = isChatTab? (conversations || []) : friendsList;

  const filtered = list.filter((f) => {
    const name = isChatTab? getChatName(f) : getDisplayName(f);
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelect = (item) => {
    if (isChatTab) {
      setActiveConversation(item);
    } else {
      startChatWithUser(item);
      setActiveTab('chats');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f0d1a] relative">
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg">
            {myInitial}
          </div>
          <div>
            <h2 className="font-semibold text-[15px] text-white leading-tight">{myDisplayName}</h2>
            <p className="text-xs text-white/50 leading-tight">@{myUser.username || 'user'}</p>
          </div>
        </div>
        <div className="flex gap-2 text-white/50 items-center">
          <button onClick={() => setShowAdd(true)} title="Add Friend" className="hover:text-white transition p-2 hover:bg-white/10 rounded-lg">
            <UserPlus className="w-5 h-5 pointer-events-none" />
          </button>
          <button onClick={() => setShowProfile(true)} title="Profile" className="hover:text-white transition p-2 hover:bg-white/10 rounded-lg">
            <User className="w-5 h-5 pointer-events-none" />
          </button>
          <button onClick={handleLogout} title="Logout" className="hover:text-red-400 transition p-2 hover:bg-white/10 rounded-lg">
            <LogOut className="w-5 h-5 pointer-events-none" />
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>

      <div className="flex border-b border-white/10 px-2">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${isChatTab? 'text-purple-300 border-b-2 border-purple-500' : 'text-white/50 hover:text-white/80'}`}
        >
          <MessageSquare className="w-4 h-4" /> Chats
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${!isChatTab? 'text-purple-300 border-b-2 border-purple-500' : 'text-white/50 hover:text-white/80'}`}
        >
          <Users className="w-4 h-4" /> Friends
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((f, i) => {
          const dName = isChatTab? getChatName(f) : getDisplayName(f);
          const uName = isChatTab? getChatUsername(f) : (f.username || 'user');
          const isActive = activeConversation?._id === f._id;
          return (
            <div
              key={f._id || i}
              onClick={() => handleSelect(f)}
              className={`flex items-center gap-3 p-3 px-4 cursor-pointer border-b border-white/[0.05] transition ${isActive? 'bg-purple-500/20' : 'hover:bg-white/[0.05]'}`}
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shrink-0">
                {(dName[0] || 'U').toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-[14px] text-white truncate">{dName}</h3>
                <p className="text-xs text-white/40 truncate">@{uName}</p>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-white/30 text-sm mt-10">No {activeTab} found</p>
        )}
      </div>

      {showAdd && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-start justify-center pt-16 p-4">
          <div className="bg-[#1a162e] border border-white/10 rounded-2xl w-full max-w-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Add Friend</h3>
              <X onClick={() => { setShowAdd(false); setUserSearch(''); setSearchResults([]); }} className="w-5 h-5 text-white/50 cursor-pointer hover:text-white" />
            </div>
            <input
              value={userSearch}
              onChange={(e) => handleUserSearch(e.target.value)}
              placeholder="Username se search karo..."
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 mb-3"
            />
            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.map(u => {
                const uid = u._id || u.id;
                return (
                  <div key={uid} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                        {(getDisplayName(u)[0] || 'U').toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm">{getDisplayName(u)}</p>
                        <p className="text-white/40 text-xs">@{u.username}</p>
                      </div>
                    </div>
                    <button onClick={() => handleAddFriend(u)} className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg">
                      Add
                    </button>
                  </div>
                );
              })}
              {userSearch && searchResults.length === 0 && <p className="text-white/30 text-sm text-center py-4">Koi user nahi mila</p>}
              {!userSearch && <p className="text-white/30 text-sm text-center py-4">Search karke friend add karo</p>}
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-start justify-center pt-16 p-4">
          <div className="bg-[#1a162e] border border-white/10 rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="flex justify-end">
              <X onClick={() => setShowProfile(false)} className="w-5 h-5 text-white/50 cursor-pointer hover:text-white" />
            </div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-3xl mx-auto mb-3">
              {myInitial}
            </div>
            <h3 className="text-white font-semibold text-lg">{myDisplayName}</h3>
            <p className="text-white/50 text-sm mb-2">@{myUser.username || 'user'}</p>
            <p className="text-white/40 text-sm">{myUser.email || ''}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;