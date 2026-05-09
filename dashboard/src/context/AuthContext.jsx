import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      return data.user;
    } catch (error) {
      localStorage.removeItem('tp_token');
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('tp_token');

      if (!token) {
        setLoading(false);
        return;
      }

      await refreshUser();
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    localStorage.setItem('tp_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('tp_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('tp_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
