const User = require("../models/users");
// librería para *hashear* contraseñas (convertirlas en algo ilegible)
// Ejemplo: "123456"(contraseña) → "$2a$10$1oEJkf...."(hash)
// Nunca se guarda la contraseña real, solo el hash.
const bcrypt = require("bcryptjs");

// crea "tokens" que identifican al usuario una vez que inició sesión. (asi dejamos d usar el token falso)
// El token sirve para no tener que escribir el mail y password en cada request.
// Ejemplo de token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
const jwt = require("jsonwebtoken");
require("dotenv").config();

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await User.findOne({ email });

    if (!usuario) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }
     // Comparamos la contraseña que envía el usuario con la guardada en la DB.
    // bcrypt.compare() recibe la contraseña ingresada y el hash almacenado.
    // Devuelve true si coinciden, false si no.
    const passwordValida = await bcrypt.compare(password, usuario.clave);

    // Si la comparación con bcrypt falla devuelve 401 y muestra msj de error
    if (!passwordValida) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // CORREGIDO: Token ahora incluye rol, nombre y email
    const token = jwt.sign(
      { 
        id: usuario._id,
        nombre: usuario.nombreCompleto,
        email: usuario.email,
        rol: usuario.rol
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    // Enviamos al frontend el token + datos básicos del usuario para guardar en el localStorage
    res.json({
      token,
      usuario: {
        nombre: usuario.nombreCompleto,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// REGISTRO
exports.register = async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  try {
    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ error: "El usuario ya existe" });

    // Hasheamos la contraseña antes de guardarla
    // bcrypt.hash("contraseña", 10)
    // El segundo parámetro (10) son los "saltRounds":
    // es cuántas veces se repite el proceso de cifrado. Más rondas = más seguro.
    //    Ejemplo: 8 -> rápido pero menos seguro; 
    //    10 -> equilibrio ideal; 
    //    12 -> más seguro pero más lento.
    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new User({
      nombreCompleto: nombre,
      email,
      clave: hashedPassword, // Guardamos el hash, no el password original
      rol: rol || "visitante",
    });

    await nuevoUsuario.save(); //como intervinimos los datos, usamos save() en vez de create()

    // ✅ CORREGIDO: Token ahora incluye rol, nombre y email
    const token = jwt.sign(
      { 
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombreCompleto,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.json({
      token,
      usuario: {
        nombre: nuevoUsuario.nombreCompleto,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

//geu user para "mi perfil"
exports.getUsuario = async (req, res) => {
  try { 
    // .select() sirve para elegir qué campos querés que te devuelva la consulta de MongoDB.
    // El "-" delante del nombre del campo indica exclusión.
    const id = req.user.id;
    const usuario = await User.findById(id).select("-clave");
    //este select significa tipo: “traé todos los campos del usuario, menos el campo clave”.
    console.log("Usuario encontrado: ", usuario);

    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });
    
    res.json({ usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los datos del usuario" });
  }
};

exports.actualizarUsuario = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.clave && updates.clave.trim() !== "") {
      updates.clave = await bcrypt.hash(updates.clave, 10);
    } else {
      delete updates.clave;
    }

    delete updates.email;

    const usuario = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-clave");

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

exports.eliminarUsuario = async (req, res) => {
  try {
    const usuario = await User.findByIdAndDelete(req.user.id);

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ mensaje: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

// actualizar contraseña
exports.updatePassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const usuario = await User.findOne({ email });
  
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
  
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    usuario.clave = hashedPassword;
  
    await usuario.save();
  
    res.json({ message: "Contraseña actualizada correctamente" });
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la contraseña" });
  }
};

// obtener todos los usuarios (solo admin)
exports.getAllUsers = async (req, res) => {
  try {
    const usuarios = await User.find().select("-clave");
    res.status(200).json(usuarios);
    console.log("Usuarios enviados: ", usuarios);
  } catch (error) {
    console.error("Error en /api/usuarios: ", error);
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};

// actualizar rol de usuario (solo admin)
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  try {
    const usuario = await User.findById(id);
    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });
    
    if (usuario.rol === "administrador") {
      return res.status(403).json({ error: "No se puede cambiar el rol de un administrador" });
    }

    // Solo aceptamos roles válidos
    const rolesValidos = ["visitante", "editor"];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ error: "Rol inválido" });
    }

    usuario.rol = rol;
    await usuario.save();
    
    res.json({ message: "Rol actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el rol" });
  }
};

// eliminar usuario (solo admin)
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await User.findById(id);
    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });

    await User.findByIdAndDelete(id);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
};