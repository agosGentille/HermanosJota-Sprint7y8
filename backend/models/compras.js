const mongoose = require("mongoose");

const compraSchema = new mongoose.Schema({
  // Información del pedido
  nroCompra: { type: Number,unique: true },
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
  codigoPostal: { type: String },

  // Estado del pedido
  estado: {
    type: String,
    enum: ["pendiente", "confirmado", "preparando", "enviado", "entregado", "cancelado"],
    default: "pendiente"
  },
  
  // Información de pago - ✅ CORREGIDO: hacer pago requerido
  pago: {
    metodo: { 
      type: String, 
      enum: ["tarjeta", "transferencia", "efectivo"], 
      required: true 
    },
    estado: { 
      type: String, 
      enum: ["pendiente", "aprobado", "rechazado"], 
      default: "pendiente" 
    },
    tarjeta: {
      ultimosDigitos: String,
      tipo: String
    },
    comprobante: String,
    alias: { type: String, default: "hermanosjotaMuebleria" }
  },

  fechaCompra: { type: Date, default: Date.now },

  // Productos comprados - ✅ CORREGIDO: hacer productos requeridos
  productos: [{
    productoId: { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    cantidad: { type: Number, required: true, min: 1 },
    imagen: { type: String, required: true }
  }],

  // Referencia del usuario
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Totales
  subtotal: { type: Number, required: true, min: 0 },
  costoEnvio: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },

  // Notas
  nota: { type: String, default: "" }
});

// cambio pre save por pre validate para asegurar nroCompra antes de validación
compraSchema.pre("validate", async function(next) {
  if (this.isNew && !this.nroCompra) {
    try {
      console.log("🔄 Generando nroCompra...");
      
      const maxCompra = await mongoose.connection.db.collection("compras")
        .find()
        .sort({ nroCompra: -1 })
        .limit(1)
        .toArray();
      
      if (maxCompra.length > 0 && maxCompra[0].nroCompra) {
        this.nroCompra = maxCompra[0].nroCompra + 1;
      } else {
        this.nroCompra = 1;
      }
      
      console.log("✅ nroCompra generado:", this.nroCompra);
    } catch (error) {
      console.error("❌ Error generando nroCompra:", error);
      this.nroCompra = 1;
    }
  }
  next();
});

module.exports = mongoose.model("Compras", compraSchema, "compras");