
const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  manufacturer: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  dosage: String,
  category: {
    type: String,
    required: true,
  },
  requiresPrescription: {
    type: Boolean,
    default: false,
  },
  imageUrl: String,
  composition: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Text index for searching medicines
medicineSchema.index({ name: 'text', description: 'text', manufacturer: 'text', category: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
