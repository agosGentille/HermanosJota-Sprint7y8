import React, { useState, useEffect } from "react";
import "../styles/HeaderFooter.css";
import { API_BASE_URL } from "../config/api";

function ModalLogin({ show, onClose, onLogin, onShowRegister, onShowForgot }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);

  useEffect(() => {
    const nombreGuardado = localStorage.getItem("nombreUsuario");
    const emailGuardado = localStorage.getItem("emailUsuario");

    if (nombreGuardado) setNombre(nombreGuardado);
    if (emailGuardado) setEmail(emailGuardado);
  }, [show]);

  useEffect(() => {
    if (!show) {
      setEmail("");
      setPassword("");
      setError("");
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Enviando login...", { email });
      
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Respuesta del servidor:", data);

      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      localStorage.setItem("nombreUsuario", data.usuario.nombre);
      localStorage.setItem("emailUsuario", data.usuario.email);
      localStorage.setItem("token", data.token); 
      if (data.token) {
        onLogin(data.token); // Esto actualiza el AuthContext
        onClose();
      } else {
        throw new Error("No se recibió token del servidor");
      }

    } catch (err) {
      console.error("Error en login:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal" style={{ display: show ? "flex" : "none" }}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>Iniciar Sesión</h2>
        <p className={`errorLogin ${error ? "active" : ""}`}>* {error}</p>
        
        <form onSubmit={handleSubmit} className="loginForm">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          
          <div className="password">
            <input
              type={showPassword1 ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
            <span
              className="material-symbols-outlined password-toggle"
              onClick={() => setShowPassword1(!showPassword1)}
            >
              {showPassword1 ? "visibility_off" : "visibility"}
            </span>
          </div>
          
          <button 
            type="submit" 
            className="button-submit"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>

          <p className="registro-texto">
            ¿Aún no tenés usuario?{" "}
            <span
              className="link-registrate"
              onClick={() => {
                onClose();
                if (onShowRegister) onShowRegister();
              }}
            >
              Registrate!
            </span>
          </p>

          <p
            className="registro-texto link-registrate"
            onClick={() => {
              onClose();
              if (onShowForgot) onShowForgot();
            }}
          >
            ¿Olvidaste tu contraseña?
          </p>
        </form>
      </div>
    </div>
  );
}

export default ModalLogin;