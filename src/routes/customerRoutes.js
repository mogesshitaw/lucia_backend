// src/routes/customerRoutes.js
const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All customer routes require authentication
router.use(authenticate);
router.use(authorize('customer'));

// Get customer dashboard
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Customer dashboard',
      user: req.user
    }
  });
});

// Get customer orders
router.get('/orders', async (req, res) => {
  try {
    // Add your orders logic here
    res.json({
      success: true,
      data: { orders: [] }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// Create new order
router.post('/orders', async (req, res) => {
  try {
    // Add your create order logic here
    res.json({
      success: true,
      message: 'Order created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
});

// Get customer images
router.get('/images', async (req, res) => {
  try {
    // Add your images logic here
    res.json({
      success: true,
      data: { images: [] }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching images'
    });
  }
});

// Upload image
router.post('/images', async (req, res) => {
  try {
    // Add your upload logic here
    res.json({
      success: true,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading image'
    });
  }
});

module.exports = router;