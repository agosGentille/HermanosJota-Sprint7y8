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
import MisComprasUsuario from "./pages/MisComprasUsuario";
import DetalleCompra from "./pages/DetalleCompra";
import ProductDetail from "./components/ProductDetail";
import Contacto from "./pages/Contacto";
import Carrito from "./pages/Carrito";
import CarritoLateral from "./components/CarritoLateral";
import Producto from "./pages/Productos";
import AdminPage from "./pages/Admin";
import AdminProductForm from "./components/AdminProductForm";
import AdminComprasList from "./components/AdminCompras";
import ToastContainer from "./components/ToastContainer";
import useToast from "./hooks/useToast";
import ProtectedRoute from "./components/ProtectedRoute";
import { CarritoProvider } from "./context/CarritoContext";
import { AuthProvider } from "./context/AuthContext";
import NotFound from './components/Notfound';
import Checkout from './components/Checkout';
import ConfirmacionCompra from './pages/ComfirmacionCompra';
import AdminDetalleCompra from "./components/AdminDetalleCompra"; 
import DetalleCompraUsuario from "./components/DetalleCompraUsuario";

import './styles/Theme.css';

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
                  <Carrito />
              }
            />
            <Route path="/checkout" element={<Checkout />} />
            
            <Route 
              path="/confirmacion-compra" 
              element={
                <ProtectedRoute>
                  <ConfirmacionCompra />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/productos" element={<Producto showToast={showToast} />} />
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

            <Route
              path="/mis-compras"
              element={
                <ProtectedRoute>
                  <MisComprasUsuario />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mis-compras/:id"
              element={
                <ProtectedRoute>
                  <DetalleCompraUsuario />
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
              path="/admin/ver-compras/"
              element={
                <ProtectedRoute adminOnly>
                  <AdminComprasList editMode={true} showToast={showToast} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/detalle-compra/:id"
              element={
               <AdminDetalleCompra />              
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
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <Footer />
        </Router>
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App;
