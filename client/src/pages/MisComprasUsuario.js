import React, { useState, useEffect, useContext } from "react";
import "../styles/MisComprasUsuario.css";
import { API_BASE_URL } from "../config/api";
import { AuthContext } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom";
import ModalCancelarPedido from "../components/ModalCancelarPedido";

function MisComprasUsuario() {
  const { usuario } = useContext(AuthContext); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const [compras, setCompras] = useState([]);

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No autorizado");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/compras/mis-compras`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Error al obtener las compras");
          setLoading(false);
          return;
        }

        console.log("Compras recibidas:", data.compras);
        setCompras(data.compras || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las compras");
        setLoading(false);
      }
    };

    fetchCompras();
  }, []);

  // Función para formatear los productos
  const getProductosParaMostrar = (compra) => {
    if (compra.productos && compra.productos.length > 0) {
      return compra.productos.slice(0, 4); // Mostrar máximo 4 productos
    }
    return [];
  };

  // Función para obtener el total de productos
  const getTotalProductos = (compra) => {
    if (compra.productos && compra.productos.length > 0) {
      return compra.productos.reduce((total, producto) => total + producto.cantidad, 0);
    }
    return 0;
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

  const handleCancelarPedido = (compra) => {
    setCompraSeleccionada(compra);
    setModalAbierto(true);
  };

  const handleConfirmarCancelacion = async (motivo) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/compras/${compraSeleccionada._id}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: "cancelado" }),
      });

      if (res.ok) {
        // Actualizar el estado localmente
        setCompras(prevCompras => 
          prevCompras.map(compra => 
            compra._id === compraSeleccionada._id 
              ? { ...compra, estado: "cancelado" }
              : compra
          )
        );
        alert("Pedido cancelado exitosamente");
      } else {
        alert("Error al cancelar el pedido");
      }
    } catch (err) {
      console.error(err);
      alert("Error al cancelar el pedido");
    } finally {
      setModalAbierto(false);
      setCompraSeleccionada(null);
    }
  };

  return (
    <div className="mis-compras-container">
      <div className="compras-tarjeta">
        <h2 className="titulo-compras">Mis Compras</h2>

        {error && <p className="errorCompras active">* {error}</p>}
        {loading && <p className="cargando">Cargando compras...</p>}

        {!loading && !error && compras.length === 0 && (
          <div className="no-compras-container">
            <p className="no-compras">No tienes compras realizadas</p>
            <button 
              className="btn-ir-tienda"
              onClick={() => navigate("/")}
            >
              Ir a la tienda
            </button>
          </div>
        )}

        {!loading && !error && compras.length > 0 && (
          <div className="tabla-compras-container">
            <table className="tabla-compras">
              <thead>
                <tr>
                  <th>N° Compra</th>
                  <th>Fecha</th>
                  <th>Productos</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((compra) => {
                  const productos = getProductosParaMostrar(compra);
                  const totalProductos = getTotalProductos(compra);
                  const productosRestantes = compra.productos ? compra.productos.length - 4 : 0;
                  
                  return (
                    <tr key={compra._id} className="fila-compra">
                      <td className="nro-compra">#{compra.nroCompra}</td>
                      <td className="fecha-compra">
                        {new Date(compra.fechaCompra).toLocaleDateString()}
                      </td>
                      <td className="td-productos">
                        <div className="grid-productos">
                          {productos.map((producto, index) => (
                            <div key={index} className="producto-mini">
                              <img 
                                src={producto.imagen || producto.productoId?.imagenURL} 
                                alt={producto.nombre} 
                                onError={(e) => {
                                  e.target.src = '/imagen-placeholder.jpg';
                                }}
                              />
                            </div>
                          ))}
                          {productosRestantes > 0 && (
                            <div className="producto-mini overlay-mas">
                              +{productosRestantes}
                            </div>
                          )}
                        </div>
                        <div className="info-productos-texto">
                          {compra.productos && compra.productos[0]?.nombre}
                          {compra.productos && compra.productos.length > 1 && (
                            <span> y {compra.productos.length - 1} más</span>
                          )}
                        </div>
                      </td>
                      <td className="cantidad-productos">
                        {totalProductos} {totalProductos === 1 ? 'producto' : 'productos'}
                      </td>
                      <td className="total-compra">
                        ${compra.total?.toLocaleString()}
                      </td>
                      <td className="estado-compra">
                        <span className={`estado-badge estado-${compra.estado}`}>
                          {formatearEstado(compra.estado)}
                        </span>
                      </td>
                      <td className="td-acciones">
                        <button
                          className="btn-detalle"
                          onClick={() => navigate(`/mis-compras/${compra._id}`)}
                        >
                          Ver detalle
                        </button>
                        {(compra.estado === "pendiente" || compra.estado === "confirmado") && (
                          <button
                            className="btn-cancelar-pedido"
                            onClick={() => handleCancelarPedido(compra)}
                          >
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        <ModalCancelarPedido
          abierto={modalAbierto}
          onClose={() => {
            setModalAbierto(false);
            setCompraSeleccionada(null);
          }}
          onConfirmar={handleConfirmarCancelacion}
        />
      </div>
    </div>
  );
}

export default MisComprasUsuario;