import React, { useState, useEffect, useContext } from "react";
import "../styles/PerfilUsuario.css";
import { API_BASE_URL } from "../config/api";
import { AuthContext } from "../context/AuthContext";

function PerfilUsuario() {
  const [usuario, setUsuario] = useState({
    nombre: "",
    email: "",
    dni: "",
    telefono: "",
    direccionCalle: "",
    direccionLocalidad: "",
    direccionProvincia: "",
    direccionPais: "",
  });
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { logout } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        if (!token) {
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
          setError(data.error || "Error al obtener los datos del usuario");
          setLoading(false);
          return;
        }

        const data = await res.json();
        // setUsuario con todos los campos disponibles
        setUsuario({
          nombre: data.usuario.nombreCompleto || "",
          email: data.usuario.email || "",
          dni: data.usuario.dni || "",
          telefono: data.usuario.telefono || "",
          direccionCalle: data.usuario.direccionCalle || "",
          direccionLocalidad: data.usuario.direccionLocalidad || "",
          direccionProvincia: data.usuario.direccionProvincia || "",
          direccionPais: data.usuario.direccionPais || "",
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos del usuario");
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
  };

  const handleActualizar = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/usuario`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombreCompleto: usuario.nombre,
          dni: usuario.dni,
          telefono: usuario.telefono,
          direccionCalle: usuario.direccionCalle,
          direccionLocalidad: usuario.direccionLocalidad,
          direccionProvincia: usuario.direccionProvincia,
          direccionPais: usuario.direccionPais,
        }),
      });

      setLoading(false);

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al actualizar los datos");
        return;
      }

      alert("Datos actualizados correctamente");
      setEditable(false);
    } catch (err) {
      setError("No se pudo conectar con el servidor");
      setLoading(false);
    }
  };

  const handleEliminarCuenta = async () => {
    if (
      !window.confirm(
        "¿Seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/usuario`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al eliminar la cuenta");
        return;
      }
      alert("Cuenta eliminada correctamente");
      logout();
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    }
  };

  return (
    <div className="perfil-container">
      <h2>Mi Perfil</h2>
      {error && <p className="errorLogin active">* {error}</p>}

      <div className="perfil-form">
        <label>Nombre y Apellido:</label>
        <input
          type="text"
          name="nombre"
          value={usuario.nombre}
          onChange={handleChange}
        />

        <label>DNI:</label>
        <input
          type="dni"
          name="dni"
          value={usuario.dni ? usuario.dni : ""}
          onChange={handleChange}
        />

        <label>Email:</label>
        <input type="email" name="email" value={usuario.email} disabled />

        <label>Teléfono:</label>
        <input
          type="telefono"
          name="telefono"
          value={usuario.telefono ? usuario.telefono : ""}
          onChange={handleChange}
        />

        <label>Calle y Número:</label>
        <input
          type="text"
          name="direccionCalle"
          value={usuario.direccionCalle || ""}
          onChange={handleChange}
        />

        <label>Localidad:</label>
        <input
          type="text"
          name="direccionLocalidad"
          value={usuario.direccionLocalidad || ""}
          onChange={handleChange}
        />

        <label>Provincia:</label>
        <input
          type="text"
          name="direccionProvincia"
          value={usuario.direccionProvincia || ""}
          onChange={handleChange}
        />

        <label>País:</label>
        <input
          type="text"
          name="direccionPais"
          value={usuario.direccionPais || ""}
          onChange={handleChange}
        />

        <div className="perfil-buttons">
          {editable ? (
            <button onClick={handleActualizar} disabled={loading}>
              {loading ? "Actualizando..." : "Guardar cambios"}
            </button>
          ) : (
            <button onClick={() => setEditable(true)}>Actualizar datos</button>
          )}
          <button onClick={handleEliminarCuenta} className="delete-btn">
            Eliminar cuenta
          </button>
        </div>
      </div>
    </div>
  );
}

export default PerfilUsuario;
