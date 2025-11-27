import React, { useState } from "react";
import "../styles/Carrito.css";
import CarritoCantidad from "../components/CarritoCantidad";
import { useCarrito } from "../context/CarritoContext"; // 
import caja from "../images/caja.svg";

const Carrito = () => {
  const {
    carrito,
    sumarCantidad,
    restarCantidad,
    eliminarProducto,
    vaciarCarrito,
    total
  } = useCarrito();

  const [nota, setNota] = useState("");
  const [procesandoCompra, setProcesandoCompra] = useState(false);
  const [compraFinalizada, setCompraFinalizada] = useState(false);

  const handleComprar = async () => {
    setProcesandoCompra(true);

    setTimeout(async () => {
      setProcesandoCompra(false);
      setCompraFinalizada(true);
      await vaciarCarrito(); 
    }, 4000);
  };

  return (
    <main className="contenedor__carrito">
      <h2 className="titulo__principal">Carrito de Compras</h2>

      {/* Mostrar mientras se procesa la compra */}
      {procesandoCompra ? (
        <div className="procesando-compra">
          <h2>Procesando compra...</h2>
          <div className="barra-carga">
            <div className="progreso"></div>
          </div>
        </div>
      ) : compraFinalizada ? (
        <div className="compra-finalizada">
          <img src={caja} alt="Caja" className="icono-caja" />
          <h2>¡Gracias por tu compra 🎉!</h2>
          <p>Estamos preparando tu envío 📦</p>
        </div>
      ) : carrito.length === 0 ? (
        <p className="carrito-vacio">Tu carrito está vacío 😞</p>
      ) : (
        <>
          <table id="carrito-productos">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Título</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {carrito.map((producto) => (
                <tr key={producto.id}>
                  <td>
                    <img
                      src={producto.imagen}
                      alt={producto.titulo}
                      className="carrito-producto-img"
                    />
                  </td>
                  <td>{producto.titulo}</td>
                  <td>
                    <div className="cantidad-botones">
                      <button onClick={() => restarCantidad(producto.id)}>−</button>
                      <CarritoCantidad cantidad={producto.cantidad} />
                      <button onClick={() => sumarCantidad(producto.id)}>+</button>
                    </div>
                  </td>
                  <td>${producto.Precio}</td>
                  <td>${producto.Precio * producto.cantidad}</td>
                  <td>
                    <button
                      className="carrito-producto-eliminar"
                      onClick={() => eliminarProducto(producto.id)}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Nota de pedido */}
          <div className="nota-pedido" style={{ marginTop: "1.5rem" }}>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder=" "
              rows={3}
            />
            <label>Agregar una nota al pedido</label>
          </div>

          {/* Acciones del carrito */}
          <div id="carrito-acciones" style={{ marginTop: "1.5rem" }}>
            <div className="carrito-acciones-total">
              <p>Total:</p>
              <p>${total}</p>
            </div>

            <button className="carrito-acciones-vaciar" onClick={vaciarCarrito}>
              Vaciar Carrito
            </button>
            <button
              className="carrito-acciones-comprar"
              onClick={handleComprar}
              disabled={procesandoCompra}
            >
              {procesandoCompra ? "Procesando..." : "Comprar Ahora"}
            </button>
          </div>
        </>
      )}
    </main>
  );
};

export default Carrito;