import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
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
import { AuthProvider } from "./context/AuthContext";

function App() {
  const { toasts, showToast, removeToast } = useToast();

  return (
    <AuthProvider>
      <CarritoProvider>
        <Router>
          <ToastContainer toasts={toasts} removeToast={removeToast} />
          
          <Header />
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
              element={<ProductDetail showToast={showToast} />}
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PerfilUsuario />
                </ProtectedRoute>
              }
            />

            {/* Rutas de administración */}
            <Route
              path="/admin/crear-producto"
              element={
                <ProtectedRoute adminOnly>
                  <AdminProductForm showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/editar-producto/:id"
              element={
                <ProtectedRoute adminOnly>
                  <AdminProductForm editMode={true} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPage showToast={showToast} />
                </ProtectedRoute>
              }
            />
          </Routes>
          
          <Footer />
        </Router>
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App;