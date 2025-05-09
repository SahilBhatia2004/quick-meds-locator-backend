
const express = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

module.exports = router;
