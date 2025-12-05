// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";
import { authApi } from "../api/authApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await authApi.perfil();
        setUsuario(res.data);
      } catch (e) {
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (credenciales) => {
    const res = await authApi.login(credenciales);
    localStorage.setItem("access_token", res.data.token);
    const perfil = await authApi.perfil();
    setUsuario(perfil.data);
    return perfil.data;
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem("access_token");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
