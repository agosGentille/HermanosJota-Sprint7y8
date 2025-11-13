import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import PerfilUsuario from "./pages/PerfilUsuario";
import ProductDetail from "./components/ProductDetail";
import Contacto from "./pages/Contacto";
import Carrito from "./pages/Carrito";
import CarritoLateral from "./components/CarritoLateral";
import Producto from "./pages/Productos";
import AdminPage from "./pages/Admin";
import AdminProductForm from "./components/AdminProductForm";
import ToastContainer from "./components/ToastContainer";
import useToast from "./hooks/useToast";
import ProtectedRoute from "./components/ProtectedRoute";
import { CarritoProvider } from "./context/CarritoContext";
function App() {
  const [usuario, setUsuario] = useState(null);
  const { toasts, showToast, removeToast } = useToast();

  // Función para verificar y cargar el usuario
  const cargarUsuario = () => {
    const usuarioEmail = localStorage.getItem("emailUsuario");
    const rolUsuario = localStorage.getItem("rolUsuario");

    if (usuarioEmail && rolUsuario) {
      setUsuario((prev) => {
        if (prev?.email === usuarioEmail && prev?.rol === rolUsuario) {
          return prev; // evita re-render si no cambió nada
        }
        return { email: usuarioEmail, rol: rolUsuario };
      });
    } else {
      setUsuario((prev) => (prev ? null : prev)); // evita cambios innecesarios
    }
  };

  // Cargar usuario al iniciar
  useEffect(() => {
    cargarUsuario();
  }, []);

  // Escuchar cambios en localStorage para actualizar usuario
  useEffect(() => {
    const handleStorageChange = () => {
      cargarUsuario();
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(cargarUsuario, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUsuario(null);
    window.location.href = "/";
  };

  const esAdmin = usuario && usuario.rol === "administrador";
  const esEditor = usuario && usuario.rol === "editor";

  return (
    <CarritoProvider>
      <Router>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        
        <Header
          usuario={usuario}
          esAdmin={esAdmin}
          esEditor={esEditor}
          onLogout={handleLogout}
        />
        
        <CarritoLateral />
        
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route
            path="/carrito"
            element={
              <ProtectedRoute>
                <Carrito />
              </ProtectedRoute>
            }
          />
          
          <Route path="/productos" element={<Producto />} />
          
          <Route path="/contacto" element={<Contacto />} />
          
          <Route
            path="/ProductDetail/:id"
            element={
              <ProductDetail
                esAdmin={esAdmin}
                showToast={showToast}
              />
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PerfilUsuario usuario={usuario} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          {/* CRUD de productos: admin y editor */}
          <Route
            path="/admin/crear-producto"
            element={
              esAdmin || esEditor ? (
                <AdminProductForm showToast={showToast} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/admin/editar-producto/:id"
            element={
              esAdmin || esEditor ? (
                <AdminProductForm editMode={true} showToast={showToast} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* CRUD de usuarios: solo admin */}
          <Route
            path="/admin"
            element={
              esAdmin || esEditor ? (
                <AdminPage showToast={showToast} usuario={usuario} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
        <Footer />
      </Router>
    </CarritoProvider>
  );
}

export default App;