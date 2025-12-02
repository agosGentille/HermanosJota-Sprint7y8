// pages/Carrito.js - VERSIÓN CON ENVÍO GRATIS
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Carrito.css";
import { useCarrito } from "../context/CarritoContext";
import { AuthContext } from "../context/AuthContext";

const Carrito = () => {
  const { 
    carrito, 
    total, 
    subtotal,
    costoEnvio,
    faltaParaEnvioGratis, 
    vaciarCarrito, 
    eliminarProducto,
    sumarCantidad, 
    restarCantidad 
  } = useCarrito();
  
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [nota, setNota] = useState("");

  const handleProcederCompra = () => {
    if (!usuario) {
      alert("Debes iniciar sesión para realizar una compra");
      return;
    }
    
    if (carrito.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }
    
    // Navegar al checkout con los datos del carrito
    navigate("/checkout", { 
      state: { 
        carrito, 
        subtotal,
        costoEnvio,
        total, 
        nota 
      } 
    });
  };

  // Función auxiliar para obtener el precio
  const getPrecioProducto = (producto) => {
    return producto.precio || producto.Precio || producto.price || 0;
  };

  return (
    <main className="contenedor__carrito">
      <h2 className="titulo__principal">Carrito de Compras</h2>

      {carrito.length === 0 ? (
        <div className="carrito-vacio">
          <p>Tu carrito está vacío 😞</p>
          <button 
            className="btn-seguir-comprando"
            onClick={() => navigate("/productos")}
          >
            Seguir Comprando
          </button>
        </div>
      ) : (
        <>
          {/* Barra de progreso para envío gratis - NUEVO */}
          {faltaParaEnvioGratis > 0 && (
            <div className="envio-gratis-bar">
              <div className="envio-gratis-info">
                <span className="envio-gratis-text">
                  ¡Te faltan ${faltaParaEnvioGratis.toLocaleString()} para ENVÍO GRATIS!
                </span>
                <div className="envio-gratis-progress">
                  <div 
                    className="envio-gratis-progress-fill"
                    style={{ width: `${(subtotal / 100000) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {costoEnvio === 0 && (
            <div className="envio-gratis-activo">
              🎉 ¡Felicidades! Tienes ENVÍO GRATIS
            </div>
          )}

          <div className="carrito-items">
            {carrito.map((producto) => {
              const precioProducto = getPrecioProducto(producto);
              const subtotalProducto = precioProducto * (producto.cantidad || 1);
              const productoId = producto.id || producto._id;

              return (
                <div key={productoId} className="carrito-item">
                  <div className="item-imagen">
                    <img
                      src={producto.imagen || producto.imagenURL}
                      alt={producto.nombre || producto.titulo}
                    />
                  </div>
                  <div className="item-info">
                    <h4>{producto.nombre || producto.titulo}</h4>
                    <p className="item-precio-unitario">${precioProducto.toLocaleString()}</p>
                  </div>
                  <div className="item-cantidad">
                    <div className="cantidad-controls">
                      <button 
                        className="btn-cantidad disminuir"
                        onClick={() => restarCantidad(productoId)}
                        disabled={producto.cantidad <= 1}
                      >
                        -
                      </button>
                      <span className="cantidad-numero">
                        {producto.cantidad || 1}
                      </span>
                      <button 
                        className="btn-cantidad aumentar"
                        onClick={() => sumarCantidad(productoId)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="item-subtotal">
                    <span>${subtotalProducto.toLocaleString()}</span>
                  </div>
                  <button
                    className="eliminar-item"
                    onClick={() => eliminarProducto(productoId)}
                    title="Eliminar producto"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* Resumen */}
          <div className="resumen-carrito">
            <div className="resumen-detalle">
              <div className="resumen-linea">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="resumen-linea envio-linea">
                <span>
                  Envío:
                  {costoEnvio === 0 && <span className="envio-gratis-badge">GRATIS</span>}
                </span>
                <span>
                  {costoEnvio === 0 ? (
                    <span className="envio-gratis">$0</span>
                  ) : (
                    `$${costoEnvio.toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="resumen-total">
                <strong className="total">Total:</strong>
                <strong className="total">${total.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Nota */}
          <div className="nota-pedido">
            <label htmlFor="nota-pedido">Nota del pedido (opcional):</label>
            <textarea
              id="nota-pedido"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej: Horario preferido de entrega, instrucciones especiales, etc."
              rows={3}
            />
          </div>

          {/* Acciones */}
          <div className="carrito-acciones">
            <button 
              className="btn-vaciar" 
              onClick={vaciarCarrito}
            >
              Vaciar Carrito
            </button>
            <button 
              className="btn-comprar" 
              onClick={handleProcederCompra}
            >
              Proceder al Checkout
            </button>
          </div>
        </>
      )}
    </main>
  );
};

export default Carrito;