
const Medicine = require('../models/Medicine');

// Search medicines by name, description, or category
exports.searchMedicines = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    // Using text index search
    const medicines = await Medicine.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(20);
    
    // If no results with text search, try regex as fallback
    if (medicines.length === 0) {
      const regexMedicines = await Medicine.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { manufacturer: { $regex: query, $options: 'i' } }
        ]
      }).limit(20);
      
      return res.json({
        success: true,
        count: regexMedicines.length,
        data: regexMedicines
      });
    }

    res.json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    console.error('Error searching medicines:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching medicines',
      error: error.message
    });
  }
};

// Get medicine by ID
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    res.json({
      success: true,
      data: medicine
    });
  } catch (error) {
    console.error('Error fetching medicine:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching medicine',
      error: error.message
    });
  }
};

// Admin only controllers would be added here (create, update, delete)
