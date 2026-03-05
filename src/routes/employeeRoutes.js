// src/routes/employeeRoutes.js
const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All employee routes require authentication
router.use(authenticate);

// Get employee dashboard
router.get('/dashboard', authorize('admin', 'receptionist', 'cashier', 'designer', 'printer'), (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Employee dashboard',
      role: req.user.role
    }
  });
});

// Get employee tasks
router.get('/tasks', authorize('admin', 'receptionist', 'cashier', 'designer', 'printer'), async (req, res) => {
  try {
    // Add your tasks logic here
    res.json({
      success: true,
      data: { tasks: [] }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks'
    });
  }
});

// Update task status
router.patch('/tasks/:taskId', authorize('admin', 'receptionist', 'cashier', 'designer', 'printer'), async (req, res) => {
  try {
    // Add your task update logic here
    res.json({
      success: true,
      message: 'Task updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating task'
    });
  }
});

module.exports = router;