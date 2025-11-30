import React, { useState, useContext } from "react";
import "../styles/AdminPage.css";
import AdminProductForm from "../components/AdminProductForm";
import AdminUserForm from "../components/AdminUserForm";
import AdminCompras from "../components/AdminCompras";
import AdminUser from "../components/AdminUser";
import AdminProductList from "../components/AdminProductList";
import { AuthContext } from "../context/AuthContext";

// 👇 Imports de categorías
import AdminCategoriasList from "../components/AdminCategoriaList";
import AdminCategoriaForm from "../components/AdminCategoriaForm";

function AdminPage({ showToast }) {
  const [section, setSection] = useState("manage-products");
  const [selectedCategoriaId, setSelectedCategoriaId] = useState(null);
  
  const { usuario, esAdmin, esEditor } = useContext(AuthContext);

  // Título dinámico según el rol
  const getTituloPanel = () => {
    if (esAdmin) return "Panel de Administrador";
    if (esEditor) return "Panel de Editor";
    return "Panel";
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>{getTituloPanel()}</h1>
        <p>Bienvenido, {usuario?.nombre || usuario?.email}</p>
        
        <nav className="admin-nav">
          {/* SOLO ADMINISTRADORES - Gestión de usuarios y pedidos */}
          {esAdmin && (
            <>
              <button
                className={section === "users" ? "active" : ""}
                onClick={() => setSection("users")}
              >
                Gestionar usuarios
              </button>

              <button
                className={section === "orders" ? "active" : ""}
                onClick={() => setSection("orders")}
              >
                Gestionar pedidos
              </button>
            </>
          )}

          {/* ADMINISTRADORES Y EDITORES - Gestión de productos */}
          <button
            className={section === "add-product" ? "active" : ""}
            onClick={() => setSection("add-product")}
          >
            Agregar producto
          </button>

          <button
            className={section === "manage-products" ? "active" : ""}
            onClick={() => setSection("manage-products")}
          >
            Gestionar productos
          </button>

          {/* ADMINISTRADORES Y EDITORES - Gestión de categorías */}
          {(esAdmin || esEditor) && (
            <button
              className={section === "manage-categories" ? "active" : ""}
              onClick={() => setSection("manage-categories")}
            >
              Gestionar categorías
            </button>
          )}
        </nav>
      </div>

      <div className="admin-main">
        {/* SECCIÓN DE USUARIOS - SOLO PARA ADMIN */}
        {section === "users" && esAdmin ? (
          <section className="admin-section">
            <AdminUser />
          </section>
        ) : 

        section === "orders" && esAdmin ? (
          <section className="admin-section">
            <AdminCompras />
          </section>
        ) : 
        
        /* SECCIÓN DE CATEGORÍAS - PARA ADMIN Y EDITOR */
        section === "manage-categories" && (esAdmin || esEditor) ? (
          <section className="admin-section">
            <AdminCategoriasList
              showToast={showToast}
              onAddCategoryClick={() => {
                setSelectedCategoriaId(null);
                setSection("add-category");
              }}
              onEditCategory={(categoriaId) => {
                setSelectedCategoriaId(categoriaId);
                setSection("edit-category");
              }}
            />
          </section>
        ) : section === "add-category" && (esAdmin || esEditor) ? (
          <section className="admin-section">
            <AdminCategoriaForm
              inPanel={true}
              showToast={showToast}
              onBackClick={() => setSection("manage-categories")}
            />
          </section>
        ) : section === "edit-category" && (esAdmin || esEditor) ? (
          <section className="admin-section">
            <AdminCategoriaForm
              inPanel={true}
              showToast={showToast}
              editMode={true}
              categoriaId={selectedCategoriaId}
              onBackClick={() => setSection("manage-categories")}
            />
          </section>
        ) : 
        
        /* SECCIONES PARA ADMIN Y EDITOR - PRODUCTOS */
        section === "add-product" ? (
          <section className="admin-section">
            <AdminProductForm inPanel={true} showToast={showToast} />
          </section>
        ) : (
          /* SECCIÓN POR DEFECTO - GESTIÓN DE PRODUCTOS */
          <section className="admin-section">
            <AdminProductList
              onAddProductClick={() => setSection("add-product")}
              showToast={showToast}
            />
          </section>
        )}
      </div>
    </div>
  );
}

export default AdminPage;