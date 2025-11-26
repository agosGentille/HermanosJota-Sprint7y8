import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const tokenLocal = localStorage.getItem("token");
      
      if (tokenLocal) {
        try {
          const decodedUser = jwtDecode(tokenLocal);
          
          // Verificar si el token no ha expirado
          const currentTime = Date.now() / 1000;
          if (decodedUser.exp < currentTime) {
            console.warn("Token expirado");
            localStorage.removeItem("token");
            setUsuario(null);
          } else {
            console.log("✅ Usuario decodificado del token:", decodedUser);
            setUsuario(decodedUser);
          }
        } catch (error) {
          console.error("❌ Error decodificando token:", error);
          localStorage.removeItem("token");
          setUsuario(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token) => {
    try {
      localStorage.setItem("token", token);
      const decodedUser = jwtDecode(token);
      console.log("✅ Usuario después de login:", decodedUser);
      setUsuario(decodedUser);
      return decodedUser;
    } catch (error) {
      console.error("❌ Error en login:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
    window.location.href = "/";
  };

  // ✅ CALCULAR LOS ROLES SIEMPRE FRESCO
  const esAdmin = usuario?.rol === "administrador";
  const esEditor = usuario?.rol === "editor";
  
  console.log("🔄 AuthContext - Usuario:", usuario);
  console.log("🔄 AuthContext - esAdmin:", esAdmin);
  console.log("🔄 AuthContext - esEditor:", esEditor);

  const value = { 
    usuario, 
    login, 
    logout, 
    esAdmin, 
    esEditor,
    loading 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};