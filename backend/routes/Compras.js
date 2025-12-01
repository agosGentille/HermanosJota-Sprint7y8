const express = require("express");
const router = express.Router();
const ComprasController = require("../controllers/ComprasController");
const auth = require("../middlewares/verificarToken");

// Usar el controlador para todas las rutas
router.post("/", auth, ComprasController.crearCompra);
router.get("/mis-compras", auth, ComprasController.getMisCompras);
router.get("/mis-compras/:id", auth, ComprasController.getCompraById);
router.put("/:id/estado", auth, ComprasController.actualizarEstadoCompra);
router.get("/admin/todas", auth, ComprasController.getTodasCompras);
router.get("/admin/compras/:id", auth, ComprasController.getCompraByIdAdmin);


module.exports = router;