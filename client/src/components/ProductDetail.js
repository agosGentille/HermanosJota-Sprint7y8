import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import '../styles/productDetail.css';
import { API_BASE_URL } from '../config/api';
import { useCarrito } from '../context/CarritoContext'; // ✅ Ruta corregida
import { AuthContext } from '../context/AuthContext'; // ✅ Importar AuthContext

export default function ProductDetail({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarProducto } = useCarrito(); 
  const { esAdmin } = useContext(AuthContext); // ✅ Obtener esAdmin del contexto
  
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [images, setImages] = useState([]);
  const [backgroundPos, setBackgroundPos] = useState("0% 0%");

  useEffect(() => {
    console.log("ID desde URL:", id);
    setLoading(true);
    fetch(`${API_BASE_URL}/productos/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Producto no encontrado");
        return res.json();
      })
      .then(data => {
        // Mapear URLs de imágenes si es necesario
        const productoConUrls = {
          ...data,
          imagen: `${API_BASE_URL.replace('/api', '')}${data.imagen}`,
          imagenHover: data.imagenHover ? `${API_BASE_URL.replace('/api', '')}${data.imagenHover}` : null
        };
        
        setProducto(productoConUrls);
        setImages([
          productoConUrls.imagen, 
          productoConUrls.imagenHover || null
        ].filter(Boolean));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setBackgroundPos(`${x}% ${y}%`);
  };

  const handleAddToCart = () => {
    if (producto) {
      agregarProducto(producto);
      if (showToast) {
        showToast("Producto agregado al carrito", "success");
      }
    }
  };

  const handleEliminar = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`${API_BASE_URL}/productos/${producto._id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Error al eliminar el producto');
        }

        alert('Producto eliminado correctamente');
        navigate('/productos');
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el producto: ' + error.message);
      }
    }
  };
  
  if (loading) return <div className="container mt-4">Cargando...</div>;
  if (error) return <div className="container mt-4" style={{ color: "red" }}>{error}</div>;
  if (!producto) return <div className="container mt-4">Producto no encontrado</div>;
  
  return (
    <div>
      <div className="detalle_producto">
        <div className="producto-img">
          <div className="zoom-container">
            <div className="zoom-image">
              <img 
                src={images[currentImage]} 
                alt={producto.titulo} 
                className="imagen-principal" 
                onMouseMove={handleMouseMove}
              />
            </div>
            <div 
              className="zoom-lens" 
              style={{
                backgroundImage: `url(${images[currentImage]})`, 
                backgroundPosition: backgroundPos
              }}
            ></div>
          </div>
          <div className="miniaturas">
            {images.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`miniatura ${idx}`} 
                className={`miniatura ${currentImage === idx ? "activo" : ""}`} 
                onClick={() => setCurrentImage(idx)}
              />
            ))}
          </div>
        </div>
        <div className="detalle_contenido">
          <h2>{producto.titulo}</h2>
          <p className="precio">${producto.Precio ?? "Consultar"}.-</p>
          <p>{producto.descripcion}</p>
          <div className="detalle_info">
            {producto.medidas && <p><strong>Medidas:</strong> {producto.medidas}</p>}
            {producto.materiales && <p><strong>Materiales:</strong> {producto.materiales}</p>}
            {producto.acabado && <p><strong>Acabado:</strong> {producto.acabado}</p>}
            {producto.peso && <p><strong>Peso:</strong> {producto.peso}</p>}
            {producto.capacidad && <p><strong>Capacidad:</strong> {producto.capacidad}</p>}
            {producto.tapizado && <p><strong>Tapizado:</strong> {producto.tapizado}</p>}
            {producto.confort && <p><strong>Confort:</strong> {producto.confort}</p>}
            {producto.almacenamiento && <p><strong>Almacenamiento:</strong> {producto.almacenamiento}</p>}
            {producto.cables && <p><strong>Cables:</strong> {producto.cables}</p>}
            {producto.extension && <p><strong>Extensión:</strong> {producto.extension}</p>}
            {producto.carga_max && <p><strong>Carga máxima:</strong> {producto.carga_max}</p>}
            {producto.caracteristicas && <p><strong>Características:</strong> {producto.caracteristicas}</p>}
            {producto.regulacion && <p><strong>Regulación:</strong> {producto.regulacion}</p>}
            {producto.certificacion && <p><strong>Certificación:</strong> {producto.certificacion}</p>}
            {producto.apilables && <p><strong>Apilables:</strong> {producto.apilables}</p>}
            {producto.rotacion && <p><strong>Rotación:</strong> {producto.rotacion}</p>}
            {producto.garantia && <p><strong>Garantía:</strong> {producto.garantia}</p>}
            {producto.estructura && <p><strong>Estructura:</strong> {producto.estructura}</p>}
            {producto.sostenibilidad && <p><strong>Sostenibilidad:</strong> {producto.sostenibilidad}</p>}
            {producto.colchon && <p><strong>Colchón:</strong> {producto.colchon}</p>}
            {producto.stock !== undefined && <p><strong>Stock disponible:</strong> {producto.stock} unidades</p>}
          </div>
          
          <button className="btn-agregarcarrito" onClick={handleAddToCart}>
            Añadir al carrito
          </button>

          {esAdmin && ( // ✅ Usar esAdmin del contexto
            <div className="admin-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <Link 
                to={`/admin/editar-producto/${producto._id}`}
                className="btn-editar"
                style={{
                  background: '#ffc107',
                  color: '#212529',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Editar Producto
              </Link>
              <button 
                onClick={handleEliminar}
                className="btn-eliminar"
                style={{
                  background: '#dc3545',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Eliminar Producto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}