const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const { authenticate, authorize } = require('../middleware/auth');

// ========== PUBLIC ROUTES ==========
router.post('/submit', testimonialController.submitTestimonial);
router.get('/public', testimonialController.getPublicTestimonials);

// ========== PROTECTED ROUTES (require authentication) ==========
router.use(authenticate);

// ========== ADMIN ROUTES ==========
router.get('/stats', authorize('admin'), testimonialController.getStats);
router.get('/', authorize('admin'), testimonialController.getAllTestimonials);
router.get('/:id', authorize('admin'), testimonialController.getTestimonial);
router.post('/', authorize('admin'), testimonialController.createTestimonial);
router.put('/:id', authorize('admin'), testimonialController.updateTestimonial);
router.patch('/:id/approve', authorize('admin'), testimonialController.approveTestimonial);
router.patch('/:id/reject', authorize('admin'), testimonialController.rejectTestimonial);
router.patch('/:id/toggle-featured', authorize('admin'), testimonialController.toggleFeatured);
router.delete('/:id', authorize('admin'), testimonialController.deleteTestimonial);

module.exports = router;