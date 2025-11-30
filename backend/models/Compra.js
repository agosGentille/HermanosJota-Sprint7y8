const mongoose = require("mongoose");

const compraSchema = new mongoose.Schema({
  nroCompra: { type: Number, required: true, unique: true },
  nombreCompleto: { type: String, required: true },
  dni: { type: String, required: true },

  // Datos de contacto
  email: { type: String, required: true },
  telefono: { type: String, required: true },

  // Datos de envío
  direccionCalle: { type: String, required: true },
  direccionLocalidad: { type: String, required: true },
  direccionProvincia: { type: String, required: true },
  direccionPais: { type: String, required: true },

  // Estado del pedido
  estado: {type: String,enum: ["En preparación", "En camino", "Cancelado", "Entregado"],default: "En preparación" },
  pagado: {type: String,enum: ["Pagado", "No pagado"],default: "No pagado"},
  fechaCompra: {  type: Date, default: Date.now },

  // Productos comprados
  productoId: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },

  //referencia del usuario
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Compra", compraSchema, "compras");