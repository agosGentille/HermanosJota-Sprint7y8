import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "../styles/AdminDetalleCompra.css";

const AdminDetalleCompra = () => {
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCompra = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/compras/admin/compras/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) throw new Error("Error cargando compra");
        
        const data = await res.json();
        setCompra(data.compra);
      } catch (err) {
        console.error("Error:", err);
        alert("Error al cargar el detalle de la compra");
      } finally {
        setLoading(false);
      }
    };

    fetchCompra();
  }, [id, token]);

  if (loading) return <div>Cargando...</div>;
  if (!compra) return <div>Compra no encontrada</div>;

  return (
    <div className="admin-detalle-compra">
      <h2>Detalle de Compra #{compra.nroCompra}</h2>
      
      <div className="compra-info">
        <div className="info-section">
          <h3>Información del Cliente</h3>
          <p><strong>Nombre:</strong> {compra.nombreCompleto}</p>
          <p><strong>Email:</strong> {compra.email}</p>
          <p><strong>Teléfono:</strong> {compra.telefono}</p>
          <p><strong>DNI:</strong> {compra.dni}</p>
        </div>

        <div className="info-section">
          <h3>Dirección de Envío</h3>
          <p>{compra.direccionCalle}</p>
          <p>{compra.direccionLocalidad}, {compra.direccionProvincia}</p>
          <p>{compra.direccionPais} - CP: {compra.codigoPostal}</p>
        </div>

        <div className="info-section">
          <h3>Estado del Pedido</h3>
          <p><strong>Estado:</strong> {compra.estado}</p>
          <p><strong>Fecha:</strong> {new Date(compra.fechaCompra).toLocaleDateString()}</p>
          <p><strong>Pago:</strong> {compra.pago?.estado} - {compra.pago?.metodo}</p>
        </div>
      </div>

      <div className="productos-section">
        <h3>Productos ({compra.productos.length})</h3>
        <div className="productos-list">
          {compra.productos.map((producto, index) => (
            <div key={index} className="producto-item">
              <img 
                src={producto.productoId?.imagenURL || producto.imagen} 
                alt={producto.nombre}
                className="producto-imagen"
              />
              <div className="producto-info">
                <h4>{producto.nombre}</h4>
                <p><strong>Precio:</strong> ${producto.precio}</p>
                <p><strong>Cantidad:</strong> {producto.cantidad}</p>
                <p><strong>Subtotal:</strong> ${producto.precio * producto.cantidad}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="totales-section">
        <h3>Totales</h3>
        <p><strong>Subtotal:</strong> ${compra.subtotal}</p>
        <p><strong>Envío:</strong> ${compra.costoEnvio}</p>
        <p><strong>Total:</strong> ${compra.total}</p>
      </div>

      <button onClick={() => window.close()} className="btn-cerrar">
        Cerrar
      </button>
    </div>
  );
};

export default AdminDetalleCompra;