import React from 'react';
import '../styles/ProductList.css';
import TarjetasProductos from './TarjetasProductos';

function ProductList({ productos, titulo, mostrarMax, onAddToCart, emptyMessage }) {
  return (
    <div className="product-list-container">
      {titulo && <h2 className="product-list-titulo">{titulo}</h2>}
      
      {productos.length === 0 ? (
        <div className="product-list-empty">
          <p>{emptyMessage || "No se encontraron productos"}</p>
        </div>
      ) : (
        <div className="product-list-grid">
          <TarjetasProductos 
            productos={productos}
            mostrarMax={mostrarMax}
            onAddToCart={onAddToCart}
          />
        </div>
      )}
    </div>
  );
}

export default ProductList;