import React, { useState, useEffect, useRef } from "react";
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
import { cargarCarrito, guardarCarrito } from "./components/CarritoStorage";
import Producto from "./pages/Productos";
import {
  agregarProducto,
  eliminarProducto,
  vaciarCarrito,
  sumarCantidad,
  restarCantidad,
  calcularTotal,
} from "./components/CarritoFunciones";
import Admin from "./pages/Admin";
import AdminPage from "./pages/Admin";
import AdminProductForm from "./components/AdminProductForm";
import ToastContainer from "./components/ToastContainer";
import useToast from "./hooks/useToast";

function App() {
  const [isCarritoAbierto, setIsCarritoAbierto] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const saveTimeout = useRef(null);
  const toggleCarrito = () => setIsCarritoAbierto((prev) => !prev);
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

  // Cargar carrito y usuario al iniciar
  useEffect(() => {
    const usuarioEmail = cargarUsuario();
    const initCarrito = async () => {
      const data = await cargarCarrito(usuarioEmail);
      setCarrito(data || []);
    };
    initCarrito();
  }, []);

  // Escuchar cambios en localStorage para actualizar usuario
  useEffect(() => {
    const handleStorageChange = () => {
      cargarUsuario();
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(cargarUsuario);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Guardar carrito en localStorage y backend
  useEffect(() => {
    localStorage.setItem("productos-en-carrito", JSON.stringify(carrito));
    const usuarioEmail = localStorage.getItem("emailUsuario");
    if (usuarioEmail) {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        guardarCarrito(usuarioEmail, carrito);
      }, 1000);
      return () => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
      };
    }
  }, [carrito]);

  const total = calcularTotal(carrito);

  const carritoFunciones = {
    agregarProducto: (producto) => {
      agregarProducto(carrito, setCarrito, producto);
      showToast("Producto agregado al carrito", "success");
    },
    eliminarProducto: (id) => eliminarProducto(carrito, setCarrito, id),
    vaciarCarrito: () => vaciarCarrito(setCarrito),
    sumarCantidad: (id) => sumarCantidad(carrito, setCarrito, id),
    restarCantidad: (id) => restarCantidad(carrito, setCarrito, id),
  };

  const handleLogout = () => {
    localStorage.clear();
    setUsuario(null);
    window.location.href = "/";
  };

  const esAdmin = usuario && usuario.rol === "administrador";
  const esEditor = usuario && usuario.rol === "editor";

  return (
    <Router>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <Header
        toggleCarrito={toggleCarrito}
        carrito={carrito}
        usuario={usuario}
        esAdmin={esAdmin}
        esEditor={esEditor}
        onLogout={handleLogout}
      />
      <CarritoLateral
        isAbierto={isCarritoAbierto}
        toggleCarrito={toggleCarrito}
        carrito={carrito}
        total={total}
        {...carritoFunciones}
      />
      <Routes>
        <Route
          path="/"
          element={<Home onAddToCart={carritoFunciones.agregarProducto} />}
        />
        <Route
          path="/carrito"
          element={<Carrito carrito={carrito} {...carritoFunciones} />}
        />
        <Route
          path="/productos"
          element={<Producto onAddToCart={carritoFunciones.agregarProducto} />}
        />
        <Route path="/contacto" element={<Contacto />} />
        <Route
          path="/ProductDetail/:id"
          element={
            <ProductDetail
              onAddToCart={carritoFunciones.agregarProducto}
              esAdmin={esAdmin}
              showToast={showToast}
            />
          }
        />
        <Route
          path="/profile"
          element={<PerfilUsuario usuario={usuario} onLogout={handleLogout} />}
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
  );
}

export default App;
