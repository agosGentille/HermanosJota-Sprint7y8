import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useContext(AuthContext);
  
  // PASO 1: Mientras está cargando, mostrar indicador
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  // PASO 2: Si no hay usuario, redirigir a login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // PASO 3: Si hay usuario, mostrar el contenido
  return children;
}

export default ProtectedRoute;