import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api.me()
      .then((d) => setUser(d.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = ({ token, user }) => {
    localStorage.setItem('token', token);
    setUser(user);
  };
  const login = async (form) => saveSession(await api.login(form));
  const register = async (form) => saveSession(await api.register(form));
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}
