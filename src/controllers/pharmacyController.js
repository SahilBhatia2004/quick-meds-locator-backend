
const Pharmacy = require('../models/Pharmacy');
const geolib = require('geolib');

// Get all pharmacies
exports.getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find().select('-medicineInventory');
    
    res.json({
      success: true,
      count: pharmacies.length,
      data: pharmacies
    });
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pharmacies',
      error: error.message
    });
  }
};

// Find nearest pharmacies based on user location
exports.getNearestPharmacies = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }
    
    // Find pharmacies within the specified radius (in meters)
    const nearbyPharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      isOpen: true
    }).select('-medicineInventory');
    
    res.json({
      success: true,
      count: nearbyPharmacies.length,
      data: nearbyPharmacies
    });
  } catch (error) {
    console.error('Error finding nearest pharmacies:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while finding nearest pharmacies',
      error: error.message
    });
  }
};

// Check if medicines are available at specific pharmacy
exports.checkMedicineAvailability = async (req, res) => {
  try {
    const { pharmacyId, medicines } = req.body;
    
    if (!pharmacyId || !medicines || !Array.isArray(medicines)) {
      return res.status(400).json({
        success: false,
        message: 'Pharmacy ID and medicines array are required'
      });
    }
    
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }
    
    const availability = medicines.map(med => {
      const inventoryItem = pharmacy.medicineInventory.find(
        item => item.medicineId.toString() === med.medicineId
      );
      
      return {
        medicineId: med.medicineId,
        requestedQuantity: med.quantity,
        available: inventoryItem ? inventoryItem.stock >= med.quantity : false,
        stock: inventoryItem ? inventoryItem.stock : 0
      };
    });
    
    const allAvailable = availability.every(item => item.available);
    
    res.json({
      success: true,
      data: {
        pharmacyId,
        pharmacyName: pharmacy.name,
        allAvailable,
        availability
      }
    });
  } catch (error) {
    console.error('Error checking medicine availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking medicine availability',
      error: error.message
    });
  }
};

// Find pharmacy that has all the medicines in stock
exports.findPharmacyWithMedicines = async (req, res) => {
  try {
    const { longitude, latitude, medicines, maxDistance = 10000 } = req.body;
    
    if (!longitude || !latitude || !medicines || !Array.isArray(medicines)) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates and medicines array are required'
      });
    }
    
    // Get nearby pharmacies
    const nearbyPharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      isOpen: true
    });
    
    // Check medicine availability in each pharmacy
    const pharmacyAvailability = [];
    
    for (const pharmacy of nearbyPharmacies) {
      const medicineAvailability = medicines.map(med => {
        const inventoryItem = pharmacy.medicineInventory.find(
          item => item.medicineId.toString() === med.medicineId
        );
        
        return {
          medicineId: med.medicineId,
          available: inventoryItem ? inventoryItem.stock >= med.quantity : false,
        };
      });
      
      const allAvailable = medicineAvailability.every(item => item.available);
      
      if (allAvailable) {
        pharmacyAvailability.push({
          pharmacyId: pharmacy._id,
          name: pharmacy.name,
          address: pharmacy.address,
          location: pharmacy.location,
          distance: geolib.getDistance(
            { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
            { 
              latitude: pharmacy.location.coordinates[1], 
              longitude: pharmacy.location.coordinates[0] 
            }
          )
        });
      }
    }
    
    // Sort by distance
    pharmacyAvailability.sort((a, b) => a.distance - b.distance);
    
    res.json({
      success: true,
      count: pharmacyAvailability.length,
      data: pharmacyAvailability
    });
  } catch (error) {
    console.error('Error finding pharmacy with medicines:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while finding pharmacy',
      error: error.message
    });
  }
};
