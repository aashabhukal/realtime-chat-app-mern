import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { storage } from '../utils/storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    const token = storage.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data || res.data);
    } catch {
      storage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkUser(); }, []);

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    return res.data.data || res.data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    const data = res.data.data || res.data;
    if (data.token) {
      storage.setToken(data.token);
      storage.setUser(data);
      setUser(data);
    }
    return data;
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const data = res.data.data || res.data;
    storage.setToken(data.token);
    storage.setUser(data);
    setUser(data);
    return data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    storage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, verifyOtp, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);