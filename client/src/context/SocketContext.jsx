import { createContext, useContext, useEffect, useState } from 'react';
import { initSocket, disconnectSocket } from '../services/socketService';
import { AuthContext } from './AuthContext';
import { TOKEN_KEY } from '../utils/constants';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      setSocket(null);
      return;
    }
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const s = initSocket(token);
    if (!s) return;
    setSocket(s);

    const onOnline = ({ userId }) => setOnlineUsers((prev) => new Set(prev).add(userId));
    const onOffline = ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    s.on('user:online', onOnline);
    s.on('user:offline', onOffline);

    return () => {
      s.off('user:online', onOnline);
      s.off('user:offline', onOffline);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};