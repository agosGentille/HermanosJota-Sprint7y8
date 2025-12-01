import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "../styles/DetalleCompraUsuario.css";

const DetalleCompraUsuario = () => {
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCompra = async () => {
      try {
        console.log("🔄 Cargando compra con ID:", id);
        
        const res = await fetch(`${API_BASE_URL}/compras/mis-compras/${id}`, {
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
        });
        
        console.log("📡 Respuesta:", res.status);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Error ${res.status}`);
        }
        
        const data = await res.json();
        console.log("✅ Datos recibidos:", data);
        
        if (data.success && data.compra) {
          setCompra(data.compra);
        } else {
          throw new Error(data.error || "Error al cargar la compra");
        }
      } catch (err) {
        console.error("❌ Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchCompra();
    } else {
      setError("ID de compra o token no válido");
      setLoading(false);
    }
  }, [id, token]);

  const handleVolver = () => {
    navigate("/mis-compras");
  };

  // Función para formatear estado
  const formatearEstado = (estado) => {
    const estados = {
      pendiente: "Pendiente",
      confirmado: "Confirmado", 
      preparando: "Preparando",
      enviado: "En camino",
      entregado: "Entregado",
      cancelado: "Cancelado"
    };
    return estados[estado] || estado;
  };

  if (loading) {
    return (
      <div className="detalle-compra-usuario">
        <div className="loading">Cargando detalles de tu compra...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detalle-compra-usuario">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleVolver} className="btn-volver">
            Volver a Mis Compras
          </button>
        </div>
      </div>
    );
  }

  if (!compra) {
    return (
      <div className="detalle-compra-usuario">
        <div className="error-message">
          <h2>Compra no encontrada</h2>
          <p>La compra solicitada no existe o no se pudo cargar.</p>
          <button onClick={handleVolver} className="btn-volver">
            Volver a Mis Compras
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detalle-compra-usuario">
      <div className="header-actions">
        <button onClick={handleVolver} className="btn-volver">
          ← Volver a Mis Compras
        </button>
        <h2>Detalle de tu Compra #{compra.nroCompra}</h2>
      </div>
      
      <div className="compra-info">
        <div className="info-section">
          <h3>Información del Pedido</h3>
          <p><strong>Número de Compra:</strong> #{compra.nroCompra}</p>
          <p><strong>Fecha:</strong> {new Date(compra.fechaCompra).toLocaleDateString()}</p>
          <p><strong>Estado:</strong> 
            <span className={`estado estado-${compra.estado}`}>
              {formatearEstado(compra.estado)}
            </span>
          </p>
          <p><strong>Método de Pago:</strong> {compra.pago?.metodo}</p>
          <p><strong>Estado de Pago:</strong> 
            <span className={`pago pago-${compra.pago?.estado}`}>
              {compra.pago?.estado}
            </span>
          </p>
        </div>

        <div className="info-section">
          <h3>Información de Envío</h3>
          <p><strong>Nombre:</strong> {compra.nombreCompleto}</p>
          <p><strong>Email:</strong> {compra.email}</p>
          <p><strong>Teléfono:</strong> {compra.telefono}</p>
          <p><strong>DNI:</strong> {compra.dni}</p>
          <p><strong>Dirección:</strong> {compra.direccionCalle}, {compra.direccionLocalidad}</p>
          <p><strong>Provincia:</strong> {compra.direccionProvincia}, {compra.direccionPais}</p>
          {compra.codigoPostal && <p><strong>Código Postal:</strong> {compra.codigoPostal}</p>}
        </div>
      </div>

      <div className="productos-section">
        <h3>Productos ({compra.productos?.length || 0})</h3>
        {compra.productos && compra.productos.length > 0 ? (
          <div className="productos-list">
            {compra.productos.map((producto, index) => (
              <div key={index} className="producto-item">
                <img 
                  src={producto.imagen || producto.productoId?.imagenURL || "/imagen-placeholder.jpg"} 
                  alt={producto.nombre}
                  className="producto-imagen"
                  onError={(e) => {
                    e.target.src = "/imagen-placeholder.jpg";
                  }}
                />
                <div className="producto-info">
                  <h4>{producto.nombre}</h4>
                  <p className="producto-descripcion">
                    {producto.productoId?.descripcion || "Sin descripción disponible"}
                  </p>
                  <div className="producto-detalles">
                    <p><strong>Precio unitario:</strong> ${producto.precio?.toLocaleString()}</p>
                    <p><strong>Cantidad:</strong> {producto.cantidad}</p>
                    <p><strong>Subtotal:</strong> ${((producto.precio || 0) * (producto.cantidad || 0)).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-productos">No se encontraron productos en esta compra</p>
        )}
      </div>

      <div className="totales-section">
        <h3>Resumen de Pago</h3>
        <div className="total-line">
          <span>Subtotal:</span>
          <span>${compra.subtotal?.toLocaleString() || "0"}</span>
        </div>
        <div className="total-line">
          <span>Costo de Envío:</span>
          <span>${compra.costoEnvio?.toLocaleString() || "0"}</span>
        </div>
        <div className="total-line total-final">
          <span><strong>Total:</strong></span>
          <span><strong>${compra.total?.toLocaleString() || "0"}</strong></span>
        </div>
      </div>

      {compra.nota && (
        <div className="nota-section">
          <h3>Nota Adicional</h3>
          <p>{compra.nota}</p>
        </div>
      )}
    </div>
  );
};

export default DetalleCompraUsuario;