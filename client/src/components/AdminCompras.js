import React, { useState, useEffect, useContext } from "react";
import "../styles/AdminCompras.css";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

const AdminCompras = () => {
  const [loading, setLoading] = useState(false);
  const [compras, setCompras] = useState([]);
  const [filtros, setFiltros] = useState({
    estado: "",
    pagoEstado: "",
    orden: "fechaDesc"
  });

  const { usuario } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  const fetchCompras = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/compras/admin/todas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Error cargando compras");
      
      const data = await res.json();
      setCompras(Array.isArray(data.compras) ? data.compras : []);
    } catch (err) {
      console.error("Error cargando compras:", err);
      alert("Error al cargar las compras");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!usuario || !token) {
      alert("Debes iniciar sesión");
      window.location.href = "/login";
      return;
    }
    
    fetchCompras();
  }, [usuario, token]);

  //  Filtrar y ordenar compras con estructura actual
  const comprasFiltradas = compras
    .filter(compra => {
      if (filtros.estado && compra.estado !== filtros.estado) return false;
      if (filtros.pagoEstado && compra.pago?.estado !== filtros.pagoEstado) return false;
      return true;
    })
    .sort((a, b) => {
      switch (filtros.orden) {
        case "fechaDesc":
          return new Date(b.fechaCompra) - new Date(a.fechaCompra);
        case "fechaAsc":
          return new Date(a.fechaCompra) - new Date(b.fechaCompra);
        case "nroCompraDesc":
          return b.nroCompra - a.nroCompra;
        case "nroCompraAsc":
          return a.nroCompra - b.nroCompra;
        default:
          return 0;
      }
    });

  //  Cambiar estado del pedido
  const handleCambiarEstado = async (compraId, nuevoEstado) => {
    if (!window.confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/compras/${compraId}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      
      if (!res.ok) throw new Error("Error actualizando estado");
      
      // Actualizar estado localmente
      setCompras(prevCompras => 
        prevCompras.map(compra => 
          compra._id === compraId 
            ? { ...compra, estado: nuevoEstado }
            : compra
        )
      );
      
      alert("Estado actualizado correctamente");
    } catch (err) {
      console.error(err);
      alert("No se pudo cambiar el estado");
    }
  };

// Versión mejorada que envía todo el objeto pago
const handleCambiarEstadoPago = async (compraId, nuevoEstadoPago) => {
  if (!window.confirm(`¿Cambiar estado de pago a "${nuevoEstadoPago}"?`)) return;

  try {
    // Encontrar la compra actual para preservar los otros datos del pago
    const compraActual = compras.find(c => c._id === compraId);
    
    if (!compraActual) {
      throw new Error("Compra no encontrada");
    }

    const res = await fetch(`${API_BASE_URL}/compras/${compraId}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        pago: {
          ...compraActual.pago, // Preservar todos los datos existentes
          estado: nuevoEstadoPago // Solo cambiar el estado
        }
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `Error ${res.status}`);
    }
    
    // Actualizar estado localmente
    setCompras(prevCompras => 
      prevCompras.map(compra => 
        compra._id === compraId 
          ? { 
              ...compra, 
              pago: { ...compra.pago, estado: nuevoEstadoPago } 
            }
          : compra
      )
    );
    
    alert("Estado de pago actualizado correctamente");
  } catch (err) {
    console.error("Error actualizando estado de pago:", err);
    alert(err.message || "No se pudo actualizar el estado de pago");
  }
};

  // Estados disponibles según nuestro modelo
  const estadosPedido = ["pendiente", "confirmado", "preparando", "enviado", "entregado", "cancelado"];
  const estadosPago = ["pendiente", "aprobado", "rechazado"];

  // Función para formatear estado para mostrar
  const formatearEstado = (estado) => {
    const estados = {
      pendiente: "Pendiente",
      confirmado: "Confirmado", 
      preparando: "Preparando",
      enviado: "En camino",
      entregado: "Entregado",
      cancelado: "Cancelado",
      aprobado: "Aprobado",
      rechazado: "Rechazado"
    };
    return estados[estado] || estado;
  };

  return (
    <div className="admin-compras-container">
      <h2>Gestión de Compras</h2>

      {/* Filtros CORREGIDOS */}
      <div className="filtros-compras">
        <div className="filtro-group">
          <label>Estado del pedido:</label>
          <select 
            value={filtros.estado} 
            onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
          >
            <option value="">Todos los estados</option>
            {estadosPedido.map(estado => (
              <option key={estado} value={estado}>
                {formatearEstado(estado)}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <label>Estado de pago:</label>
          <select 
            value={filtros.pagoEstado} 
            onChange={(e) => setFiltros({...filtros, pagoEstado: e.target.value})}
          >
            <option value="">Todos</option>
            {estadosPago.map(estado => (
              <option key={estado} value={estado}>
                {formatearEstado(estado)}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <label>Ordenar por:</label>
          <select 
            value={filtros.orden} 
            onChange={(e) => setFiltros({...filtros, orden: e.target.value})}
          >
            <option value="fechaDesc">Más recientes primero</option>
            <option value="fechaAsc">Más antiguos primero</option>
            <option value="nroCompraDesc">N° Compra (desc)</option>
            <option value="nroCompraAsc">N° Compra (asc)</option>
          </select>
        </div>

        <button 
          className="btn-limpiar-filtros"
          onClick={() => setFiltros({ estado: "", pagoEstado: "", orden: "fechaDesc" })}
        >
          Limpiar filtros
        </button>
      </div>

      {/* Estadísticas rápidas CORREGIDAS */}
      <div className="estadisticas-compras">
        <div className="estadistica-item">
          <span className="estadistica-numero">{compras.length}</span>
          <span className="estadistica-label">Total compras</span>
        </div>
        <div className="estadistica-item">
          <span className="estadistica-numero">
            {compras.filter(c => c.estado === "pendiente").length}
          </span>
          <span className="estadistica-label">Pendientes</span>
        </div>
        <div className="estadistica-item">
          <span className="estadistica-numero">
            {compras.filter(c => c.pago?.estado === "aprobado").length}
          </span>
          <span className="estadistica-label">Pagadas</span>
        </div>
      </div>

      {loading ? (
        <p>Cargando compras...</p>
      ) : comprasFiltradas.length === 0 ? (
        <p>No hay compras para mostrar.</p>
      ) : (
        <div className="compras-table-container">
          <table className="admin-compras-table">
            <thead>
              <tr>
                <th>N° Compra</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Estado Pedido</th>
                <th>Estado Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comprasFiltradas.map((compra) => (
                <tr key={compra._id} className="compra-row">
                  <td className="nro-compra">#{compra.nroCompra}</td>
                  <td className="fecha-compra">
                    {new Date(compra.fechaCompra).toLocaleDateString()}
                  </td>
                  <td className="info-cliente">
                    <div><strong>{compra.nombreCompleto}</strong></div>
                    <div className="cliente-email">{compra.email}</div>
                    <div className="cliente-telefono">{compra.telefono}</div>
                  </td>
                  <td className="info-productos">
                    {compra.productos && compra.productos.length > 0 ? (
                      <div>
                        <div className="producto-principal">
                          {compra.productos[0].nombre} x{compra.productos[0].cantidad}
                        </div>
                        {compra.productos.length > 1 && (
                          <div className="mas-productos">
                            +{compra.productos.length - 1} producto(s) más
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="producto-no-disponible">Sin productos</span>
                    )}
                  </td>
                  <td className="total-compra">
                    ${compra.total?.toLocaleString()}
                  </td>
                  <td className="estado-compra">
                    <select 
                      value={compra.estado} 
                      onChange={(e) => handleCambiarEstado(compra._id, e.target.value)}
                      className={`select-estado estado-${compra.estado}`}
                    >
                      {estadosPedido.map(estado => (
                        <option key={estado} value={estado}>
                          {formatearEstado(estado)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="estado-pago">
                    <select 
                      value={compra.pago?.estado || "pendiente"} 
                      onChange={(e) => handleCambiarEstadoPago(compra._id, e.target.value)}
                      className={`select-pago pago-${compra.pago?.estado}`}
                    >
                      {estadosPago.map(estado => (
                        <option key={estado} value={estado}>
                          {formatearEstado(estado)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="acciones-compra">
                    <button 
  className="btn-ver-detalle"
  onClick={() => window.open(`/admin/detalle-compra/${compra._id}`, '_blank')}
>
  Ver detalle
</button>
                    <button 
                      className="btn-actualizar"
                      onClick={() => {
                        handleCambiarEstado(compra._id, compra.estado);
                        handleCambiarEstadoPago(compra._id, compra.pago?.estado);
                      }}
                    >
                      Actualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCompras;
