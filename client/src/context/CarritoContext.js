// context/CarritoContext.js - AGREGAR CÁLCULO DE ENVÍO
import React, { createContext, useContext, useState, useEffect } from 'react';
import { cargarCarrito, guardarCarrito } from '../components/CarritoStorage';

const CarritoContext = createContext();

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
  }
  return context;
};

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);
  const [isCarritoAbierto, setIsCarritoAbierto] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [loading, setLoading] = useState(true); 

  // Función auxiliar para obtener el precio del producto
  const getPrecioProducto = (producto) => {
    return producto.precio || producto.Precio || producto.price || 0;
  };

  // Cargar carrito al inicializar
  useEffect(() => {
    const cargarCarritoInicial = async () => {
      try {
        const usuario = localStorage.getItem("emailUsuario");
        const carritoCargado = await cargarCarrito(usuario);
        setCarrito(carritoCargado || []);
      } catch (error) {
        console.error("Error cargando carrito:", error);
        setCarrito([]); 
      } finally {
        setLoading(false); 
      }
    };
    cargarCarritoInicial();
  }, []);

  // Efecto para el bounce del numerito
  useEffect(() => {
    if (carrito && carrito.length > 0) { 
      setBounce(true);
      const timeout = setTimeout(() => setBounce(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [carrito]);

  // Calcular subtotal
  const calcularSubtotal = () => {
    if (!carrito || !Array.isArray(carrito)) return 0;
    return carrito.reduce((acc, p) => acc + (getPrecioProducto(p) * p.cantidad), 0);
  };

  // Calcular costo de envío - NUEVA FUNCIÓN
  const calcularCostoEnvio = () => {
    const subtotal = calcularSubtotal();
    // Envío gratis para compras mayores a $100,000
    if (subtotal >= 100000) {
      return 0;
    }
    // Costo fijo de envío para compras menores
    return 25000; // Puedes ajustar este valor
  };

  // Calcular total (subtotal + envío)
  const calcularTotal = () => {
    return calcularSubtotal() + calcularCostoEnvio();
  };

  // Agregar producto - MEJORADO
  const agregarProducto = async (producto) => {
    const currentCarrito = carrito || [];
    const productoId = producto.id || producto._id;
    const existe = currentCarrito.find(p => (p.id || p._id) === productoId);
    let nuevoCarrito;

    if (existe) {
      nuevoCarrito = currentCarrito.map(p =>
        (p.id || p._id) === productoId
          ? { 
              ...p, 
              cantidad: p.cantidad + (producto.cantidad || 1),
              precio: getPrecioProducto(p)
            }
          : p
      );
    } else {
      nuevoCarrito = [...currentCarrito, { 
        ...producto, 
        cantidad: producto.cantidad || 1,
        precio: getPrecioProducto(producto),
        id: productoId
      }];
    }

    setCarrito(nuevoCarrito);
    const usuario = localStorage.getItem("emailUsuario");
    await guardarCarrito(usuario, nuevoCarrito);
  };

  // Eliminar producto - MEJORADO
  const eliminarProducto = async (id) => {
    const currentCarrito = carrito || [];
    const nuevoCarrito = currentCarrito.filter(p => (p.id || p._id) !== id);
    setCarrito(nuevoCarrito);
    const usuario = localStorage.getItem("emailUsuario");
    await guardarCarrito(usuario, nuevoCarrito);
  };

  // Vaciar carrito
  const vaciarCarrito = async () => {
    setCarrito([]);
    const usuario = localStorage.getItem("emailUsuario");
    await guardarCarrito(usuario, []);
  };

  // Sumar cantidad - MEJORADO
  const sumarCantidad = async (id) => {
    const currentCarrito = carrito || []; 
    const nuevoCarrito = currentCarrito.map(p =>
      (p.id || p._id) === id ? { ...p, cantidad: p.cantidad + 1 } : p
    );
    setCarrito(nuevoCarrito);
    const usuario = localStorage.getItem("emailUsuario");
    await guardarCarrito(usuario, nuevoCarrito);
  };

  // Restar cantidad - MEJORADO
  const restarCantidad = async (id) => {
    const currentCarrito = carrito || []; 
    const nuevoCarrito = currentCarrito.map(p =>
      (p.id || p._id) === id ? { ...p, cantidad: p.cantidad > 1 ? p.cantidad - 1 : 1 } : p
    );
    setCarrito(nuevoCarrito);
    const usuario = localStorage.getItem("emailUsuario");
    await guardarCarrito(usuario, nuevoCarrito);
  };

  // Toggle carrito lateral
  const toggleCarrito = () => {
    setIsCarritoAbierto(!isCarritoAbierto);
  };

  // Calcular cantidad total de productos
  const cantidadTotal = (carrito || []).reduce((total, producto) => total + producto.cantidad, 0);

  // Calcular cuánto falta para envío gratis - NUEVA FUNCIÓN
  const calcularFaltaParaEnvioGratis = () => {
    const subtotal = calcularSubtotal();
    if (subtotal >= 100000) return 0;
    return 100000 - subtotal;
  };

  const value = {
    // Estado
    carrito: carrito || [], 
    isCarritoAbierto,
    bounce,
    loading, 

    // Funciones de modificación
    agregarProducto,
    eliminarProducto,
    vaciarCarrito,
    sumarCantidad,
    restarCantidad,
    toggleCarrito,
    
    // Valores calculados
    total: calcularTotal(),
    subtotal: calcularSubtotal(),
    costoEnvio: calcularCostoEnvio(), // ← Ahora calculado dinámicamente
    faltaParaEnvioGratis: calcularFaltaParaEnvioGratis(), // ← Nuevo valor
    cantidadTotal,
    cantidadProductos: (carrito || []).length 
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
};