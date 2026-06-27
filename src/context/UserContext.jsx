import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('paressilk_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('paressilk_user_token') || null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('paressilk_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('paressilk_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('paressilk_user_token', token);
    } else {
      localStorage.removeItem('paressilk_user_token');
    }
  }, [token]);

  const register = useCallback(async ({ email, password, firstName, lastName }) => {
    const res = await fetch('/.netlify/functions/auth-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch('/.netlify/functions/auth-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setUser(data.user);
    setToken(data.token);
    setShowAuthModal(false);
    return data;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('paressilk_user');
    localStorage.removeItem('paressilk_user_token');
  }, []);

  return (
    <UserContext.Provider value={{ user, token, login, register, logout, showAuthModal, setShowAuthModal }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
