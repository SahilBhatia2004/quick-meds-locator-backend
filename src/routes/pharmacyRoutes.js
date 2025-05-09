
const express = require('express');
const {
  getAllPharmacies,
  getNearestPharmacies,
  checkMedicineAvailability,
  findPharmacyWithMedicines
} = require('../controllers/pharmacyController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllPharmacies);
router.get('/nearest', getNearestPharmacies);
router.post('/availability', protect, checkMedicineAvailability);
router.post('/find-with-medicines', protect, findPharmacyWithMedicines);

module.exports = router;
