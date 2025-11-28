import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/AdminForm.css";
import { API_BASE_URL } from '../config/api';

const AdminProductForm = ({ editMode = false, inPanel = false, showToast }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [producto, setProducto] = useState({
    id: "",
    titulo: "",
    descripcion: "",
    Precio: "",
    categoria: "",
    medidas: "",
    materiales: "",
    acabado: "",
    peso: "",
    capacidad: "",
    tapizado: "",
    confort: "",
    almacenamiento: "",
    cables: "",
    extension: "",
    carga_max: "",
    caracteristicas: "",
    regulacion: "",
    certificacion: "",
    apilables: "",
    incluye: "",
    rotacion: "",
    garantia: "",
    estructura: "",
    sostenibilidad: "",
    colchon: "",
    masVendidos: false,
    stock: 0, 
    imagen: "",
    imagenHover: "",
  });

  // Validaciones en tiempo real
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'titulo':
        if (!value || value.trim() === '') {
          newErrors.titulo = 'El título es obligatorio';
        } else {
          delete newErrors.titulo;
        }
        break;
      case 'Precio':
        if (!value || parseFloat(value) <= 0) {
          newErrors.Precio = 'El precio debe ser mayor a 0';
        } else {
          delete newErrors.Precio;
        }
        break;
      case 'categoria':
        if (!value || value.trim() === '') {
          newErrors.categoria = 'La categoría es obligatoria';
        } else {
          delete newErrors.categoria;
        }
        break;
      case 'id':
        if (!value || value.trim() === '') {
          newErrors.id = 'El ID es obligatorio';
        } else {
          delete newErrors.id;
        }
        break;
      case 'stock':
        if (value < 0) {
          newErrors.stock = 'El stock no puede ser negativo';
        } else {
          delete newErrors.stock;
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
    
    if (!producto.titulo || producto.titulo.trim() === '') {
      newErrors.titulo = 'El título es obligatorio';
    }
    if (!producto.Precio || parseFloat(producto.Precio) <= 0) {
      newErrors.Precio = 'El precio debe ser mayor a 0';
    }
    if (!producto.categoria || producto.categoria.trim() === '') {
      newErrors.categoria = 'La categoría es obligatoria';
    }
    if (!producto.id || producto.id.trim() === '') {
      newErrors.id = 'El ID es obligatorio';
    }
    if (producto.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cargar producto si está en modo edición
  useEffect(() => {
    if (editMode && id) {
      const fetchProducto = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/productos/${id}`);
          if (!response.ok) throw new Error("Error cargando producto");
          const data = await response.json();
          setProducto(data);
        } catch (error) {
          console.error("Error:", error);
          if (showToast) {
            showToast("Error al cargar el producto", "error");
          } else {
            alert("Error al cargar el producto");
          }
        }
      };
      fetchProducto();
    }
  }, [editMode, id, showToast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    
    setProducto((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Validar campo en tiempo real
    if (type === "number") {
      validateField(name, parseFloat(fieldValue) || 0);
    } else {
      validateField(name, fieldValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario completo antes de enviar
    if (!validateForm()) {
      if (showToast) {
        showToast("Por favor, corrige los errores en el formulario", "error");
      }
      return;
    }

    setLoading(true);

    try {
      const url = editMode
  ? `${API_BASE_URL}/productos/${id}`
  : `${API_BASE_URL}/productos`;

      const method = editMode ? "PUT" : "POST";

      // Preparar datos para enviar (convertir tipos numéricos)
      const datosEnviar = {
        ...producto,
        Precio: parseFloat(producto.Precio),
        stock: parseInt(producto.stock) || 0
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosEnviar),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar el producto");
      }

      if (showToast) {
        if (editMode) {
          showToast("¡Producto actualizado correctamente!");
        } else {
          showToast("¡Producto creado correctamente!");
        }
      }

      setTimeout(() => {
        navigate("/productos");
      }, 1500);

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

  useEffect(() => {
  const fetchCategorias = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };
  fetchCategorias();
}, []);

  return (
    <div className={`admin-form-container ${inPanel ? 'in-panel' : 'standalone'}`}>
      <div className="admin-form-header">
        <h2>{editMode ? "Editar Producto" : "Crear Nuevo Producto"}</h2>
        <button className="btn-volver" onClick={() => navigate("/productos")}>
          ← Ver Catálogo
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-section">
          <h3>Información Básica</h3>

          <div className="form-group">
            <label>ID * (Identificador único)</label>
            <input
              type="text"
              name="id"
              value={producto.id}
              onChange={handleChange}
              required
              disabled={editMode}
              placeholder="Ej: silla-ergonomica-001"
              className={errors.id ? 'error' : ''}
            />
            {errors.id && <span className="error-message">{errors.id}</span>}
            <small>Este ID debe ser único y no podrá cambiarse después</small>
          </div>

          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              name="titulo"
              value={producto.titulo}
              onChange={handleChange}
              required
              placeholder="Nombre del producto"
              className={errors.titulo ? 'error' : ''}
            />
            {errors.titulo && <span className="error-message">{errors.titulo}</span>}
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={producto.descripcion}
              onChange={handleChange}
              rows="3"
              placeholder="Descripción detallada del producto"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio *</label>
              <input
                type="number"
                name="Precio"
                value={producto.Precio}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className={errors.Precio ? 'error' : ''}
              />
              {errors.Precio && <span className="error-message">{errors.Precio}</span>}
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                name="stock"
                value={producto.stock}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className={errors.stock ? 'error' : ''}
              />
              {errors.stock && <span className="error-message">{errors.stock}</span>}
            </div>
              <div className="form-group">
                <label>Categoría *</label>
                <select
                  name="categoria"
                  value={producto.categoria}
                  onChange={handleChange}
                  required
                  className={errors.categoria ? 'error' : ''}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                {errors.categoria && <span className="error-message">{errors.categoria}</span>}
              </div>
          </div>

          <div className="form-group form-checkbox">
            <input
              type="checkbox"
              name="masVendidos"
              checked={producto.masVendidos}
              onChange={handleChange}
            />
            <label>Marcar como producto más vendido</label>
          </div>
        </div>

        <div className="form-section">
          <h3>Imágenes</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Imagen Principal</label>
              <input
                type="text"
                name="imagen"
                value={producto.imagen}
                onChange={handleChange}
                placeholder="/Images/ruta-imagen-principal.jpg"
              />
              <small>Ruta relativa desde la carpeta public</small>
            </div>
            <div className="form-group">
              <label>Imagen Hover</label>
              <input
                type="text"
                name="imagenHover"
                value={producto.imagenHover}
                onChange={handleChange}
                placeholder="/Images/ruta-imagen-hover.jpg"
              />
              <small>Imagen que se muestra al pasar el mouse</small>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Especificaciones Técnicas</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Medidas</label>
              <input
                type="text"
                name="medidas"
                value={producto.medidas}
                onChange={handleChange}
                placeholder="Ej: 200x90x85 cm"
              />
            </div>
            <div className="form-group">
              <label>Materiales</label>
              <input
                type="text"
                name="materiales"
                value={producto.materiales}
                onChange={handleChange}
                placeholder="Materiales utilizados"
              />
            </div>
            <div className="form-group">
              <label>Acabado</label>
              <input
                type="text"
                name="acabado"
                value={producto.acabado}
                onChange={handleChange}
                placeholder="Tipo de acabado"
              />
            </div>
            <div className="form-group">
              <label>Peso</label>
              <input
                type="text"
                name="peso"
                value={producto.peso}
                onChange={handleChange}
                placeholder="Ej: 25 kg"
              />
            </div>
            <div className="form-group">
              <label>Capacidad</label>
              <input
                type="text"
                name="capacidad"
                value={producto.capacidad}
                onChange={handleChange}
                placeholder="Capacidad de carga"
              />
            </div>
            <div className="form-group">
              <label>Tapizado</label>
              <input
                type="text"
                name="tapizado"
                value={producto.tapizado}
                onChange={handleChange}
                placeholder="Tipo de tapizado"
              />
            </div>
          </div>
        </div>

        
        <div className="form-section">
          <h3>Características de Confort</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Confort</label>
              <input
                type="text"
                name="confort"
                value={producto.confort}
                onChange={handleChange}
                placeholder="Características de confort"
              />
            </div>
            <div className="form-group">
              <label>Almacenamiento</label>
              <input
                type="text"
                name="almacenamiento"
                value={producto.almacenamiento}
                onChange={handleChange}
                placeholder="Capacidades de almacenamiento"
              />
            </div>
            <div className="form-group">
              <label>Regulación</label>
              <input
                type="text"
                name="regulacion"
                value={producto.regulacion}
                onChange={handleChange}
                placeholder="Sistemas de regulación"
              />
            </div>
            <div className="form-group">
              <label>Rotación</label>
              <input
                type="text"
                name="rotacion"
                value={producto.rotacion}
                onChange={handleChange}
                placeholder="Grados de rotación"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Características Adicionales</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Cables</label>
              <input
                type="text"
                name="cables"
                value={producto.cables}
                onChange={handleChange}
                placeholder="Incluye cables"
              />
            </div>
            <div className="form-group">
              <label>Extensión</label>
              <input
                type="text"
                name="extension"
                value={producto.extension}
                onChange={handleChange}
                placeholder="Longitud de extensión"
              />
            </div>
            <div className="form-group">
              <label>Carga Máxima</label>
              <input
                type="text"
                name="carga_max"
                value={producto.carga_max}
                onChange={handleChange}
                placeholder="Peso máximo soportado"
              />
            </div>
            <div className="form-group">
              <label>Características</label>
              <input
                type="text"
                name="caracteristicas"
                value={producto.caracteristicas}
                onChange={handleChange}
                placeholder="Otras características"
              />
            </div>
          </div>
        </div>

        
        <div className="form-section">
          <h3>Certificaciones y Garantía</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Certificación</label>
              <input
                type="text"
                name="certificacion"
                value={producto.certificacion}
                onChange={handleChange}
                placeholder="Certificaciones del producto"
              />
            </div>
            <div className="form-group">
              <label>Garantía</label>
              <input
                type="text"
                name="garantia"
                value={producto.garantia}
                onChange={handleChange}
                placeholder="Ej: 2 años"
              />
            </div>
            <div className="form-group">
              <label>Estructura</label>
              <input
                type="text"
                name="estructura"
                value={producto.estructura}
                onChange={handleChange}
                placeholder="Tipo de estructura"
              />
            </div>
            <div className="form-group">
              <label>Sostenibilidad</label>
              <input
                type="text"
                name="sostenibilidad"
                value={producto.sostenibilidad}
                onChange={handleChange}
                placeholder="Características sostenibles"
              />
            </div>
          </div>
        </div>

       
        <div className="form-section">
          <h3>Características Específicas</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Apilables</label>
              <input
                type="text"
                name="apilables"
                value={producto.apilables}
                onChange={handleChange}
                placeholder="¿Es apilable?"
              />
            </div>
            <div className="form-group">
              <label>Incluye</label>
              <input
                type="text"
                name="incluye"
                value={producto.incluye}
                onChange={handleChange}
                placeholder="Elementos incluidos"
              />
            </div>
            <div className="form-group">
              <label>Colchón</label>
              <input
                type="text"
                name="colchon"
                value={producto.colchon}
                onChange={handleChange}
                placeholder="Especificaciones del colchón"
              />
            </div>
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
              ? "Actualizar Producto"
              : "Crear Producto"}
          </button>
          <button
            type="button"
            className="btn-cancelar"
            onClick={() => navigate("/admin")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
