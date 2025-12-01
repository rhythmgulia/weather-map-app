import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load logged-in user
  const refreshUser = async () => {
    try {
      setLoading(true);
  
      // Your apiClient.get() returns data, NOT axios response
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

  // Signup / Login helper
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

  // Add favourite
  const addFavourite = async (fav) => {
    const res = await apiClient.post('/favourites', fav);
    setUser(prev => ({ ...prev, favourites: res.favourites }));
  };
  

  // Remove favourite
  const removeFavourite = async (fav) => {
    const res = await apiClient.delete('/favourites', { data: fav });
    setUser(prev => ({ ...prev, favourites: res.favourites }));
  };
  

  // Add recent search
  const addRecentSearch = async (search) => {
    try {
      const res = await apiClient.post('/recent', search);

      const recent = res?.recent ?? []; // SAFE

      setUser(prev => ({
        ...prev,
        recentSearches: recent
      }));
    } catch (err) {
      console.error("Failed to save recent search:", err);
    }
  };

  // Refresh recent search list
  const refreshRecent = async () => {
    try {
      const res = await apiClient.get('/recent');
      setUser(prev => ({
        ...prev,
        recentSearches: res.recent
      }));
    } catch (err) {
      console.error("Failed to fetch recent searches:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        refreshUser,
        addFavourite,
        removeFavourite,
        addRecentSearch,
        refreshRecent
      }}
    >
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

