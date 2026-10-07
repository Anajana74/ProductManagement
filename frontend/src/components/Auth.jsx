import { createContext, useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, session } from "../api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(session.user());

  const login = async (username, password) => {
    const r = await api.login({ username, password });
    session.save(r);
    setUser({ name: r.name, username: r.username });
    return r;
  };
  const logout = () => { session.clear(); setUser(null); };

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

export function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}
