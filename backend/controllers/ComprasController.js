const Compra = require("../models/Compra");

// GET /mis-compras (compras del usuario logueado)
exports.getMisCompras = async (req, res) => {
  try {
    const usuarioId = req.user.id; // viene del token

    const compras = await Compra.find({ usuarioId })
      .select("-__v")
      .sort({ fechaCompra: -1 });

    res.json({ compras });
  } catch (error) {
    console.error("Error en getMisCompras:", error);
    res.status(500).json({ error: "Error al obtener las compras" });
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
    }).select("-__v");

    if (!compra) {
      return res.status(404).json({
        error: "Compra no encontrada o no pertenece al usuario",
      });
    }

    res.json({ compra });
  } catch (error) {
    console.error("Error en getCompraById:", error);
    res.status(500).json({ error: "Error al obtener la compra" });
  }
};