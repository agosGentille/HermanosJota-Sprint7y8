import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { API_BASE_URL } from "../config/api";
import "../styles/Checkout.css";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);
  const { vaciarCarrito } = useCarrito();
  
  const { carrito, subtotal, costoEnvio, total, nota } = location.state || {};
  
  const [paso, setPaso] = useState("envio");
  const [loading, setLoading] = useState(false);
  const [datosCargados, setDatosCargados] = useState(false);

  // Datos del formulario - Inicialmente vacíos
  const [datosEnvio, setDatosEnvio] = useState({
    nombreCompleto: "",
    dni: "",
    telefono: "",
    direccionCalle: "",
    direccionLocalidad: "",
    direccionProvincia: "",
    direccionPais: "Argentina",
    codigoPostal: ""
  });

  const [metodoPago, setMetodoPago] = useState("");
  const [datosTarjeta, setDatosTarjeta] = useState({
    numero: "",
    vencimiento: "",
    cvv: "",
    nombreTitular: ""
  });

  // Cargar datos del usuario si existen - SOLO UNA VEZ
  useEffect(() => {
    if (usuario && !datosCargados) {
      setDatosEnvio(prev => ({
        ...prev,
        nombreCompleto: usuario.nombreCompleto || "",
        dni: usuario.dni || "",
        telefono: usuario.telefono || "",
        direccionCalle: usuario.direccionCalle || "",
        direccionLocalidad: usuario.direccionLocalidad || "",
        direccionProvincia: usuario.direccionProvincia || "",
        direccionPais: usuario.direccionPais || "Argentina"
        // codigoPostal se mantiene vacío si no existe en el usuario
      }));
      setDatosCargados(true);
    }
  }, [usuario, datosCargados]);

  // Validar que todos los campos requeridos estén llenos antes de continuar
  const validarDatosEnvio = () => {
    const camposRequeridos = [
      'nombreCompleto',
      'dni', 
      'telefono',
      'direccionCalle',
      'direccionLocalidad',
      'direccionProvincia'
    ];
    
    return camposRequeridos.every(campo => 
      datosEnvio[campo] && datosEnvio[campo].trim() !== ''
    );
  };

  const handleContinuarPago = () => {
    if (!validarDatosEnvio()) {
      alert("Por favor completa todos los campos obligatorios antes de continuar");
      return;
    }
    setPaso("pago");
  };

  const handleConfirmarCompra = async () => {
    setLoading(true);
    
    try {
      const compraData = {
        // Datos de envío
        nombreCompleto: datosEnvio.nombreCompleto,
        dni: datosEnvio.dni,
        email: usuario.email,
        telefono: datosEnvio.telefono,
        direccionCalle: datosEnvio.direccionCalle,
        direccionLocalidad: datosEnvio.direccionLocalidad,
        direccionProvincia: datosEnvio.direccionProvincia,
        direccionPais: datosEnvio.direccionPais,
        codigoPostal: datosEnvio.codigoPostal,
        
        // Información de pago
        pago: {
          metodo: metodoPago,
          estado: "pendiente",
          alias: "hermanosjotaMuebleria",
          ...(metodoPago === "tarjeta" && {
            tarjeta: {
              ultimosDigitos: datosTarjeta.numero.slice(-4),
              tipo: datosTarjeta.numero.startsWith('4') ? "credito" : "debito"
            }
          })
        },
        
        // Productos
        productos: carrito.map(item => ({
          productoId: item._id || item.id,
          nombre: item.nombre || item.titulo,
          precio: item.precio || item.Precio,
          cantidad: item.cantidad || 1,
          imagen: item.imagen || item.imagenURL
        })),
        
        // Referencias y totales
        usuarioId: usuario._id,
        subtotal: subtotal,
        costoEnvio: costoEnvio,
        total: total,
        nota: nota
      };

      const response = await fetch(`${API_BASE_URL}/compras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(compraData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la compra");
      }

      const compraCreada = await response.json();
      
      // Vaciar carrito
      vaciarCarrito();
      
      // Navegar a confirmación
      navigate("/confirmacion-compra", { 
        state: { 
          compra: compraCreada,
          datosEnvio: datosEnvio 
        } 
      });

    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Error al procesar la compra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-progress">
        <div className={`progress-step ${paso === "envio" ? "active" : ""}`}>
          1. Datos de Envío
        </div>
        <div className={`progress-step ${paso === "pago" ? "active" : ""}`}>
          2. Método de Pago
        </div>
      </div>

      <div className="checkout-content">
        {/* Paso 1: Datos de Envío */}
        {paso === "envio" && (
          <div className="checkout-paso">
            <h2>Datos de Envío</h2>
            <div className="info-usuario">
              {datosCargados && (
                <p className="mensaje-info">
                  {usuario.nombreCompleto ? 
                    "Hemos cargado tus datos. Puedes editarlos si es necesario:" : 
                    "Completa tus datos de envío:"}
                </p>
              )}
            </div>
            <form className="form-envio" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nombre completo *"
                  value={datosEnvio.nombreCompleto}
                  onChange={(e) => setDatosEnvio({...datosEnvio, nombreCompleto: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="DNI *"
                  value={datosEnvio.dni}
                  onChange={(e) => setDatosEnvio({...datosEnvio, dni: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="tel"
                  placeholder="Teléfono *"
                  value={datosEnvio.telefono}
                  onChange={(e) => setDatosEnvio({...datosEnvio, telefono: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Calle y número *"
                  value={datosEnvio.direccionCalle}
                  onChange={(e) => setDatosEnvio({...datosEnvio, direccionCalle: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Localidad *"
                  value={datosEnvio.direccionLocalidad}
                  onChange={(e) => setDatosEnvio({...datosEnvio, direccionLocalidad: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Provincia *"
                  value={datosEnvio.direccionProvincia}
                  onChange={(e) => setDatosEnvio({...datosEnvio, direccionProvincia: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Código Postal"
                  value={datosEnvio.codigoPostal}
                  onChange={(e) => setDatosEnvio({...datosEnvio, codigoPostal: e.target.value})}
                />
              </div>
              
              <button 
                type="button" 
                className="btn-continuar"
                onClick={handleContinuarPago}
                disabled={!validarDatosEnvio()}
              >
                Continuar al Pago
              </button>
              
              {!validarDatosEnvio() && (
                <p className="mensaje-validacion">
                  * Completa todos los campos obligatorios
                </p>
              )}
            </form>
          </div>
        )}

        {/* Paso 2: Método de Pago */}
        {paso === "pago" && (
          <div className="checkout-paso">
            <h2>Método de Pago</h2>
            
            <div className="resumen-envio">
              <h4>Dirección de envío:</h4>
              <p>{datosEnvio.nombreCompleto}</p>
              <p>{datosEnvio.direccionCalle}, {datosEnvio.direccionLocalidad}</p>
              <p>{datosEnvio.direccionProvincia}, {datosEnvio.direccionPais}</p>
              <p>Tel: {datosEnvio.telefono}</p>
              <button 
                type="button" 
                className="btn-editar-direccion"
                onClick={() => setPaso("envio")}
              >
                Editar dirección
              </button>
            </div>

            <div className="metodos-pago">
              <div 
                className={`metodo-pago ${metodoPago === "tarjeta" ? "selected" : ""}`}
                onClick={() => setMetodoPago("tarjeta")}
              >
                <span>💳</span>
                <div>
                  <strong>Tarjeta de Crédito/Débito</strong>
                  <p>Pago seguro con tarjeta</p>
                </div>
              </div>

              <div 
                className={`metodo-pago ${metodoPago === "transferencia" ? "selected" : ""}`}
                onClick={() => setMetodoPago("transferencia")}
              >
                <span>🏦</span>
                <div>
                  <strong>Transferencia Bancaria</strong>
                  <p>ALIAS: hermanosjotaMuebleria</p>
                </div>
              </div>

              <div 
                className={`metodo-pago ${metodoPago === "efectivo" ? "selected" : ""}`}
                onClick={() => setMetodoPago("efectivo")}
              >
                <span>💰</span>
                <div>
                  <strong>Efectivo</strong>
                  <p>Pago al recibir el producto</p>
                </div>
              </div>
            </div>

            {metodoPago === "tarjeta" && (
              <div className="form-tarjeta">
                <input
                  type="text"
                  placeholder="Número de tarjeta"
                  value={datosTarjeta.numero}
                  onChange={(e) => setDatosTarjeta({...datosTarjeta, numero: e.target.value})}
                  maxLength="16"
                />
                <div className="tarjeta-fila">
                  <input
                    type="text"
                    placeholder="MM/AA"
                    value={datosTarjeta.vencimiento}
                    onChange={(e) => setDatosTarjeta({...datosTarjeta, vencimiento: e.target.value})}
                    maxLength="5"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={datosTarjeta.cvv}
                    onChange={(e) => setDatosTarjeta({...datosTarjeta, cvv: e.target.value})}
                    maxLength="3"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Nombre del titular"
                  value={datosTarjeta.nombreTitular}
                  onChange={(e) => setDatosTarjeta({...datosTarjeta, nombreTitular: e.target.value})}
                />
              </div>
            )}

            {metodoPago === "transferencia" && (
              <div className="info-transferencia">
                <h3>Datos para transferencia:</h3>
                <p><strong>ALIAS:</strong> hermanosjotaMuebleria</p>
                <p><strong>CBU:</strong> 0000000000000000000000</p>
                <p>Una vez realizada la transferencia, envía el comprobante a nuestro WhatsApp</p>
              </div>
            )}

            {metodoPago === "efectivo" && (
              <div className="info-efectivo">
                <h3>Pago en efectivo</h3>
                <p>Pagarás al momento de recibir tu pedido</p>
                <p>Asegúrate de tener el monto exacto o cercano</p>
              </div>
            )}

            <div className="checkout-actions">
              <button 
                className="btn-volver"
                onClick={() => setPaso("envio")}
              >
                Volver
              </button>
              <button 
                className="btn-confirmar"
                onClick={handleConfirmarCompra}
                disabled={!metodoPago || loading}
              >
                {loading ? "Procesando..." : "Confirmar Compra"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resumen del pedido */}
      <div className="checkout-resumen">
        <h3>Resumen de la Compra</h3>
        <div className="resumen-productos">
          {carrito?.map(producto => (
            <div key={producto._id || producto.id} className="resumen-producto">
              <img src={producto.imagen || producto.imagenURL} alt={producto.nombre || producto.titulo} />
              <div className="resumen-producto-info">
                <p className="producto-nombre">{producto.nombre || producto.titulo}</p>
                <p className="producto-cantidad">Cantidad: {producto.cantidad || 1}</p>
              </div>
              <span className="producto-subtotal">
                ${((producto.precio || 0) * (producto.cantidad || 1)).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        
        <div className="resumen-totales">
          <div className="resumen-linea">
            <span>Subtotal:</span>
            <span>${subtotal?.toLocaleString()}</span>
          </div>
          <div className="resumen-linea">
            <span>Envío:</span>
            <span>
              {costoEnvio === 0 ? (
                <span className="envio-gratis">GRATIS</span>
              ) : (
                `$${costoEnvio?.toLocaleString()}`
              )}
            </span>
          </div>
          <div className="resumen-total">
            <strong>Total:</strong>
            <strong>${total?.toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;