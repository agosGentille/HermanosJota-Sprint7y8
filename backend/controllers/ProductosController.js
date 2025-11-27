const Producto = require("../models/producto");
const Categoria = require("../models/categories"); 

// GET todos los productos
const getAllProductos = async (req, res) => {
  try {
    const { populate } = req.query;
    let query = Producto.find();

    // Populate condicional (si tu schema no tiene ref, esto no rompe; simplemente no popula)
    if (populate === 'true' || populate === '1') {
      query = query.populate('categoria');
    }

    const productos = await query.sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET producto por _id o por id personalizado
const getProductoPorId = async (req, res) => {
  try {
    const { populate } = req.query;
    const populateOption = (populate === 'true' || populate === '1') ? 'categoria' : null;

    let producto;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      producto = await Producto.findById(req.params.id).populate(populateOption);
    } else {
      producto = await Producto.findOne({ id: req.params.id }).populate(populateOption);
    }

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST crear nuevo producto
const postProducto = async (req, res) => {
  try {
    const { titulo, Precio, stock, categoria, id } = req.body;

    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }
    if (!Precio || Precio <= 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }
    if (!categoria) {
      return res.status(400).json({ error: 'La categoría es obligatoria' });
    }
    if (!id || id.trim() === '') {
      return res.status(400).json({ error: 'El ID personalizado es obligatorio' });
    }

    // Verificar si la categoría existe
    const categoriaExistente = await Categoria.findById(categoria);
    if (!categoriaExistente) {
      return res.status(400).json({ error: 'La categoría no existe' });
    }

    // Verificar ID personalizado único
    const productoExistente = await Producto.findOne({ id: id });
    if (productoExistente) {
      return res.status(400).json({ error: "Ya existe un producto con este ID personalizado" });
    }

    const nuevoProducto = new Producto({
      titulo: titulo.trim(),
      Precio: parseFloat(Precio),
      stock: parseInt(stock) || 0,
      categoria: categoria, // guardamos el ObjectId (o string) recibido
      id: id.trim()
    });

    const productoGuardado = await nuevoProducto.save();
    await productoGuardado.populate('categoria');
    res.status(201).json(productoGuardado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT actualizar producto por _id o id personalizado
const updateProducto = async (req, res) => {
  try {
    // Si actualizan la categoría, verificar que exista
    if (req.body.categoria) {
      const categoriaExistente = await Categoria.findById(req.body.categoria);
      if (!categoriaExistente) {
        return res.status(400).json({ error: 'La categoría no existe' });
      }
    }

    let productoActualizado;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      productoActualizado = await Producto.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('categoria');
    } else {
      productoActualizado = await Producto.findOneAndUpdate(
        { id: req.params.id },
        req.body,
        { new: true, runValidators: true }
      ).populate('categoria');
    }

    if (!productoActualizado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(productoActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE eliminar producto por _id o id personalizado
const deleteProducto = async (req, res) => {
  try {
    let productoEliminado;

    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      productoEliminado = await Producto.findByIdAndDelete(req.params.id);
    } else {
      productoEliminado = await Producto.findOneAndDelete({ id: req.params.id });
    }

    if (!productoEliminado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProductos,
  getProductoPorId,
  postProducto,
  updateProducto,
  deleteProducto,
};
