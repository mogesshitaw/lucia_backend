// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class AuthController {
  constructor() {
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.logout = this.logout.bind(this);
  }

  // Login user - FIXED VERSION
  async login(req, res) {
    console.log('=== LOGIN REQUEST RECEIVED ===');
    console.log('Request body:', req.body);
    
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        console.log('Missing username or password');
        return res.status(400).json({
          success: false,
          error: 'Username and password are required'
        });
      }

      // Find user
      console.log('Searching for user:', username);
      const result = await query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      console.log('Query result rows:', result.rows.length);

      if (result.rows.length === 0) {
        console.log('User not found:', username);
        return res.status(401).json({
          success: false,
          error: 'Invalid username or password'
        });
      }

      const user = result.rows[0];
      console.log('User found:', { id: user.id, username: user.username, is_active: user.is_active });

      // Check if user is active
      if (!user.is_active) {
        console.log('User is inactive:', username);
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated'
        });
      }

      // Verify password
      console.log('Verifying password...');
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      console.log('Password valid:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('Invalid password for user:', username);
        return res.status(401).json({
          success: false,
          error: 'Invalid username or password'
        });
      }

      // Update last login
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
      console.log('Last login updated');

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      console.log('Token generated successfully');

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
          last_login: user.last_login
        }
      });
    } catch (error) {
      console.error('Login error details:', error);
      res.status(500).json({
        success: false,
        error: 'An error occurred during login: ' + error.message
      });
    }
  }

  // Register new user
  async register(req, res) {
    console.log('=== REGISTER REQUEST RECEIVED ===');
    console.log('Request body:', req.body);
    
    try {
      const { username, password, full_name, role = 'admin' } = req.body;

      // Validate input
      if (!username || !password) {
        console.log('Missing username or password');
        return res.status(400).json({
          success: false,
          error: 'Username and password are required'
        });
      }

      if (password.length < 6) {
        console.log('Password too short');
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters'
        });
      }

      // Check if user exists
      const existingUser = await query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      );
      console.log('Existing user check:', existingUser.rows.length);

      if (existingUser.rows.length > 0) {
        console.log('Username already exists:', username);
        return res.status(400).json({
          success: false,
          error: 'Username already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();
      console.log('Creating user with ID:', userId);

      // Create user
      const result = await query(
        `INSERT INTO users (id, username, password_hash, full_name, role, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP)
         RETURNING id, username, full_name, role, created_at`,
        [userId, username, hashedPassword, full_name || username, role]
      );

      const newUser = result.rows[0];
      console.log('User created successfully:', newUser);

      // Generate token
      const token = jwt.sign(
        {
          id: newUser.id,
          username: newUser.username,
          full_name: newUser.full_name,
          role: newUser.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      console.log('Token generated for new user');

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: newUser
      });
    } catch (error) {
      console.error('Registration error details:', error);
      res.status(500).json({
        success: false,
        error: 'An error occurred during registration: ' + error.message
      });
    }
  }

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.id;
      const result = await query(
        'SELECT id, username, full_name, role, is_active, last_login, created_at FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: 'An error occurred'
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'An error occurred'
      });
    }
  }


// Change password endpoint
async changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password hash
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];
    
    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred'
    });
  }
}

// Update profile (full name only for now)
async updateProfile(req, res) {
  try {
    const { full_name } = req.body;
    const userId = req.user.id;

    const result = await query(
      'UPDATE users SET full_name = $1 WHERE id = $2 RETURNING id, username, full_name, role',
      [full_name, userId]
    );

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred'
    });
  }
}
}

module.exports = new AuthController();