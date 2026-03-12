// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const emailService = require('../utils/emailService');

class AuthController {
  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.resendVerification = this.resendVerification.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.logout = this.logout.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.generateAccessToken = this.generateAccessToken.bind(this);
    this.generateRefreshToken = this.generateRefreshToken.bind(this);
    this.formatUserResponse = this.formatUserResponse.bind(this);
  }

  // Helper to format user response
  formatUserResponse(user) {
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone || '',
      company: user.company || '',
      role: user.role,
      avatar: user.profile_photo_url || null,
      isActive: user.is_active,
      status: user.status,
      emailVerified: user.email_verified,
      memberSince: user.created_at,
      lastLogin: user.last_login
    };
  }

  // Register new user
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array().reduce((acc, err) => {
            acc[err.path] = err.msg;
            return acc;
          }, {})
        });
      }

      const { email } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create user
      const user = await User.create(req.body);

      // Send verification email
      await emailService.sendVerificationEmail(
        user.email,
        user.first_name,
        user.verificationCode
      );

      // Generate tokens
      const accessToken = this.generateAccessToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Save refresh token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await User.setRefreshToken(user.id, refreshToken, expiresAt, req.get('user-agent'), req.ip);

      // Set refresh token cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for verification code.',
        data: {
          user: this.formatUserResponse(user),
          accessToken,
          expiresIn: 15 * 60
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during registration'
      });
    }
  }

  // Login user - FIXED VERSION (no getCurrentUserProfile)
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array().reduce((acc, err) => {
            acc[err.path] = err.msg;
            return acc;
          }, {})
        });
      }

      const { email, password } = req.body;
      const ip = req.ip;
      const userAgent = req.get('user-agent');

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is locked
      const isLocked = await User.isAccountLocked(user.id);
      if (isLocked) {
        return res.status(401).json({
          success: false,
          message: 'Account is temporarily locked. Please try again later.'
        });
      }

      // Validate password
      const isValidPassword = await User.validatePassword(user, password);
      if (!isValidPassword) {
        // Increment failed attempts
        await User.incrementFailedAttempts(email, ip, userAgent);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if email is verified (for customers)
      if (user.role === 'customer' && !user.email_verified) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email before logging in'
        });
      }

      // Check if user is active
      if (!user.is_active || user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Update last login
      await User.updateLastLogin(user.id, ip, userAgent);

      // Generate tokens
      const accessToken = this.generateAccessToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Save refresh token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await User.setRefreshToken(user.id, refreshToken, expiresAt, userAgent, ip);

      // Set refresh token cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      // FIXED: Use findById instead of getCurrentUserProfile
      const userProfile = await User.findById(user.id);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: this.formatUserResponse(userProfile || user),
          accessToken,
          expiresIn: 15 * 60
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during login'
      });
    }
  }

  // Get current user (using the auth middleware)
  async getCurrentUser(req, res) {
    try {
      const userId = req.user?.id || req.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: this.formatUserResponse(user)
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile'
      });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user.id);

      res.json({
        success: true,
        data: {
          accessToken,
          expiresIn: 15 * 60
        }
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Refresh token expired'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (refreshToken) {
        await User.removeRefreshToken(refreshToken);
      }

      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during logout'
      });
    }
  }

  // Verify email
  async verifyEmail(req, res) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: 'Email and verification code are required'
        });
      }

      const result = await User.verifyEmailWithCode(email, code);

      if (!result) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code'
        });
      }

      res.json({
        success: true,
        message: 'Email verified successfully. You can now login.'
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during email verification'
      });
    }
  }

  // Resend verification
  async resendVerification(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const result = await User.resendVerification(email);

      if (!result) {
        return res.status(400).json({
          success: false,
          message: 'User not found or already verified'
        });
      }

      await emailService.sendVerificationEmail(
        result.email,
        result.firstName,
        result.code
      );

      res.json({
        success: true,
        message: 'Verification code sent successfully'
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred'
      });
    }
  }

  // Generate access token
  generateAccessToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' }
    );
  }

  // Generate refresh token
  generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }
}

module.exports = new AuthController();