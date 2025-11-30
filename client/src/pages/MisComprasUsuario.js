import React, { useState, useEffect, useContext } from "react";
import "../styles/MisComprasUsuario.css";
import { API_BASE_URL } from "../config/api";
import { AuthContext } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom";
import ModalCancelarPedido from "../components/ModalCancelarPedido";

function MisComprasUsuario() {
  const { usuario, logout } = useContext(AuthContext); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [modalAbierto, setModalAbierto] = useState(false);
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

        const res = await fetch(`${API_BASE_URL}/mis-compras`, {
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

        setCompras(data.compras);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las compras");
        setLoading(false);
      }
    };

    fetchCompras();
  }, []);

  // Función para formatear los productos (adaptada al nuevo modelo)
  const getProductosParaMostrar = (compra) => {
    // Si tienes un solo producto por compra
    if (compra.productoId) {
      return [{
        _id: compra.productoId._id,
        nombre: compra.productoId.nombre,
        imagen: compra.productoId.imagen
      }];
    }
    return [];
  };

  return (
    <div className="mis-compras-container">
      <div className="compras-tarjeta">
        <h2 className="titulo-compras">Mis Compras</h2>

        {error && <p className="errorCompras active">* {error}</p>}
        {loading && <p>Cargando compras...</p>}

        {!loading && !error && compras.length === 0 && (
          <p className="no-compras">No tienes compras realizadas</p>
        )}

        {!loading && !error && compras.length > 0 && (
          <div className="tabla-compras-container">
            <table className="tabla-compras">
              <thead>
                <tr>
                  <th>Nro Compra</th>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((compra) => {
                  const productos = getProductosParaMostrar(compra);
                  
                  return (
                    <tr key={compra._id}>
                      <td>{compra.nroCompra}</td>
                      <td>{new Date(compra.fechaCompra).toLocaleDateString()}</td>
                      <td>
                        <div className="grid-productos">
                          {productos.map((producto, index) => (
                            <div key={index} className="producto-mini">
                              <img 
                                src={producto.imagen} 
                                alt={producto.nombre} 
                                onError={(e) => {
                                  e.target.src = '/imagen-placeholder.jpg';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`estado-badge estado-${compra.estado.toLowerCase().replace(' ', '-')}`}>
                          {compra.estado}
                        </span>
                      </td>
                      <td className="td-acciones">
                        <button
                          className="btn-detalle"
                          onClick={() => navigate(`/mis-compras/${compra._id}`)}
                        >
                          Ver detalle
                        </button>
                        {compra.estado === "En preparación" && (
                          <button
                            className="btn-cancelar-pedido"
                            onClick={() => setModalAbierto(true)}
                          >
                            Cancelar Pedido
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
          onClose={() => setModalAbierto(false)}
          onConfirmar={(motivo) => {
            alert("Pedido cancelado. Motivo: " + motivo);
            setModalAbierto(false);
          }}
        />
      </div>
    </div>
  );
}

export default MisComprasUsuario;