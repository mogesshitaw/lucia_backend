const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { authenticate, authorize } = require('../middleware/auth');
const imageController = require('../controllers/imageController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

// =====================================================
// IMPORTANT: Order matters - Place specific routes BEFORE parameterized routes
// =====================================================

// 1. STATS route - MUST come before /:id
router.get('/stats', imageController.getStats);

// 2. TAGS route
router.get('/tags', imageController.getTags);

// 3. FAVORITES routes
router.get('/favorites', imageController.getFavorites);
router.post('/:id/favorite', imageController.toggleFavorite); // This has :id but is specific

// 4. HISTORY route
router.get('/history', imageController.getHistory);

// 5. CATEGORIES route
router.get('/categories', imageController.getCategories);

// 6. UPLOAD route
router.post(
  '/upload',
  upload.array('files', 10),
  imageController.uploadImages
);

// 7. PARAMETERIZED routes - These come AFTER all specific routes
// Single image operations
router.get('/:id', imageController.getImage);
router.get('/:id/download', imageController.downloadImage);
router.post('/:id/approve', authorize('admin', 'cashier'), imageController.approveImage);
router.post('/:id/reject', authorize('admin', 'cashier'), imageController.rejectImage);
router.delete('/:id', authorize('admin'), imageController.deleteImage);
router.patch('/:id', imageController.updateImage);

// 8. MAIN LIST route - This should be last as it's the most general
router.get('/', imageController.getImages);

module.exports = router;