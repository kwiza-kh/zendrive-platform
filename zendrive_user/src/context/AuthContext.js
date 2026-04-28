import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi, getToken, getUser, setToken, setUser, removeToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getUser());

  useEffect(() => {
    if (getToken() && !user) {
      authApi.me().then((r) => { setUser(r.data); setUserState(r.data); }).catch(() => removeToken());
    }
    // eslint-disable-next-line
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    setToken(data.access_token); setUser(data.user); setUserState(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    setToken(data.access_token); setUser(data.user); setUserState(data.user);
    return data.user;
  };

  const logout = () => { removeToken(); setUserState(null); };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
