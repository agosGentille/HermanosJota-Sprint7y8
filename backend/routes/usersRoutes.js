//rutas para los modales de inicio de sesion y registro
const express = require("express");
const router = express.Router();
const UsersController = require("../controllers/UsersController");
const ComprasController = require("../controllers/ComprasController");
const verificarToken = require("../middlewares/verificarToken");

router.post("/login", UsersController.login);
router.post("/register", UsersController.register);

//perfil usuarios
router.get("/usuario", verificarToken, UsersController.getUsuario);
router.put("/usuario", verificarToken, UsersController.actualizarUsuario);
router.delete("/usuario", verificarToken, UsersController.eliminarUsuario);

// no se le pide token porq es un caso de olvido
router.put("/usuario/password", UsersController.updatePassword);

//rutas para admin - gestion de usuarios
router.get("/users", UsersController.getAllUsers);

router.get("/users/:id", UsersController.getUsuario);

router.put("/users/role/:id", verificarToken, UsersController.updateUserRole);

router.delete("/users/:id", verificarToken, UsersController.deleteUser);

//rutas para usuario (ver compras y detalle de compra)
router.get("/mis-compras", verificarToken, ComprasController.getMisCompras);
router.get("/mis-compras/:id", verificarToken, ComprasController.getCompraById);

module.exports = router;
