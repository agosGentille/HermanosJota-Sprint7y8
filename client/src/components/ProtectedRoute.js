import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children, adminOnly = false }) {
  const { usuario, esAdmin, esEditor } = useContext(AuthContext);
  
  // Si no hay usuario, redirigir al home
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  // Si la ruta es solo para admin/editor y el usuario no es ninguno, redirigir
  if (adminOnly && !esAdmin && !esEditor) {
    return <Navigate to="/" replace />;
  }
  
  // Si pasa todas las validaciones, mostrar el contenido
  return children;
}

export default ProtectedRoute;