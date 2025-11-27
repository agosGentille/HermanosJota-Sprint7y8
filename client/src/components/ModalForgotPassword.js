import React, { useState, useEffect } from "react";
import '../styles/HeaderFooter.css';
import { validarEmail } from "../utils/validarEmail";
import ReCaptchaCheckbox from "./ReCaptchaCheckbox";
import { API_BASE_URL } from '../config/api';


function ModalForgotPassword({ show, onClose, onLogin, onShowLogin}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false); 
  const [showPassword2, setShowPassword2] = useState(false);

  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [errors, setErrors] = useState({ captcha: "" });
  

  const handleCaptchaVerify = (token) => {
    console.log("ReCAPTCHA verificado, token:", token);
    setCaptchaToken(token);
    setErrors((prev) => ({
      ...prev,
      captcha: "",
    }));
  };

  useEffect(() => {
    if (show) {
      setEmail("");
      setPassword("");
      setPassword2("");
      setError("");
      setCaptchaToken(null);
      setShowCaptcha(false);
    }
  }, [show]);

  if (!show) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
 
    if (!showCaptcha) {
      const { valido, error: emailError } = validarEmail(email);
      if (!valido) {
        setError(emailError);
        setLoading(false);
        return;
      }

      if (!password || !password2) {
        setError("Complete todos los campos");
        setLoading(false);
        return;
      }

      if (password !== password2) {
        setError("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }

      setShowCaptcha(true);
      setLoading(false);
      return;
    }

    if (!captchaToken) {
      setErrors((prev) => ({
        ...prev,
        captcha: "Por favor, complete el reCAPTCHA.",
      }));
      setLoading(false);
      return;
    }

    setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/usuario/password`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword: password, captchaToken })
        });

        setLoading(false);

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Error al cambiar la contraseña");
          return;
        }

        alert("Contraseña actualizada. Ahora inicia sesion");
        onClose();

        if (onShowLogin) onShowLogin();
      } catch (err) {
        setError("No se pudo conectar con el servidor");
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="modal" style={{ display: show ? 'flex' : 'none' }}>
      <div className="modal-content">
        <div className="botones-cerrar-volver">
          <span
            className="volver"
            onClick={() => {
              onClose();
              if (onShowLogin) onShowLogin();
            }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </span>
          <span className="close" onClick={onClose}>&times;</span>
        </div>
        <h2>Recuperar Contraseña</h2>
        <p className={`errorLogin ${error ? "active" : ""}`}>* {error}</p>
        <form onSubmit={handleSubmit} className="loginForm">
          <input
            type="email"
            required
            placeholder="Email registrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password">
            <input
              type={showPassword1 ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="material-symbols-outlined password-toggle"
              onClick={() => setShowPassword1(!showPassword1)}
            >
              {showPassword1 ? "visibility_off" : "visibility"}
            </span>
          </div>

          <div className="password">
            <input
              type={showPassword2 ? "text" : "password"}
              placeholder="Repetir nueva contraseña"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
            <span
              className="material-symbols-outlined password-toggle"
              onClick={() => setShowPassword2(!showPassword2)}
            >
              {showPassword2 ? "visibility_off" : "visibility"}
            </span>
          </div>

          {showCaptcha && (
            <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
              <ReCaptchaCheckbox
                siteKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onVerify={handleCaptchaVerify}
              />
              {errors.captcha && (
                <span
                  className="error-message"
                  role="alert"
                  style={{ display: "block", marginTop: "0.5rem" }}
                >
                  ⚠️ {errors.captcha}
                </span>
              )}
            </div>
          )}
          
          <button type="submit" className="button-submit">
            {loading 
                ? "Procesando..." 
                : showCaptcha
                ? "Cambiar Contraseña"
                : "Continuar"
            }
          </button>
        </form>
      </div>
    </div>
  );
}

export default ModalForgotPassword;