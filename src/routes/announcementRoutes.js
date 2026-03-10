const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middleware/auth');

// ========== PUBLIC ROUTES ==========
router.get('/', announcementController.getAnnouncements);
router.get('/stats', announcementController.getStats);
router.get('/timeline', announcementController.getTimeline);
router.get('/types', announcementController.getTypes);
router.get('/tags', announcementController.getTags);
router.get('/:id', announcementController.getAnnouncement);
router.get('/:id/comments', announcementController.getComments);

// Interaction routes
router.post('/:id/like', announcementController.likeAnnouncement);
router.post('/:id/comments', announcementController.addComment);

// Newsletter routes
router.post('/newsletter/subscribe', announcementController.subscribeNewsletter);
router.get('/newsletter/unsubscribe/:email', announcementController.unsubscribeNewsletter);

// ========== PROTECTED ROUTES (require authentication) ==========
router.use(authenticate);

// ========== ADMIN ROUTES ==========
router.get('/admin/all', authorize('admin'), announcementController.getAllAnnouncementsAdmin);
router.post('/', authorize('admin'), announcementController.createAnnouncement);
router.put('/:id', authorize('admin'), announcementController.updateAnnouncement);
router.delete('/:id', authorize('admin'), announcementController.deleteAnnouncement);
router.put('/admin/stats', authorize('admin'), announcementController.updateStats);
router.put('/admin/timeline', authorize('admin'), announcementController.updateTimeline);
router.get('/admin/subscribers', authorize('admin'), announcementController.getSubscribers);
router.get('/admin/subscribers/export', authorize('admin'), announcementController.exportSubscribers);

module.exports = router;