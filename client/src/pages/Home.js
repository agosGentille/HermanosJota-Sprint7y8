import React, {useEffect, useState} from 'react';
import '../styles/Home.css';
//Carrusel inicial con slides:
import Carrusel_Home from '../components/Carousel'
//inspiraciones
import inspo1 from '../images/Home/inspiracion1.png'
import inspo2 from '../images/Home/inspiracion2.png'
import inspo3 from '../images/Home/inspiracion3.png'
//acabados naturales
import aceite from '../images/Home/aceite-lino.png'
import cera from '../images/Home/cera-abejas.jpeg'
import tintes from '../images/Home/tintes-vegetales.jpg'
//principios
import Carrusel_Principios from '../components/ListNavegable'
import { API_BASE_URL } from '../config/api';
import ProductList from '../components/ProductList';
import { useCarrito } from '../context/CarritoContext'; // 

function Home() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  

  const { agregarProducto } = useCarrito();
  
  console.log("Render Home");

  useEffect(() => {
    //sirve para hacer peticiones HTTP. En este caso al backend para pedir la lista d productos
    fetch(`${API_BASE_URL}/productos`) 
    //Cuando fetch obtiene respuesta, pasa un objeto Response a este .then.
    //Ese objeto tiene info como el estado (200, 404, 500, etc.), cabeceras y métodos como .json()
    .then(res => {
      if (!res.ok) throw new Error("Error al cargar los productos");
      return res.json();
    })
    //Este .then recibe el data (el listado de productos) ya convertido en JSON
    .then(data => {
      const productosConUrl = data.map((p) => ({
        ...p,
        imagen: `${API_BASE_URL.replace('/api', '')}${p.imagen}`,
        imagenHover: p.imagenHover ? 
          `${API_BASE_URL.replace('/api', '')}${p.imagenHover}` : 
          `${API_BASE_URL.replace('/api', '')}${p.imagen}`
      }));
      //guardamos los productos con las nuevas url
      setProductos(productosConUrl);
      //Actualiza estado loading para mostrar un cartel de "Cargando…"
      setLoading(false);
    })
    //Si en cualquier parte del proceso hubo un error, entra acá
    .catch(err => {
      console.error(err);
      setError(err.message || "Error al cargar los productos");
      setLoading(false);
    });
  }, []);
  console.log("Productos en render:", productos);

  function obtenerAleatorios(array, n) {
    const copia = [...array];
    const resultado = [];
    for (let i = 0; i < n; i++) {
      if (copia.length === 0) break; 
      const indice = Math.floor(Math.random() * copia.length);
      resultado.push(copia[indice]);
      copia.splice(indice, 1); 
    }
    return resultado;
  }

  
  const handleAddToCart = (producto) => {
    agregarProducto(producto);
  };
    
  return (
    <main>
       <Carrusel_Home />
       
        {/* Best Sellers */}
        <section className="secc-vendidos">
          <ProductList
            productos={productos.filter(p => p.masVendidos)}
            titulo="Best Sellers"
            mostrarMax={3}
            onAddToCart={handleAddToCart} 
            emptyMessage="No hay productos más vendidos por el momento"
          />
        </section>
      
        {/* Inspiraciones */}
        <section className="secc-inspiraciones">
          <div className="contenedor-inspiraciones">
            <div className="tarjeta-inspiracion">
              <img src={inspo1} alt="imagen producto" className="tarjeta-foto" />
              <p>Piezas que hacen de tus tareas diarias un placer</p>
            </div>
            <div className="tarjeta-inspiracion">
              <img src={inspo2} alt="imagen producto" className="tarjeta-foto" />
              <p>Muebles que abrazan tu hogar</p>
            </div>
            <div className="tarjeta-inspiracion">
              <img src={inspo3} alt="imagen producto" className="tarjeta-foto" />
              <p>Diseños que acompañan tu descanso</p>
            </div>
          </div>
        </section>

        {/* Envíos a todo el país */}
        <div className="envios-cinta">
          <div className="cinta-contenido">
            <span> Envíos a todo el país </span>
            <span> Envíos a todo el país </span>
            <span> Envíos a todo el país </span>
            <span> Envíos a todo el país </span>
          </div>
          <div className="cinta-contenido">
            <span>Envíos a todo el país</span>
            <span>Envíos a todo el país</span>
            <span>Envíos a todo el país</span>
            <span>Envíos a todo el país</span>
          </div>
        </div>

        {/* Acabados naturales */}
        <section className="secc-naturales">
          <h2>Acabados Naturales</h2>
          <div className="caracteristicas">
            <div className="contenedor-caracteristicas">
              <div className="contenedor-img-carac">
                <img src={aceite} alt="imagen descriptiva" className="img_custom" />
              </div>
              <h3>Aceite de lino</h3>
              <p>100% natural prensado en frío. Ideal para muebles de uso diario.</p>
            </div>
            <div className="contenedor-caracteristicas">
              <div className="contenedor-img-carac">
                <img src={cera} alt="imagen descriptiva" className="img_custom" />
              </div>
              <h3>Cera de abejas</h3>
              <p>Origen local certificado. Perfecta para terminación premium.</p>
            </div>
            <div className="contenedor-caracteristicas">
              <div className="contenedor-img-carac">
                <img src={tintes} alt="imagen descriptiva" className="img_custom" />
              </div>
              <h3>Tintes vegetales</h3>
              <p>Base agua con pigmentos naturales. Usado cuando se requiere color.</p>
            </div>
          </div>
        </section>

        {/* Ver todo */}
        <section className="secc-vertodo">
          <a href="/productos" className="link-ver-todo" id="btnVertodo">
            <span className="texto-link">VER TODO</span>
            <span className="icono-flecha">&#10095;</span>
          </a>
          <ProductList
            productos={obtenerAleatorios(productos, 3)}
            mostrarMax={3}
            onAddToCart={handleAddToCart} 
          />
        </section>
        
        <Carrusel_Principios />
    </main>
  );
}

export default Home;