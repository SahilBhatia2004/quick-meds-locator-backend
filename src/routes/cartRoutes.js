
const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  uploadPrescription
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all cart routes
router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:medicineId', removeFromCart);
router.delete('/clear', clearCart);
router.post('/prescription', uploadPrescription);

module.exports = router;
