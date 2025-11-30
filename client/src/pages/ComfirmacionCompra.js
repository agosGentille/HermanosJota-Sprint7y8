import React, { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "../styles/ComfirmacionCompra.css";

const ConfirmacionCompra = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { compra, datosEnvio } = location.state || {};

  // Efecto para debug
  useEffect(() => {
    console.log("📍 ConfirmacionCompra montada");
    console.log("📦 Datos recibidos:", { compra, datosEnvio });
    console.log("📍 Location state:", location.state);
  }, [compra, datosEnvio, location.state]);

  // Si no hay datos, mostrar página de error mejorada
  if (!compra) {
    return (
      <div className="confirmacion-container">
        <div className="confirmacion-error">
          <div className="icono-error">❌</div>
          <h2>No se encontraron datos de compra</h2>
          <p>Parece que hubo un problema al mostrar la confirmación.</p>
          <p>Tu pedido fue procesado correctamente en el sistema.</p>
          
          <div className="acciones-confirmacion">
            <button 
              onClick={() => navigate("/mis-compras")} 
              className="btn-ver-compras"
            >
              Ver mis compras para confirmar
            </button>
            <Link to="/productos" className="btn-seguir-comprando">
              Seguir comprando
            </Link>
          </div>
          
          <div className="info-contacto">
            <p>Si tienes dudas, contáctanos por WhatsApp:</p>
            <a href="https://wa.me/5491112345678" className="whatsapp-link">
              📱 +54 9 11 1234-5678
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Datos consolidados
  const compraData = compra.compra || compra;
  const nroCompra = compraData.nroCompra || compra.nroCompra;
  const total = compraData.total || compra.total;
  const estado = compraData.estado || compra.estado || "Pendiente";
  const metodoPago = compraData.pago?.metodo || compra.pago?.metodo;

  return (
    <div className="confirmacion-container">
      <div className="confirmacion-exitosa">
        
        {/* Animación de cajita */}
        <div className="animacion-caja">
          <div className="caja">📦</div>
          <div className="linea-trayectoria"></div>
          <div className="icono-casa">🏠</div>
        </div>
        
        <h1>¡Compra Exitosa!</h1>
        
        <div className="resumen-pedido">
          <div className="numero-pedido">
            <span>Número de pedido:</span>
            <strong>#{nroCompra}</strong>
          </div>
          
          <div className="estado-pedido">
            <div className={`badge-estado ${estado.toLowerCase()}`}>
              {estado}
            </div>
          </div>
        </div>

        <div className="resumen-compra">
          <h3>Resumen de tu compra:</h3>
          <div className="detalles-compra">
            <div className="detalle-item">
              <span>Total:</span>
              <span>${total?.toLocaleString()}</span>
            </div>
            <div className="detalle-item">
              <span>Método de pago:</span>
              <span>{metodoPago}</span>
            </div>
            {datosEnvio && (
              <>
                <div className="detalle-item">
                  <span>Envío a:</span>
                  <span>{datosEnvio.direccionCalle}, {datosEnvio.direccionLocalidad}</span>
                </div>
                <div className="detalle-item">
                  <span>Contacto:</span>
                  <span>{datosEnvio.telefono}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* BOTONES DE ACCIÓN MEJORADOS */}
        <div className="acciones-confirmacion">
          <button 
            onClick={() => navigate("/mis-compras")} 
            className="btn-ver-compras"
          >
            📋 Ver mis compras
          </button>
          
          <button 
            onClick={() => navigate("/")} 
            className="btn-inicio"
          >
            🏠 Ir al inicio
          </button>
          
          <Link to="/productos" className="btn-seguir-comprando">
            🛒 Seguir comprando
          </Link>
        </div>

        <div className="info-adicional">
          <div className="pasos-seguimiento">
            <h4>Próximos pasos:</h4>
            <ul>
              <li>✅ <strong>Pago confirmado</strong> - Tu pedido está siendo procesado</li>
              <li>📦 <strong>Preparando pedido</strong> - En las próximas 24-48 horas</li>
              <li>🚚 <strong>En camino</strong> - Te notificaremos cuando salga para entrega</li>
              <li>🏠 <strong>Entregado</strong> - ¡Disfruta de tus productos!</li>
            </ul>
          </div>
          
          <div className="info-contacto">
            <p>¿Tienes preguntas sobre tu pedido?</p>
            <a href="https://wa.me/5491112345678" className="whatsapp-link">
              💬 Contactar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionCompra;