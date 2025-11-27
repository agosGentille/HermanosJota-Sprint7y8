import React, { useState, useEffect } from "react";
import "../styles/StyleProductos.css";
import ProductList from "../components/ProductList";
import { Link } from "react-router-dom";
import { API_BASE_URL } from '../config/api';
import { useCarrito } from '../context/CarritoContext'; // 

function Productos() {
  console.log("Render Productos");
  
  const { agregarProducto } = useCarrito();
  
  // Estados principales
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados para filtros
  const [filtro, setFiltro] = useState("");
  const [ordenamiento, setOrdenamiento] = useState("tituloAsc");
  const [categoriaSeleccionadas, setCategoriaSeleccionadas] = useState([]);
  const [precioSeleccionado, setPrecioSeleccionado] = useState("");
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState(false);
  const [garantiaSeleccionada, setGarantiaSeleccionada] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [categoriasFiltro, setCategoriasFiltro] = useState([]);
  const [categoriasConNombres, setCategoriasConNombres] = useState([]);

  /* Carga inicial de productos Y categorías */
  useEffect(() => {
    // Cargar productos
    fetch(`${API_BASE_URL}/productos`) 
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar los productos");
        return res.json();
      })
      .then((data) => {
        const productosConUrl = data.map((p) => ({
          ...p,
          imagen: `${API_BASE_URL.replace('/api', '')}${p.imagen}`,
          imagenHover: p.imagenHover ? 
            `${API_BASE_URL.replace('/api', '')}${p.imagenHover}` : 
            `${API_BASE_URL.replace('/api', '')}${p.imagen}`
        }));

        setProductos(productosConUrl);
        
        // Extraer IDs únicos de categorías de los productos
        const categoriasIds = [];
        data.forEach(p => {
          if (p.categoria && !categoriasIds.includes(p.categoria)) {
            categoriasIds.push(p.categoria);
          }
        });
        
        // Cargar nombres de categorías desde el backend
        fetch(`${API_BASE_URL}/categories`)
          .then(res => {
            if (!res.ok) throw new Error("Error al cargar categorías");
            return res.json();
          })
          .then(categoriasData => {
            // Mapear IDs a nombres de categorías
            const categoriasConInfo = categoriasIds.map(catId => {
              const categoria = categoriasData.find(c => c._id === catId);
              return {
                id: catId,
                nombre: categoria ? categoria.nombre : catId
              };
            });
            
            setCategoriasConNombres(categoriasConInfo);
            setCategoriasFiltro(categoriasIds);
          })
          .catch(err => {
            console.error("Error cargando categorías:", err);
            // Si falla, usar solo los IDs
            setCategoriasConNombres(categoriasIds.map(id => ({ id, nombre: id })));
            setCategoriasFiltro(categoriasIds);
          });
          
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Error al cargar los productos");
        setLoading(false);
      });
  }, []);

  // Estados de carga o error
  if (loading)
    return (
      <main>
        <div className="buscador-productos">
          <p>Cargando productos...</p>
        </div>
      </main>
    );

  if (error)
    return (
      <main>
        <div className="buscador-productos">
          <p>Error: {error}</p>
        </div>
      </main>
    );

  // Cálculo de límites de precio para colocar en el filtro de precios
  const precios = productos.map((p) => p.Precio);
  const precioPromedio = precios.reduce((acc, p) => acc + p, 0) / precios.length;

  const limiteBajo = Math.round(precioPromedio * 0.8);
  const limiteAlto = Math.round(precioPromedio * 1.2);

  // Filtro combinado
  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda = p.titulo
      .toLowerCase()
      .includes(filtro.toLowerCase());
    const coincideCategoria =
    categoriaSeleccionadas.length === 0 ||
    categoriaSeleccionadas.includes(p.categoria);

    // Precio
    let coincidePrecio = true;
    if (precioSeleccionado === "menor") coincidePrecio = p.Precio < limiteBajo;
    else if (precioSeleccionado === "menoryMayor")
      coincidePrecio = p.Precio >= limiteBajo && p.Precio <= limiteAlto;
    else if (precioSeleccionado === "mayor") coincidePrecio = p.Precio > limiteAlto;
      
    // Certificación / Garantía
    const coincideCertificado =
      !certificadoSeleccionado || p.certificacion !== null;
    const coincideGarantia =
      !garantiaSeleccionada || p.garantia !== null;

    return (
      coincideBusqueda &&
      coincideCategoria &&
      coincidePrecio &&
      coincideCertificado &&
      coincideGarantia
    );
  });

  //manejo de filtros
  const limpiarFiltros = () => {
    setFiltro("");
    setCategoriaSeleccionadas([]);
    setPrecioSeleccionado("");
    setCertificadoSeleccionado(false);
    setGarantiaSeleccionada(false);
  };

  const handleCategoriaChange = (e) => {
    const nombre = e.target.value;
    const checked = e.target.checked;
    setCategoriaSeleccionadas((prev) =>
      checked ? [...prev, nombre] : prev.filter((cat) => cat !== nombre)
    );
  };

  const handlePrecioChange = (e) => {
    setPrecioSeleccionado(e.target.value);
  };

  //Ordenamiento
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    switch (ordenamiento) {
      case "precioasc":
        return a.Precio - b.Precio;
      case "preciodesc":
        return b.Precio - a.Precio;
      case "tituloAsc":
        return a.titulo.toLowerCase().localeCompare(b.titulo);
      case "tituloDesc":
        return b.titulo.toLowerCase().localeCompare(a.titulo);
      default:
        return 0;
    }
  });

  // Función para manejar agregar al carrito usando el contexto
  const handleAddToCart = (producto) => {
    agregarProducto(producto);
  };

  //Render principal
  return (
    <main className="productos-container">
      {/* Botón para mostrar/ocultar filtros en mobile */}
      <button
        className="btn-toggle-filtros"
        onClick={() => setMostrarFiltros(!mostrarFiltros)}
      >
        {mostrarFiltros ? "Ocultar filtros ▲" : "Mostrar filtros ▼"}
      </button>
      <aside
        className={`filtros ${
          mostrarFiltros ? "mostrar-filtros" : "ocultar-filtros"
        }`}
      >
        <h2>Filtros</h2>

        {/* Filtro: Categoría - CORREGIDO */}
        <div className="filtro-seccion">
          <h3>Categoría</h3>
          <ul>
            {categoriasConNombres.map((cat, i) => (
              <li key={i}>
                <input
                  type="checkbox"
                  id={`cat-${i}`}
                  value={cat.id}
                  onChange={handleCategoriaChange}
                  checked={categoriaSeleccionadas.includes(cat.id)}
                />
                <label htmlFor={`cat-${i}`}>{cat.nombre}</label>
              </li>
            ))}
          </ul>
        </div>

        {/* Filtro: Certificación */}
        <div className="filtro-seccion">
          <h3>Certificado</h3>
          <label>
            <input
              type="checkbox"
              checked={certificadoSeleccionado}
              onChange={(e) => setCertificadoSeleccionado(e.target.checked)}
            />
            Posee certificación
          </label>
        </div>

        {/* Filtro: Garantía */}
        <div className="filtro-seccion">
          <h3>Garantía</h3>
          <label>
            <input
              type="checkbox"
              checked={garantiaSeleccionada}
              onChange={(e) => setGarantiaSeleccionada(e.target.checked)}
            />
            Posee garantía
          </label>
        </div>

        {/* Filtro: Precio */}
        <div className="filtro-seccion">
          <h3>Precio</h3>
          <ul>
            <li>
              <input
                type="radio"
                name="precio"
                value="menor"
                checked={precioSeleccionado === "menor"}
                onChange={handlePrecioChange}
              />
              Hasta ${limiteBajo.toLocaleString("es-AR")}
            </li>
            <li>
              <input
                type="radio"
                name="precio"
                value="menoryMayor"
                checked={precioSeleccionado === "menoryMayor"}
                onChange={handlePrecioChange}
              />
              ${limiteBajo.toLocaleString("es-AR")} a{" "}
              ${limiteAlto.toLocaleString("es-AR")}
            </li>
            <li>
              <input
                type="radio"
                name="precio"
                value="mayor"
                checked={precioSeleccionado === "mayor"}
                onChange={handlePrecioChange}
              />
              Más de ${limiteAlto.toLocaleString("es-AR")}
            </li>
          </ul>

          <button className="btn-limpiar" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        </div>
      </aside>

      {/* Catálogo de productos */}
      <section className="catalogo">
        <div className="catalogo-header">
          <input
            type="search"
            placeholder="Buscar producto..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />

          <div>
            <label htmlFor="orden">Ordenar por: </label>
            <select className="select"
              id="orden"
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value)}
            >
              <option value="tituloAsc">Título (A-Z)</option>
              <option value="tituloDesc">Título (Z-A)</option>
              <option value="preciodesc">Precio (Mayor a menor)</option>
              <option value="precioasc">Precio (Menor a mayor)</option>
            </select>
          </div>
        </div>

        
        <ProductList
          productos={productosOrdenados}
          onAddToCart={handleAddToCart}
          emptyMessage="No se encontraron productos con los filtros aplicados"
        />
      </section>
    </main>
  );
}

export default Productos;