import React, { useState, useEffect } from "react";
import "../styles/AdminList.css";
import { API_BASE_URL } from '../config/api';

const AdminCategoriasList = ({ showToast, onAddCategoryClick, onEditCategory }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      } else {
        throw new Error('Error al cargar categorías');
      }
    } catch (error) {
      console.error("Error:", error);
      if (showToast) {
        showToast("Error al cargar las categorías", "error");
      } else {
        alert("Error al cargar las categorías");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta categoría?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          if (showToast) {
            showToast("Categoría eliminada correctamente");
          }
          fetchCategorias(); // Recargar la lista
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al eliminar la categoría");
        }
      } catch (error) {
        console.error("Error:", error);
        if (showToast) {
          showToast(error.message, "error");
        } else {
          alert(error.message);
        }
      }
    }
  };

  if (loading) {
    return <div className="loading">Cargando categorías...</div>;
  }

  return (
    <div className="admin-list-container">
      <div className="admin-list-header">
        <h2>Gestión de Categorías</h2>
        <button 
          className="btn-agregar"
          onClick={onAddCategoryClick}
        >
          + Agregar Categoría
        </button>
      </div>

      <div className="admin-list">
        {categorias.length === 0 ? (
          <div className="no-data">
            <p>No hay categorías registradas.</p>
            <button 
              className="btn-agregar"
              onClick={onAddCategoryClick}
            >
              + Crear Primera Categoría
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map(categoria => (
                <tr key={categoria._id}>
                  <td>{categoria.nombre}</td>
                  <td>{categoria.descripcion || "-"}</td>
                  <td>
                    <span className={`badge ${categoria.activa ? 'activo' : 'inactivo'}`}>
                      {categoria.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="acciones">
                    <button
                      className="btn-editar"
                      onClick={() => onEditCategory(categoria._id)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-eliminar"
                      onClick={() => handleDelete(categoria._id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminCategoriasList;
