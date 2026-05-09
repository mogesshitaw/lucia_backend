// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const testmoniaRoute=require('./routes/testimonialRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const serviceAdminRoutes = require("./routes/admin/serviceRoutes");
const servicePublicRoute = require("./routes/public/serviceRoutes");
const galleryRoutes = require('./routes/public/galleryRoutes');
const customersRoutes = require('./routes/customers');
dotenv.config({ path: path.join(__dirname, '../.env') });
const limiters = require('./middleware/rateLimit');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', //process.env.CLIENT_URL || 
  credentials: true,
  optionsSuccessStatus: 200
}));



app.use('/api/public/', limiters.public);
app.use('/api/auth/login', limiters.login);
app.use('/api/auth/register', limiters.login);
app.use('/api/', limiters.authenticated);
// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add logging to debug
app.use('/uploads', (req, res, next) => {
  console.log('Serving file:', req.path);
  next();
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/testimonials/',testmoniaRoute);
app.use('/api/announcements', announcementRoutes);
app.use("/api/admin/services", serviceAdminRoutes);
app.use("/api/public/services", servicePublicRoute);
app.use('/api/public/gallery', galleryRoutes);
app.use('/api/customers', customersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
        success: true,
        message: 'SPUMS Backend is running smoothly',
        timestamp: new Date().toISOString(),
        telegram_connected: telegramService.isConnected // የቴሌግራም ግንኙነትን ለማረጋገጥ
  });
});




// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

module.exports = app;