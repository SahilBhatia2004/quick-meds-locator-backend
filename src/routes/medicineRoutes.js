
const express = require('express');
const { searchMedicines, getMedicineById } = require('../controllers/medicineController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/search', searchMedicines);
router.get('/:id', getMedicineById);

module.exports = router;
