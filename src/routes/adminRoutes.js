const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { createEmployeeValidation } = require('../middleware/validation');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Employee management
router.post('/employees', createEmployeeValidation, adminController.createEmployee);
router.get('/employees', adminController.getEmployees);

// Customer management
router.get('/users', adminController.getCustomers);

// User management
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Dropdown data
router.get('/roles', adminController.getRoles);
router.get('/departments', adminController.getDepartments);
router.get('/customer-tiers', adminController.getCustomerTiers);

module.exports = router;