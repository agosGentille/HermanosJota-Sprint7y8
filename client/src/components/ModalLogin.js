import React, { useState, useEffect } from "react";
import "../styles/HeaderFooter.css";
import { API_BASE_URL } from "../config/api";

function ModalLogin({ show, onClose, onLogin, onShowRegister, onShowForgot }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // const [loading, setLoading] = useState(false); // para simular que revisa a la bd
  const [showPassword1, setShowPassword1] = useState(false);

  useEffect(() => {
    const nombreGuardado = localStorage.getItem("nombreUsuario");
    const emailGuardado = localStorage.getItem("emailUsuario");

    if (nombreGuardado) setNombre(nombreGuardado);
    if (emailGuardado) setEmail(emailGuardado);
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // setLoading(true);

    // Simular retraso
    setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        // setLoading(false);

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Error al iniciar sesión");
          return;
        }

        const data = await res.json();

        localStorage.setItem("nombreUsuario", data.usuario.nombre);
        localStorage.setItem("emailUsuario", data.usuario.email);
        localStorage.setItem("rolUsuario", data.usuario.rol);
        console.log("Rol del usuario logueado:", data.usuario.rol);

        // pasamos el token al contexto
        onLogin(data.token);
        onClose();
      } catch (err) {
        console.error(err);
        setError("No se pudo conectar con el servidor");
        // setLoading(false);
      }
    }, 1500); // 1.5 segundos de “revisión” de la bd
  };

  if (!show) return null; // Si show es false, no renderiza nada

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
          <button type="submit" className="button-submit">
            Iniciar Sesión
          </button>

          <p className="registro-texto">
            ¿Aún no tenés usuario?{" "}
            <span
              className="link-registrate"
              onClick={() => {
                onClose(); // cerramos este modal
                if (onShowRegister) onShowRegister(); // mostramos modal de registro
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
