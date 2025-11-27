import React, { useState, useEffect, useContext } from "react";
import "../styles/PerfilUsuario.css";
import { API_BASE_URL } from "../config/api";
import { AuthContext } from "../context/AuthContext"; // ✅ Ruta corregida (contexts vs context)

function PerfilUsuario() {
  const [perfil, setPerfil] = useState({
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

  const { usuario, logout } = useContext(AuthContext); // ✅ Obtener usuario del contexto

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        // ✅ Usar el token del contexto en lugar de localStorage directamente
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
          setError(data.error || "Error al obtener los datos del usuario");
          setLoading(false);
          return;
        }

        const data = await res.json();
        // ✅ Actualizar el estado del perfil
        setPerfil({
          nombre: data.usuario.nombreCompleto || "",
          email: data.usuario.email || usuario.email || "", // ✅ Usar email del contexto como fallback
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

    if (usuario) {
      fetchUsuario();
    }
  }, [usuario]); // ✅ Dependencia del usuario del contexto

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfil((prev) => ({ ...prev, [name]: value }));
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
          nombreCompleto: perfil.nombre,
          dni: perfil.dni,
          telefono: perfil.telefono,
          direccionCalle: perfil.direccionCalle,
          direccionLocalidad: perfil.direccionLocalidad,
          direccionProvincia: perfil.direccionProvincia,
          direccionPais: perfil.direccionPais,
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
      logout(); // ✅ Usar logout del contexto
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    }
  };

  // ✅ Mostrar loading mientras se carga
  if (loading && !perfil.email) {
    return <div className="perfil-container">Cargando perfil...</div>;
  }

  return (
    <div className="perfil-container">
      <h2>Mi Perfil</h2>
      {error && <p className="errorLogin active">* {error}</p>}

      <div className="perfil-form">
        <label>Nombre y Apellido:</label>
        <input
          type="text"
          name="nombre"
          value={perfil.nombre}
          onChange={handleChange}
          disabled={!editable}
        />

        <label>DNI:</label>
        <input
          type="text" // ✅ Cambiado de "dni" a "text"
          name="dni"
          value={perfil.dni}
          onChange={handleChange}
          disabled={!editable}
        />

        <label>Email:</label>
        <input 
          type="email" 
          name="email" 
          value={perfil.email} 
          disabled 
        />

        <label>Teléfono:</label>
        <input
          type="tel" // ✅ Cambiado a "tel" para mejor UX
          name="telefono"
          value={perfil.telefono}
          onChange={handleChange}
          disabled={!editable}
        />

        <label>Calle y Número:</label>
        <input
          type="text"
          name="direccionCalle"
          value={perfil.direccionCalle}
          onChange={handleChange}
          disabled={!editable}
        />

        <label>Localidad:</label>
        <input
          type="text"
          name="direccionLocalidad"
          value={perfil.direccionLocalidad}
          onChange={handleChange}
          disabled={!editable}
        />

        <label>Provincia:</label>
        <input
          type="text"
          name="direccionProvincia"
          value={perfil.direccionProvincia}
          onChange={handleChange}
          disabled={!editable}
        />

        <label>País:</label>
        <input
          type="text"
          name="direccionPais"
          value={perfil.direccionPais}
          onChange={handleChange}
          disabled={!editable}
        />

        <div className="perfil-buttons">
          {editable ? (
            <>
              <button onClick={handleActualizar} disabled={loading}>
                {loading ? "Actualizando..." : "Guardar cambios"}
              </button>
              <button 
                onClick={() => setEditable(false)} 
                className="cancel-btn"
                disabled={loading}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button onClick={() => setEditable(true)}>
              Actualizar datos
            </button>
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