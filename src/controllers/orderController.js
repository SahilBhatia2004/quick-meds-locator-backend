
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const geolib = require('geolib');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { pharmacyId, paymentMethod } = req.body;
    const userId = req.user.id;
    
    // Get user cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Check if any medicine requires prescription
    const requiresPrescription = cart.items.some(item => item.requiresPrescription);
    
    if (requiresPrescription && (!cart.prescriptionImages || cart.prescriptionImages.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Prescription is required for some medicines in your cart'
      });
    }
    
    // Get user for delivery address
    const user = await User.findById(userId);
    if (!user || !user.address) {
      return res.status(400).json({
        success: false,
        message: 'User address is required'
      });
    }
    
    // Calculate total amount
    const totalAmount = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    );
    
    // Find nearest pharmacy if pharmacyId is not provided
    let selectedPharmacyId = pharmacyId;
    if (!selectedPharmacyId) {
      // Extract all medicine IDs and quantities
      const medicineItems = cart.items.map(item => ({
        medicineId: item.medicineId,
        quantity: item.quantity
      }));
      
      // Find pharmacy with all medicines in stock
      const userCoords = user.location.coordinates;
      const nearbyPharmacies = await Pharmacy.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: userCoords
            },
            $maxDistance: 10000 // 10km radius
          }
        },
        isOpen: true
      });
      
      let bestPharmacy = null;
      let shortestDistance = Infinity;
      
      for (const pharmacy of nearbyPharmacies) {
        // Check if all medicines are available
        const allAvailable = medicineItems.every(med => {
          const inventoryItem = pharmacy.medicineInventory.find(
            item => item.medicineId.toString() === med.medicineId.toString()
          );
          return inventoryItem && inventoryItem.stock >= med.quantity;
        });
        
        if (allAvailable) {
          const distance = geolib.getDistance(
            { latitude: userCoords[1], longitude: userCoords[0] },
            { 
              latitude: pharmacy.location.coordinates[1], 
              longitude: pharmacy.location.coordinates[0] 
            }
          );
          
          if (distance < shortestDistance) {
            shortestDistance = distance;
            bestPharmacy = pharmacy;
          }
        }
      }
      
      if (!bestPharmacy) {
        return res.status(404).json({
          success: false,
          message: 'No pharmacy found with all medicines in stock'
        });
      }
      
      selectedPharmacyId = bestPharmacy._id;
    }
    
    // Create new order
    const order = new Order({
      userId,
      pharmacyId: selectedPharmacyId,
      items: cart.items,
      totalAmount,
      deliveryAddress: user.address,
      deliveryLocation: user.location,
      status: 'pending',
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      prescriptionImages: cart.prescriptionImages || [],
      estimatedDeliveryTime: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
    });
    
    await order.save();
    
    // Clear the cart after successful order
    cart.items = [];
    cart.prescriptionImages = [];
    await cart.save();
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order',
      error: error.message
    });
  }
};

// Get all orders for a user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('pharmacyId', 'name address phone');
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders',
      error: error.message
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('pharmacyId', 'name address phone location');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order',
      error: error.message
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Only allow cancellation if order is pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order in ${order.status} status`
      });
    }
    
    order.status = 'cancelled';
    order.updatedAt = Date.now();
    await order.save();
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order',
      error: error.message
    });
  }
};
