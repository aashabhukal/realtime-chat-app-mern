import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Phone, Video, MoreVertical } from 'lucide-react';
import { useChat } from '../../hooks/useChat';

const getMyId = () => {
  let id = localStorage.getItem('chat_userId') || localStorage.getItem('userId') || localStorage.getItem('_id');
  if (id) return id;
  try {
    const userStr = localStorage.getItem('user') || localStorage.getItem('chat_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      return u._id || u.id || u.userId || '';
    }
  } catch {}
  try {
    const token = localStorage.getItem('chat_token') || localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload._id || payload.id || payload.userId || payload.sub || '';
    }
  } catch {}
  return '';
};

const getConvName = (conv) => {
  if (!conv) return 'User';
  const other = conv.otherUser || conv.otherParticipant;
  if (other) return other.fullName || other.displayName || other.username || 'User';
  const myId = getMyId();
  const p = conv.participants?.find(x => {
    if (typeof x!== 'object' ||!x) return false;
    const pid = x._id || x.id;
    return pid?.toString()!== myId?.toString();
  }) || conv.participants?.find(x => typeof x === 'object' && x!== null);
  if (p) return p.fullName || p.displayName || p.username || 'User';
  return conv.name || 'User';
};

const ChatWindow = () => {
  const { activeConversation, messages, sendMessage, setActiveConversation } = useChat();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const currentUserId = getMyId();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  if (!activeConversation) return null;

  return (
    <div className="flex flex-col h-full bg-[#0f0d1a] text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.03]">
        <div className="flex items-center gap-3">
          <ArrowLeft onClick={() => setActiveConversation(null)} className="w-5 h-5 text-white/60 sm:hidden cursor-pointer" />
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
            {getConvName(activeConversation)[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-[15px] text-white">{getConvName(activeConversation)}</h3>
            <p className="text-xs text-green-400">online</p>
          </div>
        </div>
        <div className="flex gap-4 text-white/50">
          <Phone className="w-5 h-5" /><Video className="w-5 h-5" /><MoreVertical className="w-5 h-5" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {(messages || []).map((msg, i) => {
          const rawSender = msg.sender || msg.senderId || msg.from;
          const senderId = typeof rawSender === 'object' && rawSender!== null
           ? (rawSender._id || rawSender.id)
            : rawSender;
          const senderStr = senderId?.toString() || '';
          const myStr = currentUserId?.toString() || '';
          const isMe = senderStr && myStr? senderStr === myStr : false;

          const content = msg.content || msg.text || msg.message || '';

          return (
            <div key={msg._id || msg.id || i} className={`flex ${isMe? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[14px] ${isMe? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-br-md' : 'bg-white/[0.07] border border-white/10 text-white rounded-bl-md'}`}>
                <p className="break-words">{content}</p>
                <div className={`text-[11px] mt-1 ${isMe? 'text-right' : 'text-left'} opacity-70`}>
                  {msg.createdAt? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  {isMe && ' ✓✓'}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-white/10 bg-white/[0.02]">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/[0.06] border border-white/10 rounded-full px-5 py-3 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60"
          />
          <button type="submit" className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Send className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;