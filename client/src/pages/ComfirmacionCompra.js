import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "../styles/ConfirmacionCompra.css";

const ConfirmacionCompra = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { compra } = location.state || {};

  if (!compra) {
    return (
      <div className="confirmacion-container">
        <div className="confirmacion-error">
          <h2>No se encontraron datos de compra</h2>
          <p>Parece que hubo un problema al procesar tu compra.</p>
          <Link to="/productos" className="btn-volver-tienda">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmacion-container">
      <div className="confirmacion-exitosa">
        <div className="icono-exito">✅</div>
        <h1>¡Compra Exitosa!</h1>
        <p className="numero-compra">
          Número de compra: <strong>#{compra.nroCompra || compra.compra?.nroCompra}</strong>
        </p>
        
        <div className="resumen-compra">
          <h3>Resumen de tu compra:</h3>
          <div className="detalles-compra">
            <p><strong>Total:</strong> ${compra.total?.toLocaleString() || compra.compra?.total?.toLocaleString()}</p>
            <p><strong>Estado:</strong> {compra.estado || compra.compra?.estado || "Pendiente"}</p>
            <p><strong>Método de pago:</strong> {compra.pago?.metodo || compra.compra?.pago?.metodo}</p>
          </div>
        </div>

        <div className="acciones-confirmacion">
          <button 
            onClick={() => navigate("/mis-compras")} 
            className="btn-ver-compras"
          >
            Ver mis compras
          </button>
          <Link to="/productos" className="btn-seguir-comprando">
            Seguir comprando
          </Link>
        </div>

        <div className="info-adicional">
          <p>Te hemos enviado un email con los detalles de tu compra.</p>
          <p>Si tienes alguna pregunta, contáctanos por WhatsApp.</p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionCompra;