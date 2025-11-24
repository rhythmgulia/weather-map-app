import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshUser = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/auth/me');
      setUser(data.user);
      setError(null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const authAction = async (path, payload) => {
    setError(null);
    try {
      await apiClient.post(path, payload);
      await refreshUser();
    } catch (err) {
      setError(err.message || 'Unable to authenticate');
      throw err;
    }
  };

  const login = (payload) => authAction('/auth/login', payload);
  const signup = (payload) => authAction('/auth/signup', payload);

  const logout = async () => {
    await apiClient.post('/auth/logout', {});
    setUser(null);
  };

  const addFavourite = async (fav) => {
    const data = await apiClient.post('/favourites', fav);
    setUser(prev => ({ ...prev, favourites: data.favourites }));
  };
  
  const removeFavourite = async (fav) => {
    const data = await apiClient.delete('/favourites', { data: fav });
    setUser(prev => ({ ...prev, favourites: data.favourites }));
  };
  

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, refreshUser, addFavourite, removeFavourite }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
