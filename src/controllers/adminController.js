const User = require('../models/User');
const { validationResult } = require('express-validator');
const emailService = require('../utils/emailService');
const CodeGenerator = require('../utils/codeGenerator');

class AdminController {
  // Create employee (admin only)
  async createEmployee(req, res) {
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

      // Generate temporary password
      const tempPassword = CodeGenerator.generateRandomPassword();

      // Create employee with temporary password
      const employee = await User.createEmployee({
        ...req.body,
        password: tempPassword
      });

      // Send welcome email with credentials
      await emailService.sendEmployeeWelcomeEmail(
        employee.email,
        `${employee.first_name} ${employee.last_name}`,
        tempPassword,
        employee.role
      );

      res.status(201).json({
        success: true,
        message: 'Employee created successfully. Login credentials sent to email.',
        data: {
          employee: {
            id: employee.id,
            firstName: employee.first_name,
            lastName: employee.last_name,
            email: employee.email,
            role: employee.role,
            employeeId: employee.employeeId,
            department: employee.department,
            position: employee.position
          }
        }
      });
    } catch (error) {
      console.error('Create employee error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while creating employee'
      });
    }
  }

  // Get all employees with pagination
  async getEmployees(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        department = '',
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const result = await User.getAllEmployees({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        department: department || null,
        sortBy,
        sortOrder
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching employees'
      });
    }
  }

  // Get all customers with pagination
  async getCustomers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        tier = '',
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const result = await User.getAllCustomers({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        tier: tier || null,
        sortBy,
        sortOrder
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching customers'
      });
    }
  }

  // Get user by ID (admin)
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred'
      });
    }
  }

  // Update user status (activate/deactivate)
  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (isActive === undefined) {
        return res.status(400).json({
          success: false,
          message: 'isActive field is required'
        });
      }

      const user = await User.updateStatus(id, isActive);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: { user }
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred'
      });
    }
  }

  // Delete user (soft delete)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Don't allow deleting yourself
      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account'
        });
      }

      await User.softDelete(id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred'
      });
    }
  }

  // Get dashboard statistics
  async getDashboardStats(req, res) {
    try {
      const stats = await User.getStats();

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred'
      });
    }
  }

  // Get available roles for dropdown
  async getRoles(req, res) {
    const roles = [
      { value: 'admin', label: 'Admin' },
      { value: 'receptionist', label: 'Receptionist' },
      { value: 'cashier', label: 'Cashier' },
      { value: 'designer', label: 'Designer' },
      { value: 'printer', label: 'Printer' },
      { value: 'customer', label: 'Customer' }
    ];

    res.json({
      success: true,
      data: { roles }
    });
  }

  // Get departments for dropdown
  async getDepartments(req, res) {
    const departments = [
      { value: 'Management', label: 'Management' },
      { value: 'Front Office', label: 'Front Office' },
      { value: 'Finance', label: 'Finance' },
      { value: 'Design', label: 'Design' },
      { value: 'Production', label: 'Production' },
      { value: 'Sales', label: 'Sales' },
      { value: 'Customer Service', label: 'Customer Service' }
    ];

    res.json({
      success: true,
      data: { departments }
    });
  }

  // Get customer tiers for dropdown
  async getCustomerTiers(req, res) {
    const tiers = [
      { value: 'regular', label: 'Regular' },
      { value: 'silver', label: 'Silver' },
      { value: 'gold', label: 'Gold' },
      { value: 'platinum', label: 'Platinum' }
    ];

    res.json({
      success: true,
      data: { tiers }
    });
  }
}

module.exports = new AdminController();