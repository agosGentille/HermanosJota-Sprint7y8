import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/AdminForm.css";
import { API_BASE_URL } from '../config/api';

const AdminUserForm = ({ editMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    nombreCompleto: "",
    dni: "",
    email: "",
    clave: "",
    telefono: "",
    rol: "visitante",
  });

  // Si está en modo edición, cargar usuario
  useEffect(() => {
    if (editMode && id) {
      const fetchUser = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/users/${id}`);
          if (!response.ok) throw new Error("Error cargando usuario");
          const data = await response.json();
          setUser(data);
        } catch (error) {
          console.error("Error:", error);
          alert("Error al cargar el usuario");
        }
      };
      fetchUser();
    }
  }, [editMode, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editMode
  ? `${API_BASE_URL}/users/${id}`
  : `${API_BASE_URL}/users`;

      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar el usuario");
      }

      navigate("/usuarios");
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar usuario");
      navigate("/usuarios");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="admin-form-container">
      <form onSubmit={handleSubmit} className="admin-user-form">
        <div className="form-section">
          <h3>Información Personal</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Nombre completo *</label>
              <input
                type="text"
                name="nombreCompleto"
                value={user.nombreCompleto}
                onChange={handleChange}
                required
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="form-group">
              <label>DNI</label>
              <input
                type="text"
                name="dni"
                value={user.dni}
                onChange={handleChange}
                placeholder="Ej: 12345678"
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={user.telefono}
                onChange={handleChange}
                placeholder="Ej: +54 9 11 5555 5555"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Credenciales</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                required
                placeholder="usuario@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label>Contraseña *</label>
              <input
                type="password"
                name="clave"
                value={user.clave}
                onChange={handleChange}
                required
                placeholder="********"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Rol de Usuario</h3>
          <div className="form-group">
            <select name="rol" value={user.rol} onChange={handleChange}>
              <option value="visitante">Visitante</option>
              <option value="editor">Editor</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-guardar" disabled={loading}>
            {loading
              ? "Guardando..."
              : editMode
              ? "Actualizar Usuario"
              : "Crear Usuario"}
          </button>

          {editMode && (
            <button
              type="button"
              className="btn-eliminar"
              onClick={handleDelete}
            >
              Eliminar Usuario
            </button>
          )}

          <button
            type="button"
            className="btn-cancelar"
            onClick={() => navigate("/usuarios")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminUserForm;
