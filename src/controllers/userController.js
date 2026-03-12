// controllers/userController.js
const User = require('../models/User');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

class UserController {
  // ==================== PROFILE METHODS (for logged-in users) ====================

  // Get current user profile
  async getCurrentUserProfile(req, res) {
    try {
      const userId = req.userId || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const user = await User.getCurrentUserProfile(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Format the response for your frontend
      const profile = {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.profileCompany || user.company || '',
        position: user.position || '',
        bio: user.bio || '',
        avatar: user.avatar ? this.getFullUrl(req, user.avatar) : null,
        coverImage: null,
        dateOfBirth: null,
        address: {
          street: user.billingAddress?.street || '',
          city: user.billingAddress?.city || '',
          state: user.billingAddress?.state || '',
          country: user.billingAddress?.country || '',
          postalCode: user.billingAddress?.postalCode || '',
        },
        social: {
          linkedin: '',
          twitter: '',
          github: '',
          website: '',
        },
        preferences: user.preferences || {
          language: 'en',
          timezone: 'UTC',
          emailNotifications: true,
          twoFactorAuth: false,
        },
        stats: {
          totalOrders: parseInt(user.totalOrders) || 0,
          totalSpent: parseFloat(user.totalSpent) || 0,
          memberSince: user.memberSince,
          lastLogin: user.lastLogin,
        },
        activity: []
      };

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      logger.error('Get current user profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
  }

  // Update current user profile
  async updateCurrentUserProfile(req, res) {
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

      const userId = req.userId || req.user?.id;
      const { firstName, lastName, phone, company, bio } = req.body;

      const updates = {};
      if (firstName) updates.first_name = firstName;
      if (lastName) updates.last_name = lastName;
      if (phone) updates.phone = phone;
      if (company) updates.company = company;
      if (bio) updates.bio = bio;

      const updatedUser = await User.updateCurrentUserProfile(userId, updates);

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      logger.info(`User ${userId} updated their profile`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  // Upload avatar
  async uploadAvatar(req, res) {
    try {
      const userId = req.userId || req.user?.id;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const avatarPath = req.file.path;
      
      // Get old avatar to delete if exists
      const oldUser = await User.findById(userId);
      if (oldUser && oldUser.profile_photo_url) {
        const oldPath = oldUser.profile_photo_url.replace(`${req.protocol}://${req.get('host')}/`, '');
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Update user with new avatar
      const updatedUser = await User.updateProfilePhoto(userId, avatarPath);

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const avatarUrl = this.getFullUrl(req, avatarPath);

      logger.info(`User ${userId} updated their avatar`);

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: { avatarUrl }
      });
    } catch (error) {
      logger.error('Upload avatar error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload avatar'
      });
    }
  }

  // Change password
  async changePassword(req, res) {
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

      const userId = req.userId || req.user?.id;
      const { oldPassword, newPassword } = req.body;

      const result = await User.changePassword(userId, oldPassword, newPassword);

      if (!result) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      logger.info(`User ${userId} changed their password`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }

  // Get my activity
  async getMyActivity(req, res) {
    try {
      const userId = req.userId || req.user?.id;
      const limit = parseInt(req.query.limit) || 20;
      
      const activity = await User.getUserActivity(userId, limit);

      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      logger.error('Get my activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch activity'
      });
    }
  }

  // Get my sessions
  async getMySessions(req, res) {
    try {
      const userId = req.userId || req.user?.id;
      
      const sessions = await User.getUserSessions(userId);
      
      // Mark current session
      const currentSessionId = req.sessionId;
      const sessionsWithCurrent = sessions.map(session => ({
        ...session,
        isCurrent: session.id === currentSessionId
      }));

      res.json({
        success: true,
        data: sessionsWithCurrent
      });
    } catch (error) {
      logger.error('Get my sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sessions'
      });
    }
  }

  // Terminate my session
  async terminateMySession(req, res) {
    try {
      const userId = req.userId || req.user?.id;
      const { sessionId } = req.params;

      // Don't allow terminating current session
      if (sessionId === req.sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot terminate current session'
        });
      }

      await User.terminateSession(userId, sessionId);

      logger.info(`User ${userId} terminated session ${sessionId}`);

      res.json({
        success: true,
        message: 'Session terminated successfully'
      });
    } catch (error) {
      logger.error('Terminate session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to terminate session'
      });
    }
  }

  // Terminate all other sessions
  async terminateAllOtherSessions(req, res) {
    try {
      const userId = req.userId || req.user?.id;
      
      await User.terminateAllOtherSessions(userId, req.sessionId);

      logger.info(`User ${userId} terminated all other sessions`);

      res.json({
        success: true,
        message: 'All other sessions terminated successfully'
      });
    } catch (error) {
      logger.error('Terminate all sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to terminate sessions'
      });
    }
  }

  // ==================== ADMIN USER MANAGEMENT ====================

  // Get all users with pagination and filters
  async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        role,
        status,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const result = await User.getAllUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        role,
        status,
        sortBy,
        sortOrder
      });

      logger.info(`Admin ${req.userId} fetched users list`);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user by ID (admin)
  async getUserById(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get additional user details like login history
      const loginHistory = await User.getLoginHistory(userId, 10);

      res.json({
        success: true,
        data: {
          ...user,
          login_history: loginHistory
        }
      });
    } catch (error) {
      logger.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  }

  // Create new user (admin)
  async createUser(req, res) {
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
        return res.status(409).json({
          success: false,
          errors: {
            email: 'Email already registered'
          }
        });
      }

      // Create user (auto-verified since admin creates them)
      const userData = {
        ...req.body,
        emailVerified: true // Auto-verify when admin creates
      };

      const newUser = await User.createByAdmin(userData);

      logger.info(`Admin ${req.userId} created new user: ${newUser.email}`);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser
      });
    } catch (error) {
      logger.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  }

  // Update user (admin)
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updates = req.body;

      // Prevent role change to admin if last admin
      if (updates.role && updates.role !== 'admin') {
        const user = await User.findById(userId);
        if (user.role === 'admin') {
          const adminCount = await User.getAdminCount();
          if (adminCount <= 1) {
            return res.status(400).json({
              success: false,
              message: 'Cannot change role of the last admin'
            });
          }
        }
      }

      const updatedUser = await User.updateUser(userId, updates);

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      logger.info(`Admin ${req.userId} updated user: ${userId}`);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }

  // Update user status (activate/deactivate/suspend)
  async updateUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      // Prevent admin from changing their own status
      if (userId === req.userId) {
        return res.status(403).json({
          success: false,
          message: 'You cannot change your own status'
        });
      }

      // Check if last admin
      if (status !== 'active') {
        const user = await User.findById(userId);
        if (user.role === 'admin') {
          const adminCount = await User.getAdminCount();
          if (adminCount <= 1) {
            return res.status(400).json({
              success: false,
              message: 'Cannot deactivate the last admin'
            });
          }
        }
      }

      const result = await User.updateStatus(userId, status);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      logger.info(`Admin ${req.userId} changed user ${userId} status to ${status}`);

      res.json({
        success: true,
        message: `User ${status} successfully`,
        data: result
      });
    } catch (error) {
      logger.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status'
      });
    }
  }

  // Update user role
  async updateUserRole(req, res) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      // Prevent admin from changing their own role
      if (userId === req.userId) {
        return res.status(403).json({
          success: false,
          message: 'You cannot change your own role'
        });
      }

      // Check if last admin
      if (role !== 'admin') {
        const user = await User.findById(userId);
        if (user.role === 'admin') {
          const adminCount = await User.getAdminCount();
          if (adminCount <= 1) {
            return res.status(400).json({
              success: false,
              message: 'Cannot change role of the last admin'
            });
          }
        }
      }

      const result = await User.updateRole(userId, role);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      logger.info(`Admin ${req.userId} changed user ${userId} role to ${role}`);

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: result
      });
    } catch (error) {
      logger.error('Update user role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user role'
      });
    }
  }

  // Delete user (soft delete)
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      // Prevent admin from deleting themselves
      if (userId === req.userId) {
        return res.status(403).json({
          success: false,
          message: 'You cannot delete your own account'
        });
      }

      // Check if last admin
      const user = await User.findById(userId);
      if (user.role === 'admin') {
        const adminCount = await User.getAdminCount();
        if (adminCount <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete the last admin'
          });
        }
      }

      await User.softDelete(userId);

      logger.info(`Admin ${req.userId} deleted user: ${userId}`);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }

  // Bulk operations on users
  async bulkUserOperations(req, res) {
    try {
      const { action, userIds } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No users selected'
        });
      }

      // Prevent admin from affecting themselves
      if (userIds.includes(req.userId)) {
        return res.status(403).json({
          success: false,
          message: 'You cannot perform actions on your own account'
        });
      }

      // Check for last admin if deleting or demoting
      if (action === 'delete' || action === 'deactivate') {
        const adminCount = await User.getAdminCount();
        const adminsInSelection = await User.checkAdminsInList(userIds);
        
        if (adminsInSelection >= adminCount) {
          return res.status(400).json({
            success: false,
            message: 'Cannot perform action on all admins'
          });
        }
      }

      let result;
      switch (action) {
        case 'activate':
          result = await User.bulkActivate(userIds);
          break;
        case 'deactivate':
          result = await User.bulkDeactivate(userIds);
          break;
        case 'delete':
          result = await User.bulkSoftDelete(userIds);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid action'
          });
      }

      logger.info(`Admin ${req.userId} performed bulk ${action} on ${userIds.length} users`);

      res.json({
        success: true,
        message: `Bulk ${action} completed successfully`,
        data: result
      });
    } catch (error) {
      logger.error('Bulk operation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform bulk operation'
      });
    }
  }

  // ==================== USER STATISTICS ====================

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const stats = await User.getUsersStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics'
      });
    }
  }

  // Get recent users
  async getRecentUsers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const users = await User.getRecentUsers(limit);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      logger.error('Get recent users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent users'
      });
    }
  }

  // Get users by role
  async getUsersByRole(req, res) {
    try {
      const { role } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit) : null;
      
      const users = await User.getUsersByRole(role, limit);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      logger.error('Get users by role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users by role'
      });
    }
  }

  // ==================== USER ACTIVITY & HISTORY ====================

  // Get user login history
  async getUserLoginHistory(req, res) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 20;

      const history = await User.getLoginHistory(userId, limit);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Get login history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch login history'
      });
    }
  }

  // Get user activity
  async getUserActivity(req, res) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 20;

      const activity = await User.getUserActivity(userId, limit);

      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      logger.error('Get user activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user activity'
      });
    }
  }

  // ==================== USER SESSIONS ====================

  // Get user active sessions
  async getUserSessions(req, res) {
    try {
      const { userId } = req.params;

      const sessions = await User.getUserSessions(userId);

      res.json({
        success: true,
        data: sessions
      });
    } catch (error) {
      logger.error('Get user sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user sessions'
      });
    }
  }

  // Terminate user session
  async terminateUserSession(req, res) {
    try {
      const { userId, sessionId } = req.params;

      await User.terminateSession(userId, sessionId);

      logger.info(`Admin ${req.userId} terminated session ${sessionId} for user ${userId}`);

      res.json({
        success: true,
        message: 'Session terminated successfully'
      });
    } catch (error) {
      logger.error('Terminate session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to terminate session'
      });
    }
  }

  // Terminate all user sessions
  async terminateAllUserSessions(req, res) {
    try {
      const { userId } = req.params;

      // Don't allow terminating own sessions
      if (userId === req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Cannot terminate your own sessions from here'
        });
      }

      await User.removeAllSessions(userId);

      logger.info(`Admin ${req.userId} terminated all sessions for user ${userId}`);

      res.json({
        success: true,
        message: 'All sessions terminated successfully'
      });
    } catch (error) {
      logger.error('Terminate all sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to terminate sessions'
      });
    }
  }

  // ==================== USER IMPERSONATION ====================

  // Impersonate user (admin only)
  async impersonateUser(req, res) {
    try {
      const { userId } = req.params;

      // Don't allow impersonating yourself
      if (userId === req.userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot impersonate yourself'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate impersonation token
      const { accessToken, expiresIn } = await User.generateImpersonationToken(userId, req.userId);

      logger.info(`Admin ${req.userId} impersonating user ${userId}`);

      res.json({
        success: true,
        message: 'Impersonation successful',
        data: {
          accessToken,
          expiresIn,
          user: {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      logger.error('Impersonation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to impersonate user'
      });
    }
  }

  // ==================== EXPORTS ====================

  // Export users (CSV/Excel)
  async exportUsers(req, res) {
    try {
      const { format = 'json', role, status, search } = req.query;

      const users = await User.getAllUsersSimple({
        role,
        status,
        search
      });

      if (format === 'csv') {
        // Convert to CSV
        const csv = this.convertToCSV(users);
        res.header('Content-Type', 'text/csv');
        res.attachment('users.csv');
        return res.send(csv);
      }

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      logger.error('Export users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export users'
      });
    }
  }

  // Helper: Get full URL for avatar
  getFullUrl(req, path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${req.protocol}://${req.get('host')}/${path.replace(/\\/g, '/')}`;
  }

  // Helper: Convert to CSV
  convertToCSV(users) {
    if (users.length === 0) return '';

    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Role', 'Status', 'Created At'];
    const rows = users.map(user => [
      user.id,
      user.first_name,
      user.last_name,
      user.email,
      user.phone || '',
      user.company || '',
      user.role,
      user.status,
      new Date(user.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  // Delete image (HARD DELETE - permanent)
  async deleteImage(req, res) {
    try {
      const { id } = req.params;

      // Get image info first to delete files
      const imageResult = await query('SELECT * FROM images WHERE id = $1', [id]);
      
      if (imageResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }

      const image = imageResult.rows[0];

      // Delete physical files
      if (fs.existsSync(image.file_path)) {
        fs.unlinkSync(image.file_path);
      }
      if (image.thumbnail_path && fs.existsSync(image.thumbnail_path)) {
        fs.unlinkSync(image.thumbnail_path);
      }

      // PERMANENT DELETE from database (no soft delete)
      await query('DELETE FROM images WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Image deleted permanently'
      });
    } catch (error) {
      console.error('Error in deleteImage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete image'
      });
    }
  }
}

module.exports = new UserController();