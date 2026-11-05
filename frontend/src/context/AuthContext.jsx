import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.me().then((u) => setUser(u)).finally(() => setReady(true));
  }, []);

  const login = useCallback(async (creds) => {
    const { token, user: u } = await api.login(creds);
    setToken(token); setUser(u); return u;
  }, []);
  const register = useCallback(async (data) => {
    const { token, user: u } = await api.register(data);
    setToken(token); setUser(u); return u;
  }, []);
  const logout = useCallback(async () => {
    await api.logout(); setToken(null); setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, ready, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
