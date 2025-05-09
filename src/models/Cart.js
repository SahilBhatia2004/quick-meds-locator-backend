
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true,
      },
      name: String,
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      price: {
        type: Number,
        required: true,
      },
      requiresPrescription: {
        type: Boolean,
        default: false,
      },
    },
  ],
  prescriptionImages: [String], // URLs to uploaded prescription images
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Cart', cartSchema);
