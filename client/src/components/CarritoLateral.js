import React from "react";
import { Link } from "react-router-dom";
import "../styles/CarritoLateral.css";
import { useCarrito } from "../context/CarritoContext";

function CarritoLateral() {
  const {
    isCarritoAbierto,
    toggleCarrito,
    carrito,
    eliminarProducto,
    vaciarCarrito,
    sumarCantidad,
    restarCantidad,
    total,
    subtotal,
    costoEnvio,
    faltaParaEnvioGratis,
    loading 
  } = useCarrito();

  const getPrecioProducto = (producto) => {
    return producto.precio || producto.Precio || producto.price || 0;
  };

  if (loading) {
    return (
      <aside className={`carrito-lateral ${isCarritoAbierto ? "abierto" : ""}`}>
        <div className="carrito-header">
          <h2>Carrito</h2>
          <button onClick={toggleCarrito} className="btnCerrarCarrito">×</button>
        </div>
        <div className="carrito-productos">
          <p>Cargando carrito...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`carrito-lateral ${isCarritoAbierto ? "abierto" : ""}`}>
      <div className="carrito-header">
        <h2>Carrito</h2>
        <button onClick={toggleCarrito} className="btnCerrarCarrito">×</button>
      </div>

      <div className="carrito-productos">
        {carrito.length === 0 ? (
          <p style={{textAlign: 'center', color: 'var(--color-texto-medio)', marginTop: '2rem'}}>
            El carrito está vacío
          </p>
        ) : (
          <>
            {/* Información de envío */}
            {faltaParaEnvioGratis > 0 && (
              <div className="carrito-envio-info">
                <div className="envio-progress-bar">
                  <div 
                    className="envio-progress-fill"
                    style={{ width: `${(subtotal / 100000) * 100}%` }}
                  ></div>
                </div>
                <p className="envio-mensaje">
                  ¡Faltan <strong>${faltaParaEnvioGratis.toLocaleString()}</strong> para envío gratis!
                </p>
              </div>
            )}

            {costoEnvio === 0 && subtotal > 0 && (
              <div className="carrito-envio-gratis">
                🎉 ¡Envío gratis!
              </div>
            )}

            {/* Lista de productos */}
            {carrito.map(producto => {
              const precioProducto = getPrecioProducto(producto);
              const productoId = producto.id || producto._id;
              
              return (
                <div key={productoId} className="carrito-producto">
                  <img 
                    src={producto.imagen || producto.imagenURL} 
                    alt={producto.nombre || producto.titulo} 
                  />
                  <div className="carrito-info">
                    <h4>{producto.nombre || producto.titulo}</h4>
                    <div className="carrito-controles">
                      <div className="controles-izquierda">
                        <button onClick={() => restarCantidad(productoId)}>-</button>
                        <span className="cantidad-display">{producto.cantidad}</span>
                        <button onClick={() => sumarCantidad(productoId)}>+</button>
                      </div>
                      <div className="controles-derecha">
                        <span className="precio-producto">
                          ${(precioProducto * producto.cantidad).toLocaleString()}
                        </span>
                        <button 
                          className="btn-eliminar" 
                          onClick={() => eliminarProducto(productoId)}
                          title="Eliminar producto"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {carrito.length > 0 && (
        <div className="carrito-footer">
          <div className="carrito-totales">
            <div className="total-linea">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="total-linea envio-linea">
              <span>
                Envío:
                {costoEnvio === 0 && <span className="envio-gratis-badge">GRATIS</span>}
              </span>
              <span>
                {costoEnvio === 0 ? (
                  <span className="envio-gratis-text">$0</span>
                ) : (
                  `$${costoEnvio.toLocaleString()}`
                )}
              </span>
            </div>
            <div className="total-linea total-final">
              <strong>Total:</strong>
              <strong>${total.toLocaleString()}</strong>
            </div>
          </div>
          
          <button onClick={vaciarCarrito} className="btnVaciarCarrito">
            Vaciar Carrito
          </button>
          <Link to="/carrito" className="btn-pagar" onClick={toggleCarrito}>
            Ir al Carrito
          </Link>
        </div>
      )}
    </aside>
  );
}

export default CarritoLateral;