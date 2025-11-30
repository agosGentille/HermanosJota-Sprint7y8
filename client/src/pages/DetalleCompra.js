import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/DetalleCompra.css"; 

function DetalleCompra() {
  const { id } = useParams();
  const navigate = useNavigate();

  const compras = [
    {
      id: "C-10324",
      fecha: "2025-01-18T14:20:00",
      productos: [
        { nombre: "Silla Ergonómica X-200", imagen: "https://picsum.photos/600", cantidad:1, precioUnitario:4000  },
        { nombre: "Escritorio Plegable Pro", imagen: "https://picsum.photos/600", cantidad:1, precioUnitario:4000  },
        { nombre: "Lámpara LED Vintage", imagen: "https://picsum.photos/600", cantidad:1, precioUnitario:4000  },
        { nombre: "Alfombra Moderna XL", imagen: "https://picsum.photos/600", cantidad:1, precioUnitario:4000  },
        { nombre: "Repisa Flotante", imagen: "https://picsum.photos/600", cantidad:1, precioUnitario:4000  }, 
        { nombre: "Silla Nordic Blanca", imagen: "https://picsum.photos/600", cantidad:1, precioUnitario:4000 },
      ],
      total:24000,
    },
    {
      id: "C-10317",
      fecha: "2025-01-10T09:12:00",
      productos: [
        { nombre: "Mesa de Roble Premium", imagen: "https://picsum.photos/600", cantidad:1, precioUnitario:4000  },
        { nombre: "Silla Nordic Blanca", imagen: "https://picsum.photos/600", cantidad:2, precioUnitario:4000  },
      ],
      total:12000,
    },
    {
      id: "C-10301",
      fecha: "2024-12-28T17:40:00",
      productos: [
        { nombre: "Lámpara LED Vintage", imagen: "https://picsum.photos/600", cantidad:1, precioUnitario:4000  },
      ],
      total:4000,
    },
  ];

  const compra = compras.find((c) => c.id === id);

  return (
    <div className="detalle-container">
      <div className="detalle-tarjeta">
        <h2 className="titulo-detalle">Detalle de Compra</h2>

        <div className="detalle-info">
          <p><strong>Nro Compra:</strong> {compra.id}</p>
          <p><strong>Fecha:</strong> {new Date(compra.fecha).toLocaleDateString()}</p>
          <p><strong>Total:</strong> {compra.total}</p>
        </div>

        <h3 className="subtitulo">Productos</h3>

        <div className="lista-productos">
          {compra.productos.map((p, index) => (
            <div key={index} className="producto-item">
              <img src={p.imagen} alt={p.nombre} />
              <p>{p.nombre}</p>
              <p>{p.cantidad} unidad</p>
              <p>{p.precioUnitario} precio</p>
            </div>
          ))}
        </div>

        <button className="btn-volver" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </div>
  );
}

export default DetalleCompra;