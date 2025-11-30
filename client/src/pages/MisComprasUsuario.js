import React, { useState, useEffect, useContext } from "react";
import "../styles/PerfilUsuario.css";
import { API_BASE_URL } from "../config/api";
import { AuthContext } from "../context/AuthContext"; 

function MisComprasUsuario() {
  const { usuario, logout } = useContext(AuthContext); 

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(true);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token || !usuario) {
          setError("No autorizado");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/usuario`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Error al obtener los datos de las compras");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos de las compras");
        setLoading(false);
      }
    };

    if (usuario) {
      fetchUsuario();
    }
  }, [usuario]); 

  const compras = [
    {
      id: "C-10324",
      fecha: "2025-01-18T14:20:00",
      producto: {
        nombre: "Silla Ergonómica X-200",
        imagen: "https://via.placeholder.com/80",
      },
    },
    {
      id: "C-10317",
      fecha: "2025-01-10T09:12:00",
      producto: {
        nombre: "Mesa de Roble Premium",
        imagen: "https://via.placeholder.com/80",
      },
    },
    {
      id: "C-10301",
      fecha: "2024-12-28T17:40:00",
      producto: {
        nombre: "Lámpara LED Vintage",
        imagen: "https://via.placeholder.com/80",
      },
    },
  ];


  return (
    <div className="mis-compras-container">
      <div className="compras-tarjeta">
        <h2>Mi Compras</h2>
        {error && <p className="errorCompras active">* {error}</p>}
        {loading && <p>Cargando compras...</p>}

        {!loading && !error && compras.length === 0 && (
          <p>No tienes compras registradas.</p>
        )}

        {!loading && !error && compras.length > 0 && (
          <div className="tabla-compras">
            <table>
              <thead>
                <tr>
                  <th>Nro Compra</th>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Imagen</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((compra) => (
                  <tr key={compra.id}>
                    <td>{compra.id}</td>
                    <td>{new Date(compra.fecha).toLocaleDateString()}</td>
                    <td>{compra.producto.nombre}</td>
                    <td>
                      <img
                        src={compra.producto.imagen}
                        alt={compra.producto.nombre}
                        className="img-compra"
                      />
                    </td>
                    <td>
                      <button
                        className="btn-detalle"
                        onClick={() =>
                          window.location.href = `/mis-compras/${compra.id}`
                        }
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
    </div>
  );
}

export default MisComprasUsuario;