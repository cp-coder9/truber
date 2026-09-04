import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, getUser, setSession, clearSession } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser());
  const [token, setToken] = useState(getToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setLoading(true);
      api
        .get('/auth/me')
        .then((d) => {
          setUser(d.user);
          setSession(token, d.user);
        })
        .catch(() => {
          clearSession();
          setUser(null);
          setToken(null);
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  const login = async (email, password) => {
    const d = await api.post('/auth/login', { email, password }, { skipAuth: true });
    setSession(d.token, d.user);
    setToken(d.token);
    setUser(d.user);
    return d.user;
  };

  const register = async (payload) => {
    const d = await api.post('/auth/register', payload, { skipAuth: true });
    setSession(d.token, d.user);
    setToken(d.token);
    setUser(d.user);
    return d.user;
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
