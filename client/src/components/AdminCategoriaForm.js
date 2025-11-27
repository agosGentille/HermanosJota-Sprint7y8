import React, { useState, useEffect } from "react";
import "../styles/AdminForm.css";
import { API_BASE_URL } from '../config/api';
const AdminCategoriaForm = ({ editMode = false, inPanel = false, showToast, categoriaId, onBackClick }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categoria, setCategoria] = useState({
    nombre: "",
    descripcion: "",
    activa: true
  });

  // Validaciones en tiempo real
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'nombre':
        if (!value || value.trim() === '') {
          newErrors.nombre = 'El nombre es obligatorio';
        } else {
          delete newErrors.nombre;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar formulario completo
  const validateForm = () => {
    const newErrors = {};
    
    if (!categoria.nombre || categoria.nombre.trim() === '') {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cargar categoría si está en modo edición
  useEffect(() => {
    if (editMode && categoriaId) {
      const fetchCategoria = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/categories/${categoriaId}`);
          if (!response.ok) throw new Error("Error cargando categoría");
          const data = await response.json();
          setCategoria(data);
        } catch (error) {
          console.error("Error:", error);
          if (showToast) {
            showToast("Error al cargar la categoría", "error");
          } else {
            alert("Error al cargar la categoría");
          }
        }
      };
      fetchCategoria();
    }
  }, [editMode, categoriaId, showToast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    
    setCategoria((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    validateField(name, fieldValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      if (showToast) {
        showToast("Por favor, corrige los errores en el formulario", "error");
      }
      return;
    }

    setLoading(true);

    try {
      const url = editMode && categoriaId
  ? `${API_BASE_URL}/categories/${categoriaId}`
  : `${API_BASE_URL}/categories`;

      const method = editMode && categoriaId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoria),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar la categoría");
      }

      if (showToast) {
        if (editMode) {
          showToast("¡Categoría actualizada correctamente!");
        } else {
          showToast("¡Categoría creada correctamente!");
        }
      }

      // Si está en panel, usar la función de retorno
      if (inPanel && onBackClick) {
        setTimeout(() => {
          onBackClick();
        }, 1500);
      } else {
        // Si no está en panel, redirigir (para uso futuro)
        setTimeout(() => {
          window.location.href = "/admin/categories";
        }, 1500);
      }

    } catch (error) {
      console.error("Error:", error);
      if (showToast) {
        showToast(error.message, "error");
      } else {
        alert(error.message);
      }
      setLoading(false);
    }
  };

  return (
    <div className={`admin-form-container ${inPanel ? 'in-panel' : 'standalone'}`}>
      <div className="admin-form-header">
        <h2>{editMode ? "Editar Categoría" : "Crear Nueva Categoría"}</h2>
        {inPanel && onBackClick ? (
          <button className="btn-volver" onClick={onBackClick}>
            ← Volver a Categorías
          </button>
        ) : (
          <button className="btn-volver" onClick={() => window.history.back()}>
            ← Volver
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Información Básica</h3>

          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={categoria.nombre}
              onChange={handleChange}
              required
              placeholder="Nombre de la categoría"
              className={errors.nombre ? 'error' : ''}
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={categoria.descripcion}
              onChange={handleChange}
              rows="3"
              placeholder="Descripción de la categoría"
            />
          </div>

          <div className="form-group form-checkbox">
            <input
              type="checkbox"
              name="activa"
              checked={categoria.activa}
              onChange={handleChange}
            />
            <label>Categoría activa</label>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-guardar" 
            disabled={loading || Object.keys(errors).length > 0}
          >
            {loading
              ? "Guardando..."
              : editMode
              ? "Actualizar Categoría"
              : "Crear Categoría"}
          </button>
          <button
            type="button"
            className="btn-cancelar"
            onClick={inPanel && onBackClick ? onBackClick : () => window.history.back()}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCategoriaForm;
