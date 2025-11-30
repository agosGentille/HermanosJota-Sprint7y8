import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import ModalCancelarPedido from "../components/ModalCancelarPedido";
import "../styles/DetalleCompra.css"; 

function DetalleCompra() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompra = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No autorizado");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/mis-compras/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Error al obtener la compra");
          setLoading(false);
          return;
        }

        setCompra(data.compra);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el detalle de la compra");
        setLoading(false);
      }
    };

    fetchCompra();
  }, [id]);

  // Función para calcular el total (si no viene del backend)
  const calcularTotal = (compraData) => {
    if (compraData.productoId && compraData.productoId.precio) {
      return compraData.productoId.precio;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="detalle-container">
        <div className="detalle-tarjeta">
          <p>Cargando detalle de compra...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detalle-container">
        <div className="detalle-tarjeta">
          <p className="error">{error}</p>
          <button className="btn-volver" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!compra) {
    return (
      <div className="detalle-container">
        <div className="detalle-tarjeta">
          <p>Compra no encontrada</p>
          <button className="btn-volver" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detalle-container">
      <div className="detalle-tarjeta">
        <h2 className="titulo-detalle">Detalle de Compra</h2>

        <div className="detalle-info">
          <p><strong>Nro Compra:</strong> {compra.nroCompra}</p>
          <p><strong>Fecha:</strong> {new Date(compra.fechaCompra).toLocaleDateString()}</p>
          <p><strong>Estado:</strong> 
            <span className={`estado-badge estado-${compra.estado.toLowerCase().replace(' ', '-')}`}>
              {compra.estado}
            </span>
          </p>
          <p><strong>Pago:</strong> {compra.pagado}</p>
        </div>

        {/* Información de envío */}
        <div className="info-envio">
          <h3 className="subtitulo">Información de Envío</h3>
          <p><strong>Nombre:</strong> {compra.nombreCompleto}</p>
          <p><strong>DNI:</strong> {compra.dni}</p>
          <p><strong>Email:</strong> {compra.email}</p>
          <p><strong>Teléfono:</strong> {compra.telefono}</p>
          <p><strong>Dirección:</strong> {compra.direccionCalle}, {compra.direccionLocalidad}</p>
          <p><strong>Provincia:</strong> {compra.direccionProvincia}</p>
          <p><strong>País:</strong> {compra.direccionPais}</p>
        </div>

        <h3 className="subtitulo">Productos</h3>

        <div className="lista-productos">
          {compra.productoId ? (
            <div className="producto-item">
              <img 
                src={compra.productoId.imagen} 
                alt={compra.productoId.nombre}
                onError={(e) => {
                  e.target.src = '/imagen-placeholder.jpg';
                }}
              />
              <div className="producto-info">
                <p className="producto-nombre">{compra.productoId.nombre}</p>
                <p className="producto-cantidad">1 unidad</p>
                <p className="producto-precio">${compra.productoId.precio || calcularTotal(compra)}</p>
              </div>
            </div>
          ) : (
            <p>No hay información del producto</p>
          )}
        </div>

        <div className="total-section">
          <h3>Total: ${calcularTotal(compra)}</h3>
        </div>

        <div className="botones-accion">
          {compra.estado === "En preparación" && (
            <button
              className="btn-cancelar-pedido"
              onClick={() => setModalAbierto(true)}
            >
              Cancelar Pedido
            </button>
          )}
          <button className="btn-volver" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>

      <ModalCancelarPedido
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onConfirmar={(motivo) => {
          alert("Pedido cancelado. Motivo: " + motivo);
          setModalAbierto(false);
          // Aquí podrías agregar una llamada a la API para actualizar el estado
        }}
      />
    </div>
  );
}

export default DetalleCompra;