import React from "react";
import { Link } from "react-router-dom";
import "../styles/CarritoLateral.css";
import CarritoCantidad from "./CarritoCantidad";
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
    loading 
  } = useCarrito();

  
  if (loading) {
    return (
      <aside className={`carrito-lateral ${isCarritoAbierto ? "abierto" : ""}`}>
        <div className="carrito-header">
          <h2>Carrito</h2>
          <button onClick={toggleCarrito}>&times;</button>
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
        <button onClick={toggleCarrito} className="btnCerrarCarrito material-symbols-outlined">close</button>
      </div>

      <div className="carrito-productos">
        {carrito.length === 0 ? (
          <p>El carrito está vacío</p>
        ) : (
          carrito.map(producto => (
            <div key={producto.id} className="carrito-producto">
              <img src={producto.imagen} alt={producto.titulo} />
              <div className="carrito-info">
                <h4>{producto.titulo}</h4>
                <div className="carrito-controles">
                  <button onClick={() => restarCantidad(producto.id)}>-</button>
                  <CarritoCantidad cantidad={producto.cantidad} />
                  <button onClick={() => sumarCantidad(producto.id)}>+</button>
                </div>
                <p>${producto.Precio * producto.cantidad}</p>
                <button className="btn-eliminar" onClick={() => eliminarProducto(producto.id)}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {carrito.length > 0 && (
        <div className="carrito-footer">
          <p>Total: ${total}</p>
          <button onClick={vaciarCarrito} className="btnVaciarCarrito">Vaciar Carrito</button>
          <Link to="/carrito" className="btn-pagar" onClick={toggleCarrito}>
            Ir al Carrito
          </Link>
        </div>
      )}
    </aside>
  );
}

export default CarritoLateral;