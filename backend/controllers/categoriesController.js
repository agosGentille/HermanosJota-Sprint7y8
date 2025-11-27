const Category = require("../models/categories");

// GET /api/categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/categories/:id
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { nombre, descripcion, activa } = req.body;
    const nueva = await Category.create({ nombre, descripcion, activa });
    res.status(201).json(nueva);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const { nombre, descripcion, activa } = req.body;
    const actualizada = await Category.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, activa },
      { new: true, runValidators: true }
    );
    if (!actualizada) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(actualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const eliminada = await Category.findByIdAndDelete(req.params.id);
    if (!eliminada) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};