
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      address
    });
    
    // If address coordinates are provided
    if (req.body.location && req.body.location.coordinates) {
      user.location = req.body.location;
    } else if (address) {
      // In a real app, you would use a geocoding service here to convert address to coordinates
      // For now, we'll set default coordinates
      user.location = {
        type: 'Point',
        coordinates: [0, 0] // longitude, latitude
      };
    }
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'yoursecretkey',
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        token
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while registering',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'yoursecretkey',
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        token
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while logging in',
      error: error.message
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    
    // Update location if address changes
    if (address) {
      // In a real app, you would use a geocoding service here to convert address to coordinates
      // For now, we'll leave the existing coordinates
      updateData.address = address;
    }
    
    // Update location directly if provided
    if (req.body.location && req.body.location.coordinates) {
      updateData.location = req.body.location;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: error.message
    });
  }
};

// Update user password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating password',
      error: error.message
    });
  }
};
