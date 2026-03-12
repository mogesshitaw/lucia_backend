const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ==================== PUBLIC PROFILE ROUTES (Require Authentication) ====================

// All routes below require authentication
router.use(authenticate);

// Get current user profile
router.get('/profile', userController.getCurrentUserProfile);

// Update current user profile
router.put('/profile', [
  body('firstName').optional().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').optional().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('company').optional().isLength({ max: 100 }).withMessage('Company name too long'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio too long (max 500 characters)'),
], userController.updateCurrentUserProfile);

// Upload avatar
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);

// Change password
router.post('/change-password', [
  body('oldPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and numbers'),
], userController.changePassword);

// Get user activity
router.get('/activity', userController.getMyActivity);

// Get user sessions
router.get('/sessions', userController.getMySessions);

// Terminate a specific session
router.delete('/sessions/:sessionId', userController.terminateMySession);

// Terminate all other sessions
router.post('/sessions/terminate-others', userController.terminateAllOtherSessions);

// ==================== ADMIN ROUTES (Require Admin Role) ====================

// All routes below require admin role
router.use(authorize('admin'));

// User statistics
router.get('/stats', userController.getUserStats);

// Get all users (admin)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString(),
  query('role').optional().isString(),
  query('status').optional().isString(),
], userController.getAllUsers);

// Get recent users
router.get('/recent', userController.getRecentUsers);

// Get users by role
router.get('/role/:role', userController.getUsersByRole);

// Export users
router.get('/export', userController.exportUsers);

// Get user by ID (admin)
router.get('/:userId', [
  param('userId').isUUID().withMessage('Invalid user ID')
], userController.getUserById);

// Create new user (admin)
router.post('/', [
  body('firstName').isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['admin', 'customer', 'receptionist', 'cashier', 'designer', 'printer']).withMessage('Invalid role'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
], userController.createUser);

// Update user (admin)
router.put('/:userId', [
  param('userId').isUUID().withMessage('Invalid user ID'),
  body('firstName').optional().isLength({ min: 2, max: 50 }),
  body('lastName').optional().isLength({ min: 2, max: 50 }),
  body('phone').optional().isMobilePhone(),
  body('role').optional().isIn(['admin', 'customer', 'receptionist', 'cashier', 'designer', 'printer']),
], userController.updateUser);

// Update user status
router.patch('/:userId/status', [
  param('userId').isUUID().withMessage('Invalid user ID'),
  body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
], userController.updateUserStatus);

// Update user role
router.patch('/:userId/role', [
  param('userId').isUUID().withMessage('Invalid user ID'),
  body('role').isIn(['admin', 'customer', 'receptionist', 'cashier', 'designer', 'printer']).withMessage('Invalid role'),
], userController.updateUserRole);

// Delete user (soft delete)
router.delete('/:userId', [
  param('userId').isUUID().withMessage('Invalid user ID')
], userController.deleteUser);

// Bulk operations
router.post('/bulk', userController.bulkUserOperations);

// Impersonate user
router.post('/:userId/impersonate', userController.impersonateUser);

// Get user login history
router.get('/:userId/login-history', userController.getUserLoginHistory);

// Get user activity
router.get('/:userId/activity', userController.getUserActivity);

// Get user sessions
router.get('/:userId/sessions', userController.getUserSessions);

// Terminate user session
router.delete('/:userId/sessions/:sessionId', userController.terminateUserSession);

// Terminate all user sessions
router.post('/:userId/sessions/terminate-all', userController.terminateAllUserSessions);

module.exports = router;