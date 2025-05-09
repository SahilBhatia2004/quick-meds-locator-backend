
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true,
  },
  items: [
    {
      medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
      },
      name: String,
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  deliveryLocation: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [Number], // [longitude, latitude]
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'outForDelivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online'],
    default: 'cod',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  prescriptionImages: [String], // URLs to uploaded prescription images if required
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  estimatedDeliveryTime: Date,
});

module.exports = mongoose.model('Order', orderSchema);
