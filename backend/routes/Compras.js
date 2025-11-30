const express = require("express");
const router = express.Router();
const Compra = require("../models/compras");
const auth = require("../middlewares/verificarToken");

router.post("/", auth, async (req, res) => {
  try {
    const compraData = {
      ...req.body,
      usuarioId: req.user.id
    };

    if (!compraData.productos || compraData.productos.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "El carrito está vacío" 
      });
    }

    for (let producto of compraData.productos) {
      if (!producto.productoId || !producto.cantidad || !producto.precio) {
        return res.status(400).json({
          success: false,
          error: "Estructura de productos inválida"
        });
      }
    }

    const compra = new Compra(compraData);
    await compra.save();

    await compra.populate("productos.productoId", "nombre titulo precio imagen imagenURL");
    
    res.status(201).json({
      success: true,
      mensaje: "Compra creada exitosamente",
      compra: compra,
      nroCompra: compra.nroCompra 
    });
  } catch (error) {
    console.error("Error creando compra:", error);
    
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

// Obtener compras del usuario 
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

router.put("/:id/estado", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = ["pendiente", "confirmado", "preparando", "enviado", "entregado", "cancelado"];
    if (estado && !estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        error: `Estado '${estado}' no permitido. Estados válidos: ${estadosPermitidos.join(", ")}`
      });
    }

    const compra = await Compra.findOneAndUpdate(
      { 
        _id: id,
        usuarioId: req.user.id 
      },
      { estado },
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
      compra: compra
    });
  } catch (error) {
    console.error("Error actualizando estado de compra:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: "Datos de actualización inválidos"
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Error al actualizar el estado de la compra"
    });
  }
});

router.put("/:id/cancelar", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const compra = await Compra.findOneAndUpdate(
      { 
        _id: id,
        usuarioId: req.user.id,
        estado: { $in: ["pendiente", "confirmado"] } 
      },
      { estado: "cancelado" },
      { new: true }
    ).populate("productos.productoId", "nombre titulo precio imagen");

    if (!compra) {
      return res.status(404).json({
        success: false,
        error: "Compra no encontrada o no se puede cancelar en el estado actual"
      });
    }

    res.json({
      success: true,
      mensaje: "Compra cancelada exitosamente",
      compra: compra
    });
  } catch (error) {
    console.error("Error cancelando compra:", error);
    res.status(500).json({
      success: false,
      error: "Error al cancelar la compra"
    });
  }
});

module.exports = router;