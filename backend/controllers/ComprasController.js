// ✅ CORREGIDO: Importación correcta del modelo
const Compra = require("../models/compras");

// GET /mis-compras (compras del usuario logueado)
exports.getMisCompras = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const compras = await Compra.find({ usuarioId })
      .select("-__v")
      .populate("productos.productoId", "nombre titulo precio imagen imagenURL")
      .sort({ fechaCompra: -1 });

    res.json({ 
      success: true,
      count: compras.length,
      compras 
    });
  } catch (error) {
    console.error("Error en getMisCompras:", error);
    res.status(500).json({ 
      success: false,
      error: "Error al obtener las compras" 
    });
  }
};

// GET /mis-compras/:id (detalle de compra del usuario)
exports.getCompraById = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const compraId = req.params.id;

    const compra = await Compra.findOne({
      _id: compraId,
      usuarioId,
    })
      .select("-__v")
      .populate("productos.productoId", "nombre titulo precio imagen imagenURL descripcion");

    if (!compra) {
      return res.status(404).json({
        success: false,
        error: "Compra no encontrada o no pertenece al usuario"
      });
    }

    res.json({
      success: true,
      compra
    });
  } catch (error) {
    console.error("Error en getCompraById:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener la compra"
    });
  }
};

// ✅ CORREGIDO: Crear nueva compra con mejor manejo de errores
exports.crearCompra = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    
    // ✅ Validar que hay productos en el carrito
    if (!req.body.productos || req.body.productos.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "El carrito está vacío" 
      });
    }

    const compraData = {
      ...req.body,
      usuarioId // ✅ Asegurar que el usuarioId viene del token
    };

    const compra = new Compra(compraData);
    await compra.save();

    // ✅ Populate para devolver datos completos
    await compra.populate("productos.productoId", "nombre titulo precio imagen imagenURL");

    res.status(201).json({ 
      success: true,
      mensaje: "Compra creada exitosamente",
      compra 
    });
  } catch (error) {
    console.error("Error en crearCompra:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        error: "Datos de compra inválidos: " + error.message 
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Error de duplicación en la compra"
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: "Error interno del servidor al crear la compra" 
    });
  }
};

// ✅ CORREGIDO: Actualizar estado de compra (para admin)
exports.actualizarEstadoCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, pago } = req.body;

    // ✅ Validar que se proporcione al menos un campo para actualizar
    if (!estado && !pago) {
      return res.status(400).json({
        success: false,
        error: "Debe proporcionar estado o pago para actualizar"
      });
    }

    const updateData = {};
    if (estado) updateData.estado = estado;
    if (pago) updateData.pago = pago;

    const compra = await Compra.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("productos.productoId", "nombre titulo precio imagen");

    if (!compra) {
      return res.status(404).json({ 
        success: false,
        error: "Compra no encontrada" 
      });
    }

    res.json({ 
      success: true,
      mensaje: "Estado de compra actualizado",
      compra 
    });
  } catch (error) {
    console.error("Error en actualizarEstadoCompra:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: "Datos de actualización inválidos"
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: "Error al actualizar la compra" 
    });
  }
};