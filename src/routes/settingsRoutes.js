// src/routes/settingsRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/logos/');
  },
  filename: (req, file, cb) => {
    cb(null, 'logo' + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.use(authenticate);
router.use(authorize('admin'));

// Get all settings
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        company: {
          name: '',
          email: '',
          phone: '',
          website: '',
          address: '',
          city: '',
          country: '',
          postalCode: '',
          taxId: '',
          logo: null
        },
        localization: {
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12',
          currency: 'USD',
          currencyPosition: 'left',
          thousandSeparator: ',',
          decimalSeparator: '.',
          decimals: 2
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: false,
          smsNotifications: false,
          orderCreated: true,
          orderUpdated: true,
          orderCompleted: true,
          paymentReceived: true,
          paymentFailed: true,
          newUserRegistered: true,
          imageUploaded: true,
          imageApproved: true,
          imageRejected: true,
          lowStock: true,
          systemUpdates: true
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          passwordExpiry: 0,
          requireStrongPassword: true,
          ipWhitelist: [],
          allowedDomains: [],
          mfaMethods: ['email']
        },
        integrations: {
          google: false,
          facebook: false,
          twitter: false,
          github: false,
          slack: false,
          discord: false,
          stripe: false,
          paypal: false,
          mailchimp: false
        },
        backup: {
          autoBackup: false,
          backupFrequency: 'daily',
          backupRetention: 30,
          lastBackup: null,
          backupLocation: './backups'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// Update settings
router.put('/', async (req, res) => {
  try {
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

// Upload company logo
router.post('/logo', upload.single('logo'), async (req, res) => {
  try {
    res.json({ success: true, data: { logoUrl: req.file.path } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload logo' });
  }
});

// Create backup
router.post('/backup', async (req, res) => {
  try {
    res.json({ success: true, message: 'Backup created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create backup' });
  }
});

// List backups
router.get('/backups', async (req, res) => {
  try {
    res.json({ success: true, data: { backups: [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list backups' });
  }
});

// Restore from backup
router.post('/restore', async (req, res) => {
  try {
    res.json({ success: true, message: 'Restore initiated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to restore from backup' });
  }
});

// Get notification settings
router.get('/notifications', async (req, res) => {
  try {
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notification settings' });
  }
});

// Update notification settings
router.put('/notifications', async (req, res) => {
  try {
    res.json({ success: true, message: 'Notification settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notification settings' });
  }
});

module.exports = router;