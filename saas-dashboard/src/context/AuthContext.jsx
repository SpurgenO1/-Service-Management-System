import { createContext, useContext, useMemo, useState } from 'react';
import { api, clearSession, getStoredUser, getToken, setSession } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const t = getToken();
    const u = getStoredUser();
    if (t && u) {
      return { ...u, token: t };
    }
    return null;
  });

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.token),
      async login(email, password) {
        const data = await api('/login', {
          method: 'POST',
          body: { email, password },
        });
        setSession(data.token, {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        });
        setUser({ ...data, token: data.token });
        return data;
      },
      logout() {
        clearSession();
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
