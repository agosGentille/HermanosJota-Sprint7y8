import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ModalLogin from "./ModalLogin";
import ModalRegister from "./ModalRegister";
import ModalForgotPassword from "./ModalForgotPassword";
import "../styles/HeaderFooter.css";
/*Imports de Imágenes*/
import logo from "../images/logo.svg";
import menu from "../images/iconoMenu.png";

function Header({ toggleCarrito, carrito }) {
  const [showLogin, setShowLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showRegister, setShowRegister] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { usuario, login, logout, esAdmin, esEditor } = useContext(AuthContext);

  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // const handleLogoutClick = () => {
  //   if (window.confirm("¿Desea cerrar sesión?")) {
  //     onLogout();
  //     setShowUserMenu(false);
  //     if (location.pathname === "/profile") {
  //       navigate("/");
  //     }
  //   }
  // };

  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (carrito.length > 0) {
      setBounce(true);
      const timeout = setTimeout(() => setBounce(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [carrito]);

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
        {/* Icono usuario */}
        <div className="user-container" ref={userMenuRef}>
          <span
            className={`material-symbols-outlined header-usuario ${
              usuario ? "logueado" : ""
            }`}
            onClick={() => {
              if (usuario) {
                setShowUserMenu((prev) => !prev);
              } else {
                setShowLogin(true);
              }
            }}
            title={usuario ? "Usuario" : "Iniciar sesión"}
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
            // Esta función se llamará cuando el login sea exitoso
            // El estado de usuario se manejará en App.js a través de localStorage
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
            // Esta función se llamará cuando el registro sea exitoso
            // El estado de usuario se manejará en App.js a través de localStorage
            setShowRegister(false);
          }}
          onShowLogin={() => setShowLogin(true)}
        />
        <ModalForgotPassword
          show={showForgot}
          onClose={() => setShowForgot(false)}
        />

        {/* Carrito */}
        <div className="header-carrito-container" onClick={toggleCarrito}>
          <span
            className="header-carrito material-symbols-outlined"
            title="Carrito"
          >
            shopping_bag
          </span>
          <span className={`numerito ${bounce ? "bounce" : ""}`}>
            {carrito.length}
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
