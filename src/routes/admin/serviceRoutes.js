const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const serviceController = require('../../controllers/serviceController');
const { authenticate, authorize } = require('../../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join('uploads', 'services');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'service-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// ==================== STATS ====================
router.get('/stats', serviceController.getServiceStats);

// ==================== CATEGORY ROUTES ====================

// Get all categories
router.get('/categories', serviceController.getCategories);

// Get single category
router.get('/categories/:id', serviceController.getCategoryById);

// Create category
router.post('/categories', serviceController.createCategory);

// Update category
router.put('/categories/:id', serviceController.updateCategory);

// Delete category
router.delete('/categories/:id', serviceController.deleteCategory);

// ==================== SERVICE ROUTES ====================

// Get all services (with filters and pagination)
router.get('/', serviceController.getServices);

// Get service stats
router.get('/stats', serviceController.getServiceStats);

// Get featured services
router.get('/featured', serviceController.getFeaturedServices);

// Search services
router.get('/search', serviceController.searchServices);

// Get services by category
router.get('/category/:category', serviceController.getServicesByCategory);

// Create new service
router.post('/', upload.array('gallery', 10), serviceController.createService);

// Clone service
router.post('/:id/clone', serviceController.cloneService);

// Get single service
router.get('/:id', serviceController.getServiceById);

// Update service
router.put('/:id', upload.array('gallery', 10), serviceController.updateService);

// Delete service
router.delete('/:id', serviceController.deleteService);

// Toggle service status
router.patch('/:id/toggle-status', serviceController.toggleServiceStatus);

// Bulk reorder services
router.post('/reorder', serviceController.reorderServices);
// ==================== CATEGORY ROUTES ====================

// Get all categories
router.get('/categories', serviceController.getCategories);

// Get single category
router.get('/categories/:id', serviceController.getCategoryById);

// Create category
router.post('/categories', serviceController.createCategory);

// Update category
router.put('/categories/:id', serviceController.updateCategory);

// Delete category
router.delete('/categories/:id', serviceController.deleteCategory);

// Bulk reorder categories
router.post('/categories/reorder', serviceController.reorderCategories);


module.exports = router;