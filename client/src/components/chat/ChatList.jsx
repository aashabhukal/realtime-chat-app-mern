import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const digId = (obj) => {
  if (!obj || typeof obj!== 'object') return '';
  if (obj._id) return obj._id.toString();
  if (obj.id) return obj.id.toString();
  if (obj.user?._id) return obj.user._id.toString();
  if (obj.user?.id) return obj.user.id.toString();
  if (obj.data?.user?._id) return obj.data.user._id.toString();
  if (obj.data?._id) return obj.data._id.toString();
  return '';
};

const getMyId = (authUser) => {
  let id = digId(authUser);
  if (id) return id;
  try {
    const raw = localStorage.getItem('chat_user');
    if (raw) {
      const u = JSON.parse(raw);
      id = digId(u);
      if (id) return id;
    }
  } catch {}
  return '';
};

export default function ChatList({ conversations, onSelectChat, selectedChat }) {
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const myId = getMyId(user);

  const list = Array.isArray(conversations)? conversations : [];

  const getOther = (chat) => {
    const parts = chat.participants || [];
    if (!myId) return parts[0];
    return parts.find((p) => {
      const pid = typeof p === 'object' && p!== null? (p._id || p.id || p.user?._id) : p;
      return pid && pid.toString()!== myId.toString();
    }) || parts[0];
  };

  const getChatName = (chat) => {
    if (chat.isGroup) return chat.groupName || chat.name || "Group";
    const other = getOther(chat);
    if (other && typeof other === 'object') {
      return other.name || other.username || "Chat";
    }
    return "Chat";
  };

  const filtered = list.filter((chat) =>
    getChatName(chat).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-primary-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0? (
          <p className="text-center text-gray-500 mt-10 text-sm">No chats yet</p>
        ) : (
          filtered.map((c) => {
            const name = getChatName(c);
            const other = getOther(c);
            const uname = other?.username? `@${other.username}` : "";
            const isSelected = selectedChat?._id === c._id;
            return (
              <div
                key={c._id}
                onClick={() => onSelectChat(c)}
                className={`px-4 py-3 cursor-pointer flex items-center gap-3 hover:bg-gray-50 ${isSelected? "bg-primary-50" : "bg-white"}`}
              >
                <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                  {name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{name} <span className="text-gray-400 text-xs">{uname}</span></p>
                  <p className="text-xs text-gray-500 truncate">
                    {c.lastMessage?.content || "Start chatting"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}