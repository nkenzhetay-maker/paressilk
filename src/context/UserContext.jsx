import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
    if (!supabase) return;

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user;
        const userData = {
          id: u.id,
          email: u.email,
          firstName: u.user_metadata?.first_name || u.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: u.user_metadata?.last_name || u.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          avatar: u.user_metadata?.avatar_url || null,
          emailVerified: !!u.email_confirmed_at,
        };
        setUser(userData);
        setToken(session.access_token);
        setShowAuthModal(false);
      }
    });
  }, []);

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

  const register = useCallback(async ({ email, password, firstName, lastName, phone, address, city, district, postalCode }) => {
    const res = await fetch('/.netlify/functions/auth-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName, phone, address, city, district, postalCode }),
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

  const loginWithGoogle = useCallback(async () => {
    if (!supabase) throw new Error('Supabase yapılandırılmamış');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('paressilk_user');
    localStorage.removeItem('paressilk_user_token');
  }, []);

  return (
    <UserContext.Provider value={{ user, token, login, register, loginWithGoogle, logout, showAuthModal, setShowAuthModal }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
