// src/pages/Home.jsx
import Sidebar from '../components/sidebar/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import { useChat } from '../hooks/useChat';
import { MessageCircle } from 'lucide-react';

const Home = () => {
  const { activeConversation } = useChat();

  return (
    <div className="h-screen flex bg-[#0f0d1a] text-white overflow-hidden relative">
      {/* Background glow - Login page jaisa */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      <div
        className={`
          w-full sm:w-[360px] bg-white/[0.03] backdrop-blur-xl border-r border-white/10 flex flex-col relative z-10
          ${activeConversation? 'hidden sm:flex' : 'flex'}
        `}
      >
        <Sidebar />
      </div>

      {/* Chat window */}
      <div
        className={`
          flex-1 flex flex-col relative z-10
          ${activeConversation? 'flex' : 'hidden sm:flex'}
        `}
      >
        {activeConversation? (
          <ChatWindow />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/10 mb-6">
                <MessageCircle className="w-9 h-9 text-purple-300" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">
                Welcome to Aura
              </h2>
              <p className="text-sm text-white/40">
                Select a conversation to start chatting
              </p>
              <div className="mt-6 inline-block px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10">
                <span className="text-[11px] tracking-[0.3em] font-bold text-purple-300/80">AURA</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;