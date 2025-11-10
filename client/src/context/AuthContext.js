import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// 1. Crear el Contexto
export const AuthContext = createContext(null);

// 2. Crear el componente Proveedor
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  // La lógica que antes estaba en App.js ahora vive aquí
  useEffect(() => {
    const tokenLocal = localStorage.getItem("token");
    if (tokenLocal) {
      setToken(tokenLocal);
      const decodedUser = jwtDecode(tokenLocal);
      setUsuario(decodedUser);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    const decodedUser = jwtDecode(token);
    setUsuario(decodedUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
    setToken(null);
    window.location.href = "/";
  };

  // 3. Pasamos el estado y las funciones a través del 'value' del Provider
  const esAdmin = usuario?.rol === "administrador";
  const esEditor = usuario?.rol === "editor";
  const value = { usuario, token, login, logout, esAdmin, esEditor };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
