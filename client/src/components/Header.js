import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { useTheme } from "../context/ThemeContext";

import ModalLogin from "./ModalLogin";
import ModalRegister from "./ModalRegister";
import ModalForgotPassword from "./ModalForgotPassword";
import "../styles/HeaderFooter.css";
/*Imports de Imágenes*/
import logo from "../images/logo.svg";
import menu from "../images/iconoMenu.png";

function Header() { 
  const [showLogin, setShowLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showRegister, setShowRegister] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  
  const { usuario, login, logout, esAdmin, esEditor } = useContext(AuthContext);
  const { toggleCarrito, bounce, cantidadProductos } = useCarrito(); 
  const { theme, toggleTheme } = useTheme();

  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  

  return (
    <header className="header-sticky">
      <div className="header-marca">
        <img src={logo} alt="Logo Hermanos Jota" id="logo" />
        <p>Hermanos Jota</p>
      </div>

      <nav className={`header-nav ${isMobile && menuOpen ? "open" : ""}`}>
        {isMobile && (
          <span className="close" onClick={() => setMenuOpen(false)}>
            &times;
          </span>
        )}
        <ul>
          <li>
            <Link to="/">INICIO</Link>
          </li>
          <li>
            <Link to="/productos">PRODUCTOS</Link>
          </li>
          <li>
            <Link to="/contacto">CONTACTO</Link>
          </li>
          {/* Solo mostrar Administrar si es admin */}
          {(esAdmin || esEditor) && (
            <li>
              <Link to="/admin" className="admin-link">
                ADMINISTRAR
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div className="header-right">
        <div className="switch-theme">
            <button 
            className="theme-toggle material-symbols-outlined"
            onClick={toggleTheme}
            title="Cambiar tema"
          >
            {theme === "light" ? "dark_mode" : "light_mode"}
          </button>
        </div>
        {/* Icono usuario */}
        <div className="user-container" ref={userMenuRef}>

          <span
            className={`material-symbols-outlined header-usuario user-container ${
              usuario ? "logueado" : ""
            }`}
            onClick={() => {
              if (usuario) {
                setShowUserMenu((prev) => !prev);
              } else {
                setShowLogin(true);
              }
            }}
            title={usuario ? `${usuario?.nombre}` : "Iniciar sesión"}
          >
            account_circle
          </span>

          {/* Menú desplegable para cerrar sesion o ver perfil */}
          {usuario && showUserMenu && (
            <div className={`user-dropdown ${showUserMenu ? "show" : ""}`}>
              <button
                onClick={() => {
                  navigate("/profile");
                  setShowUserMenu(false);
                }}
              >
                Mi perfil
              </button>
              <button onClick={logout} className="logout-btn">
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

        {/* Modales */}
        <ModalLogin
          show={showLogin}
          onClose={() => setShowLogin(false)}
          onLogin={(token) => {
            login(token);
            setShowLogin(false);
          }}
          onShowRegister={() => setShowRegister(true)}
          onShowForgot={() => setShowForgot(true)}
        />
        <ModalRegister
          show={showRegister}
          onClose={() => setShowRegister(false)}
          onLogin={(userData) => {
            setShowRegister(false);
          }}
          onShowLogin={() => setShowLogin(true)}
        />
        <ModalForgotPassword
          show={showForgot}
          onClose={() => setShowForgot(false)}
        />

        
        <div className="header-carrito-container" onClick={toggleCarrito}>
          <span
            className="header-carrito material-symbols-outlined"
            title="Carrito"
          >
            shopping_bag
          </span>
          <span className={`numerito ${bounce ? "bounce" : ""}`}>
            {cantidadProductos} 
          </span>
        </div>

        {/* Menú hamburguesa para móvil */}
        {isMobile && (
          <img
            src={menu}
            alt="Icono Hamburguesa Menu"
            className="header-menu"
            onClick={() => setMenuOpen(true)}
          />
        )}
      </div>
    </header>
  );
}

export default Header;