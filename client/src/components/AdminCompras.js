import React, { useState, useEffect, useContext } from "react";
import "../styles/AdminCompras.css";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

const AdminCompras = () => {
  const [loading, setLoading] = useState(false);
  const [compras, setCompras] = useState([]);
  const [filtros, setFiltros] = useState({
    estado: "",
    pagado: "",
    orden: "fechaDesc"
  });

  const { usuario } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  const fetchCompras = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/compras`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error cargando compras");
      const data = await res.json();
      setCompras(Array.isArray(data.compras) ? data.compras : []);
    } catch (err) {
      console.error(err);
      alert("Error al cargar las compras");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!usuario || !token) {
      alert("Debes iniciar sesión");
      return;
    }
    fetchCompras();
  }, [usuario, token]);

  // Filtrar y ordenar compras
  const comprasFiltradas = compras
    .filter(compra => {
      if (filtros.estado && compra.estado !== filtros.estado) return false;
      if (filtros.pagado && compra.pagado !== filtros.pagado) return false;
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

  const handleCambiarEstado = async (compraId, nuevoEstado) => {
    if (!window.confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/compras/${compraId}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error("Error actualizando estado");
      await fetchCompras();
    } catch (err) {
      console.error(err);
      alert("No se pudo cambiar el estado");
    }
  };

  const handleTogglePagado = async (compraId, actualmentePagado) => {
    const nuevoEstado = actualmentePagado === "Pagado" ? "No pagado" : "Pagado";
    
    if (!window.confirm(`¿Marcar como "${nuevoEstado}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/compras/${compraId}/pago`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pagado: nuevoEstado }),
      });
      if (!res.ok) throw new Error("Error actualizando pago");
      await fetchCompras();
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el estado de pago");
    }
  };

  const estados = ["En preparación", "En camino", "Entregado", "Cancelado"];

  return (
    <div className="admin-compras-container">
      <h2>Gestión de Compras</h2>

      {/* Filtros */}
      <div className="filtros-compras">
        <div className="filtro-group">
          <label>Estado:</label>
          <select 
            value={filtros.estado} 
            onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
          >
            <option value="">Todos los estados</option>
            {estados.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <label>Pago:</label>
          <select 
            value={filtros.pagado} 
            onChange={(e) => setFiltros({...filtros, pagado: e.target.value})}
          >
            <option value="">Todos</option>
            <option value="Pagado">Pagado</option>
            <option value="No pagado">No pagado</option>
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
          onClick={() => setFiltros({ estado: "", pagado: "", orden: "fechaDesc" })}
        >
          Limpiar filtros
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="estadisticas-compras">
        <div className="estadistica-item">
          <span className="estadistica-numero">{compras.length}</span>
          <span className="estadistica-label">Total compras</span>
        </div>
        <div className="estadistica-item">
          <span className="estadistica-numero">
            {compras.filter(c => c.estado === "En preparación").length}
          </span>
          <span className="estadistica-label">En preparación</span>
        </div>
        <div className="estadistica-item">
          <span className="estadistica-numero">
            {compras.filter(c => c.pagado === "Pagado").length}
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
                <th>Producto</th>
                <th>Estado</th>
                <th>Pagado</th>
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
                  <td className="info-producto">
                    {compra.productoId ? (
                      <div>
                        <div className="producto-nombre">{compra.productoId.nombre}</div>
                        {compra.productoId.precio && (
                          <div className="producto-precio">${compra.productoId.precio}</div>
                        )}
                      </div>
                    ) : (
                      <span className="producto-no-disponible">Producto no disponible</span>
                    )}
                  </td>
                  <td className="estado-compra">
                    <select 
                      value={compra.estado} 
                      onChange={(e) => handleCambiarEstado(compra._id, e.target.value)}
                      className={`select-estado estado-${compra.estado.toLowerCase().replace(' ', '-')}`}
                    >
                      {estados.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </td>
                  <td className="pagado-compra">
                    <label className="checkbox-pagado">
                      <input
                        type="checkbox"
                        checked={compra.pagado === "Pagado"}
                        onChange={() => handleTogglePagado(compra._id, compra.pagado)}
                      />
                      <span className="checkmark"></span>
                      {compra.pagado === "Pagado" ? "Sí" : "No"}
                    </label>
                  </td>
                  <td className="acciones-compra">
                    <button 
                      className="btn-ver-detalle"
                      onClick={() => window.open(`/mis-compras/${compra._id}`, '_blank')}
                    >
                      Ver detalle
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