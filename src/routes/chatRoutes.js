// src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/chat/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.use(authenticate);

// Get all conversations
router.get('/conversations', async (req, res) => {
  try {
    res.json({ success: true, data: { conversations: [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
});

// Get messages in conversation
router.get('/messages/:conversationId', async (req, res) => {
  try {
    res.json({ success: true, data: { messages: [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// Send new message
router.post('/messages', async (req, res) => {
  try {
    res.json({ success: true, data: { message: {} } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Upload file in chat
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    res.json({ success: true, data: { fileUrl: req.file.path } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload file' });
  }
});

// Mark conversation as read
router.post('/read/:conversationId', async (req, res) => {
  try {
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

// Send typing indicator
router.post('/typing', async (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send typing indicator' });
  }
});

// Delete message
router.delete('/messages/:id', async (req, res) => {
  try {
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
});

module.exports = router;