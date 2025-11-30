const express = require("express");
const router = express.Router();
const Compra = require("../models/compras");
const auth = require("../middlewares/verificarToken");

// POST /api/compras - Crear compra
router.post("/", auth, async (req, res) => {
  try {
    const compraData = {
      ...req.body,
      usuarioId: req.user.id
    };

    console.log("📦 Datos recibidos para compra:", compraData);

    if (!compraData.productos || compraData.productos.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "El carrito está vacío" 
      });
    }

    // Validación de productos
    for (let producto of compraData.productos) {
      if (!producto.productoId || !producto.cantidad || !producto.precio) {
        return res.status(400).json({
          success: false,
          error: "Estructura de productos inválida"
        });
      }
    }

    console.log("🔄 Creando instancia de Compra...");
    const compra = new Compra(compraData);
    
    console.log("📝 Compra antes de guardar - nroCompra:", compra.nroCompra);
    
    await compra.save();
    console.log("✅ Compra guardada - nroCompra:", compra.nroCompra);

    await compra.populate("productos.productoId", "nombre titulo precio imagen imagenURL");
    
    res.status(201).json({
      success: true,
      mensaje: "Compra creada exitosamente",
      compra: compra,
      nroCompra: compra.nroCompra 
    });
  } catch (error) {
    console.error("❌ Error creando compra:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        error: "Datos de compra inválidos: " + error.message 
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Error de duplicación en el número de compra"
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: "Error interno del servidor al crear la compra" 
    });
  }
});

// GET /api/compras/mis-compras - Obtener compras del usuario
router.get("/mis-compras", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const compras = await Compra.find({ usuarioId: req.user.id })
      .sort({ fechaCompra: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("productos.productoId", "nombre titulo precio imagen imagenURL")
      .select("-__v");

    const total = await Compra.countDocuments({ usuarioId: req.user.id });

    res.json({
      success: true,
      count: compras.length,
      totalCompras: total,
      paginacion: {
        paginaActual: parseInt(page),
        totalPaginas: Math.ceil(total / limit),
        porPagina: parseInt(limit)
      },
      compras: compras
    });
  } catch (error) {
    console.error("Error obteniendo compras:", error);
    res.status(500).json({ 
      success: false,
      error: "Error al obtener las compras" 
    });
  }
});

// GET /api/compras/mis-compras/:id - Obtener compra específica
router.get("/mis-compras/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "ID de compra inválido"
      });
    }

    const compra = await Compra.findOne({
      _id: id,
      usuarioId: req.user.id
    })
    .populate("productos.productoId", "nombre titulo precio imagen imagenURL descripcion categoria")
    .select("-__v");

    if (!compra) {
      return res.status(404).json({
        success: false,
        error: "Compra no encontrada"
      });
    }

    res.json({
      success: true,
      compra: compra
    });
  } catch (error) {
    console.error("Error obteniendo compra:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: "ID de compra inválido"
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Error al obtener la compra"
    });
  }
});

module.exports = router;