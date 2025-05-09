
const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
  medicineInventory: [
    {
      medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
      },
      stock: {
        type: Number,
        default: 0,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for geospatial queries
pharmacySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Pharmacy', pharmacySchema);
