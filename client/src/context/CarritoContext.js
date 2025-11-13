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

  // Calcular total
  const calcularTotal = () => {
    if (!carrito || !Array.isArray(carrito)) return 0;
    return carrito.reduce((acc, p) => acc + (p.precio || p.Precio || 0) * p.cantidad, 0);
  };

  // Agregar producto
  const agregarProducto = async (producto) => {
    const currentCarrito = carrito || []; // 
    const existe = currentCarrito.find(p => p.id === producto.id);
    let nuevoCarrito;

    if (existe) {
      nuevoCarrito = currentCarrito.map(p =>
        p.id === producto.id
          ? { ...p, cantidad: p.cantidad + (producto.cantidad || 1) }
          : p
      );
    } else {
      nuevoCarrito = [...currentCarrito, { ...producto, cantidad: producto.cantidad || 1 }];
    }

    setCarrito(nuevoCarrito);
    const usuario = localStorage.getItem("emailUsuario");
    await guardarCarrito(usuario, nuevoCarrito);
  };

  // Eliminar producto
  const eliminarProducto = async (id) => {
    const currentCarrito = carrito || [];
    const nuevoCarrito = currentCarrito.filter(p => p.id !== id);
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

  // Sumar cantidad
  const sumarCantidad = async (id) => {
    const currentCarrito = carrito || []; 
    const nuevoCarrito = currentCarrito.map(p =>
      p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p
    );
    setCarrito(nuevoCarrito);
    const usuario = localStorage.getItem("emailUsuario");
    await guardarCarrito(usuario, nuevoCarrito);
  };

  // Restar cantidad
  const restarCantidad = async (id) => {
    const currentCarrito = carrito || []; 
    const nuevoCarrito = currentCarrito.map(p =>
      p.id === id ? { ...p, cantidad: p.cantidad > 1 ? p.cantidad - 1 : 1 } : p
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
    cantidadTotal,
    cantidadProductos: (carrito || []).length 
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
};