// src/routes/userRoutes.js
const  express =require("express");
const  { authenticate }=require('../middleware/auth.js');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: { user: req.user }
  });
});

// Update user profile
router.patch('/profile', async (req, res) => {
  try {
    // Add your profile update logic here
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    // Add your password change logic here
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
});

module.exports= router;