const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  activa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'categories' // ← ESTA LÍNEA ES CLAVE
});

module.exports = mongoose.model('Category', categorySchema, 'categories');