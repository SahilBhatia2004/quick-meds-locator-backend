
const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all order routes
router.use(protect);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
