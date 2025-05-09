
const Cart = require('../models/Cart');
const Medicine = require('../models/Medicine');

// Get cart items
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: []
      });
    }
    
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart',
      error: error.message
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { medicineId, quantity = 1 } = req.body;
    
    // Validate medicine exists
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    // Get or create cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: []
      });
    }
    
    // Check if medicine already in cart
    const medicineIndex = cart.items.findIndex(item => 
      item.medicineId.toString() === medicineId
    );
    
    if (medicineIndex > -1) {
      // Medicine exists, update quantity
      cart.items[medicineIndex].quantity += quantity;
    } else {
      // Add new medicine to cart
      cart.items.push({
        medicineId,
        name: medicine.name,
        quantity,
        price: medicine.price,
        requiresPrescription: medicine.requiresPrescription
      });
    }
    
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to cart',
      error: error.message
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { medicineId, quantity } = req.body;
    
    if (!medicineId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Medicine ID and quantity are required'
      });
    }
    
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    const medicineIndex = cart.items.findIndex(item => 
      item.medicineId.toString() === medicineId
    );
    
    if (medicineIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    if (quantity <= 0) {
      // Remove item from cart
      cart.items.splice(medicineIndex, 1);
    } else {
      // Update quantity
      cart.items[medicineIndex].quantity = quantity;
    }
    
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: cart
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating cart',
      error: error.message
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { medicineId } = req.params;
    
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = cart.items.filter(item => 
      item.medicineId.toString() !== medicineId
    );
    
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from cart',
      error: error.message
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart',
      error: error.message
    });
  }
};

// Upload prescription
exports.uploadPrescription = async (req, res) => {
  try {
    // This assumes you have middleware to handle file uploads
    // and the file URLs are available in req.files
    const prescriptionUrls = req.files.map(file => file.path);
    
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: []
      });
    }
    
    cart.prescriptionImages = [...cart.prescriptionImages, ...prescriptionUrls];
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.json({
      success: true,
      message: 'Prescription uploaded successfully',
      data: cart
    });
  } catch (error) {
    console.error('Error uploading prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading prescription',
      error: error.message
    });
  }
};
