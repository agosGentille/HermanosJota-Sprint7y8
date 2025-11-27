import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminProductList.css";
import { API_BASE_URL } from '../config/api';

const AdminProductList = ({ onAddProductClick, showToast }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/productos`);

        if (!response.ok) throw new Error("Error cargando productos");
        const data = await response.json();
const productosConUrls = data.map((p) => ({
  ...p,
  imagen: `${API_BASE_URL.replace('/api', '')}${p.imagen}`,
  imagenHover: p.imagenHover ? 
    `${API_BASE_URL.replace('/api', '')}${p.imagenHover}` : 
    `${API_BASE_URL.replace('/api', '')}${p.imagen}`
}));
setProductos(productosConUrls);
      } catch (error) {
        console.error("Error:", error);
        if (showToast) {
          showToast("Error al cargar los productos", "error");
        } else {
          alert("Error al cargar los productos");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, [showToast]);

  const eliminarProducto = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Error al eliminar producto");

        // Actualizar lista
        setProductos(productos.filter(producto => producto.id !== id));
        
        // Mostrar notificación
        if (showToast) {
          showToast("Producto eliminado correctamente", "success");
        } else {
          alert("Producto eliminado correctamente");
        }
      } catch (error) {
        console.error("Error:", error);
        if (showToast) {
          showToast("Error al eliminar el producto", "error");
        } else {
          alert("Error al eliminar el producto");
        }
      }
    }
  };

  const editarProducto = (id) => {
    navigate(`/admin/editar-producto/${id}`);
  };

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <div className="admin-product-list">
      <div className="admin-product-header">
        <h2>Gestión de Productos</h2>
        <button className="btn-agregar" onClick={onAddProductClick}>
          + Agregar Producto
        </button>
      </div>

      <div className="productos-grid">
        {productos.length === 0 ? (
          <div className="no-products">No hay productos registrados</div>
        ) : (
          productos.map((producto) => (
            <div key={producto.id} className="producto-card">
              <div className="producto-imagen">
                <img 
                  src={producto.imagen} 
                  alt={producto.titulo}
                  onError={(e) => {
                    e.target.src = "/Images/placeholder.jpg";
                  }}
                />
              </div>
              <div className="producto-info">
                <h3>{producto.titulo}</h3>
                <p className="producto-id">ID: {producto.id}</p>
                <p className="producto-precio">${producto.Precio}</p>
                <p className="producto-stock">Stock: {producto.stock}</p>
                {producto.masVendidos && (
                  <span className="badge-mas-vendido">Más Vendido</span>
                )}
              </div>
              <div className="producto-actions">
                <button 
                  className="btn-editar"
                  onClick={() => editarProducto(producto.id)}
                >
                  Editar
                </button>
                <button 
                  className="btn-eliminar"
                  onClick={() => eliminarProducto(producto.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminProductList;
