// src/models/User.js
const { query, transaction } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const CodeGenerator = require('../utils/codeGenerator');

class User {
  // ==================== USER CREATION METHODS ====================

  // Create new user (customer registration)
  static async create(userData) {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      company,
      accountType = 'individual',
    } = userData;

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || 10));
    const verificationToken = uuidv4();
    const verificationCode = CodeGenerator.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    try {
      // Start transaction
      const client = await query.client?.connect?.() || { query };
      
      // Insert user
      const userResult = await query(
        `INSERT INTO users (
          username, first_name, last_name, email, phone, password_hash, 
          company, account_type, role, email_verification_token, 
          email_verification_expires, is_active, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
        RETURNING id, first_name, last_name, email, phone, company, 
                  account_type, role, email_verified, is_active, status, created_at`,
        [
          email.split('@')[0], // Generate username from email
          firstName,
          lastName,
          email.toLowerCase(),
          phone || null,
          hashedPassword,
          company || null,
          accountType,
          'customer', // Default role for registration
          verificationToken,
          expiresAt,
          true, // is_active
          'active' // status
        ]
      );

      const user = userResult.rows[0];

      // Insert verification record with code
      await query(
        `INSERT INTO email_verifications (user_id, email, token, code, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, email, verificationToken, verificationCode, expiresAt]
      );

      // Create customer profile
      const customerCode = CodeGenerator.generateCustomerCode();
      await query(
        `INSERT INTO customer_profiles (
          id, user_id, customer_code, company_name, account_type,
          loyalty_points, customer_tier, total_orders, total_spent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          uuidv4(), 
          user.id, 
          customerCode, 
          company || null, 
          accountType,
          0, // loyalty_points
          'regular', // customer_tier
          0, // total_orders
          0.00 // total_spent
        ]
      );

      return {
        ...user,
        verificationToken,
        verificationCode,
        customerCode
      };
    } catch (error) {
      console.error('Error in User.create:', error);
      throw error;
    }
  }

  // Create employee (by admin)
  static async createEmployee(employeeData) {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      department,
      position,
      hireDate,
      salary,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      address,
      city,
      bankAccountNumber,
      bankName,
      idCardNumber
    } = employeeData;

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || 10));
    const employeeId = CodeGenerator.generateEmployeeId();
    const verificationToken = uuidv4();

    try {
      // Insert user
      const userResult = await query(
        `INSERT INTO users (
          username, first_name, last_name, email, phone, password_hash,
          role, email_verified, email_verification_token, email_verification_expires,
          is_active, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()) 
        RETURNING id, first_name, last_name, email, phone, role, created_at`,
        [
          email.split('@')[0],
          firstName,
          lastName,
          email.toLowerCase(),
          phone || null,
          hashedPassword,
          role,
          true, // Email auto-verified for employees
          verificationToken,
          new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiry (though not needed)
          true, // is_active
          'active' // status
        ]
      );

      const user = userResult.rows[0];

      // Create employee profile
      await query(
        `INSERT INTO employee_profiles (
          id, user_id, employee_id, department, position, hire_date, salary,
          emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
          address, city, bank_account_number, bank_name, id_card_number,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())`,
        [
          uuidv4(),
          user.id,
          employeeId,
          department,
          position,
          hireDate,
          salary || null,
          emergencyContactName || null,
          emergencyContactPhone || null,
          emergencyContactRelation || null,
          address || null,
          city || null,
          bankAccountNumber || null,
          bankName || null,
          idCardNumber || null
        ]
      );

      return {
        ...user,
        employeeId,
        department,
        position,
        role
      };
    } catch (error) {
      console.error('Error in User.createEmployee:', error);
      throw error;
    }
  }

  // ==================== VERIFICATION METHODS ====================

  // Verify email with code
  static async verifyEmailWithCode(email, code) {
    try {
      const verificationResult = await query(
        `SELECT user_id FROM email_verifications 
         WHERE email = $1 AND code = $2 
           AND expires_at > NOW() AND used = false
         ORDER BY created_at DESC LIMIT 1`,
        [email, code]
      );

      if (verificationResult.rows.length === 0) {
        return null;
      }

      const userId = verificationResult.rows[0].user_id;

      // Update user as verified
      await query(
        `UPDATE users 
         SET email_verified = true, 
             email_verification_token = NULL,
             email_verification_expires = NULL
         WHERE id = $1`,
        [userId]
      );

      // Mark verification as used
      await query(
        `UPDATE email_verifications 
         SET used = true, used_at = NOW()
         WHERE email = $1 AND code = $2`,
        [email, code]
      );

      return { id: userId, email };
    } catch (error) {
      console.error('Error in verifyEmailWithCode:', error);
      throw error;
    }
  }

  // Verify email with token
  static async verifyEmailWithToken(token) {
    try {
      const result = await query(
        `UPDATE users 
         SET email_verified = true, 
             email_verification_token = NULL,
             email_verification_expires = NULL
         WHERE email_verification_token = $1 
           AND email_verification_expires > NOW()
           AND deleted_at IS NULL
         RETURNING id, email`,
        [token]
      );

      if (result.rows[0]) {
        await query(
          `UPDATE email_verifications 
           SET used = true, used_at = NOW()
           WHERE token = $1`,
          [token]
        );
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error in verifyEmailWithToken:', error);
      throw error;
    }
  }

  // Resend verification
  static async resendVerification(email) {
    try {
      const user = await this.findByEmail(email);
      if (!user || user.email_verified) return null;

      const newToken = uuidv4();
      const newCode = CodeGenerator.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await query(
        `UPDATE users 
         SET email_verification_token = $1,
             email_verification_expires = $2
         WHERE id = $3`,
        [newToken, expiresAt, user.id]
      );

      await query(
        `INSERT INTO email_verifications (user_id, email, token, code, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, email, newToken, newCode, expiresAt]
      );

      return { 
        email, 
        firstName: user.first_name, 
        token: newToken, 
        code: newCode 
      };
    } catch (error) {
      console.error('Error in resendVerification:', error);
      throw error;
    }
  }

  // ==================== FIND METHODS ====================

  // Find user by email
  static async findByEmail(email) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw error;
    }
  }

  // Find user by ID with profile
  static async findById(id) {
    try {
      const result = await query(
        `SELECT 
          u.id, u.username, u.first_name, u.last_name, u.email, u.phone, u.company, 
          u.account_type, u.role, u.email_verified, u.is_active, u.status, 
          u.profile_photo_url, u.bio, u.preferences, u.last_login, u.last_login_ip,
          u.last_activity, u.failed_login_attempts, u.lock_until, u.created_at, u.updated_at,
          u.preferred_language,
          
          -- Customer profile fields
          cp.id as customer_profile_id, cp.customer_code, cp.loyalty_points, 
          cp.customer_tier, cp.total_orders, cp.total_spent, cp.average_order_value,
          cp.last_order_date, cp.credit_limit, cp.billing_address, cp.shipping_address,
          cp.city as customer_city, cp.country as customer_country,
          
          -- Employee profile fields
          ep.id as employee_profile_id, ep.employee_id, ep.department, ep.position,
          ep.hire_date, ep.contract_end_date, ep.salary as employee_salary,
          ep.emergency_contact_name, ep.emergency_contact_phone, 
          ep.emergency_contact_relation, ep.address as employee_address,
          ep.city as employee_city
          
         FROM users u
         LEFT JOIN customer_profiles cp ON u.id = cp.user_id
         LEFT JOIN employee_profiles ep ON u.id = ep.user_id
         WHERE u.id = $1 AND u.deleted_at IS NULL`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  // Find by refresh token
  static async findByRefreshToken(refreshToken) {
    try {
      const result = await query(
        `SELECT u.* FROM users u
         JOIN sessions s ON u.id = s.user_id
         WHERE s.refresh_token = $1 
           AND s.expires_at > NOW()
           AND u.deleted_at IS NULL`,
        [refreshToken]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in findByRefreshToken:', error);
      throw error;
    }
  }

  // ==================== AUTHENTICATION METHODS ====================

  // Update last login
  static async updateLastLogin(userId, ip, userAgent) {
    try {
      await query(
        `UPDATE users 
         SET last_login = NOW(), 
             last_login_ip = $2,
             last_activity = NOW(),
             failed_login_attempts = 0,
             lock_until = NULL
         WHERE id = $1`,
        [userId, ip]
      );

      await query(
        `INSERT INTO login_history (user_id, ip_address, user_agent, login_type, success)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, ip, userAgent, 'local', true]
      );
    } catch (error) {
      console.error('Error in updateLastLogin:', error);
      throw error;
    }
  }

  // Validate password
  static async validatePassword(user, password) {
    if (!user || !user.password_hash) return false;
    return bcrypt.compare(password, user.password_hash);
  }

  // Increment failed login attempts
  static async incrementFailedAttempts(email, ip, userAgent) {
    try {
      const user = await this.findByEmail(email);
      if (!user) return null;

      const newAttempts = (user.failed_login_attempts || 0) + 1;
      let lockUntil = null;

      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }

      await query(
        `UPDATE users 
         SET failed_login_attempts = $1, 
             lock_until = $2
         WHERE id = $3`,
        [newAttempts, lockUntil, user.id]
      );

      await query(
        `INSERT INTO login_history (user_id, ip_address, user_agent, login_type, success, failure_reason)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, ip, userAgent, 'local', false, 'Invalid password']
      );

      return { newAttempts, lockUntil };
    } catch (error) {
      console.error('Error in incrementFailedAttempts:', error);
      throw error;
    }
  }

  // Check if account is locked
  static async isAccountLocked(userId) {
    try {
      const result = await query(
        'SELECT lock_until FROM users WHERE id = $1',
        [userId]
      );
      
      if (result.rows[0]?.lock_until) {
        return new Date(result.rows[0].lock_until) > new Date();
      }
      
      return false;
    } catch (error) {
      console.error('Error in isAccountLocked:', error);
      throw error;
    }
  }

  // Update online status
  static async updateOnlineStatus(userId, isOnline) {
    try {
      await query(
        `UPDATE users 
         SET is_online = $2,
             last_activity = NOW()
         WHERE id = $1`,
        [userId, isOnline]
      );
    } catch (error) {
      console.error('Error in updateOnlineStatus:', error);
      throw error;
    }
  }

  // ==================== SESSION METHODS ====================

  // Set refresh token
  static async setRefreshToken(userId, refreshToken, expiresAt, userAgent, ip) {
    try {
      await query(
        `INSERT INTO sessions (user_id, refresh_token, user_agent, ip_address, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, refreshToken, userAgent, ip, expiresAt]
      );
    } catch (error) {
      console.error('Error in setRefreshToken:', error);
      throw error;
    }
  }

  // Remove refresh token
  static async removeRefreshToken(refreshToken) {
    try {
      await query('DELETE FROM sessions WHERE refresh_token = $1', [refreshToken]);
    } catch (error) {
      console.error('Error in removeRefreshToken:', error);
      throw error;
    }
  }

  // Remove all user sessions
  static async removeAllSessions(userId) {
    try {
      await query('DELETE FROM sessions WHERE user_id = $1', [userId]);
    } catch (error) {
      console.error('Error in removeAllSessions:', error);
      throw error;
    }
  }

  // ==================== PASSWORD RESET METHODS ====================

  // Request password reset
  static async requestPasswordReset(email) {
    try {
      const token = uuidv4();
      const code = CodeGenerator.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      const result = await query(
        `UPDATE users 
         SET password_reset_token = $1, 
             password_reset_expires = $2
         WHERE LOWER(email) = LOWER($3) 
           AND deleted_at IS NULL
         RETURNING id, email, first_name`,
        [token, expiresAt, email]
      );

      if (result.rows[0]) {
        await query(
          `INSERT INTO password_resets (user_id, email, token, code, expires_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [result.rows[0].id, email, token, code, expiresAt]
        );
      }

      return result.rows[0] ? { ...result.rows[0], token, code } : null;
    } catch (error) {
      console.error('Error in requestPasswordReset:', error);
      throw error;
    }
  }

  // Reset password
  static async resetPassword(token, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const result = await query(
        `UPDATE users 
         SET password_hash = $2,
             password_reset_token = NULL,
             password_reset_expires = NULL,
             failed_login_attempts = 0,
             lock_until = NULL
         WHERE password_reset_token = $1 
           AND password_reset_expires > NOW()
           AND deleted_at IS NULL
         RETURNING id, email`,
        [token, hashedPassword]
      );

      if (result.rows[0]) {
        await query(
          `UPDATE password_resets 
           SET used = true, used_at = NOW()
           WHERE token = $1`,
          [token]
        );

        // Remove all sessions after password reset
        await this.removeAllSessions(result.rows[0].id);
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error in resetPassword:', error);
      throw error;
    }
  }

  // Reset password with code
  static async resetPasswordWithCode(email, code, newPassword) {
    try {
      const resetResult = await query(
        `SELECT user_id FROM password_resets 
         WHERE email = $1 AND code = $2 
           AND expires_at > NOW() AND used = false
         ORDER BY created_at DESC LIMIT 1`,
        [email, code]
      );

      if (resetResult.rows.length === 0) {
        return null;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const result = await query(
        `UPDATE users 
         SET password_hash = $2,
             password_reset_token = NULL,
             password_reset_expires = NULL,
             failed_login_attempts = 0,
             lock_until = NULL
         WHERE id = $1
         RETURNING id, email`,
        [resetResult.rows[0].user_id, hashedPassword]
      );

      if (result.rows[0]) {
        await query(
          `UPDATE password_resets 
           SET used = true, used_at = NOW()
           WHERE email = $1 AND code = $2`,
          [email, code]
        );

        // Remove all sessions after password reset
        await this.removeAllSessions(result.rows[0].id);
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error in resetPasswordWithCode:', error);
      throw error;
    }
  }

  // ==================== PROFILE UPDATE METHODS ====================

  // Update profile
  static async updateProfile(userId, updates) {
    try {
      const allowedUpdates = ['first_name', 'last_name', 'phone', 'company', 'bio', 'preferences'];
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      Object.keys(updates).forEach((key) => {
        if (allowedUpdates.includes(key) && updates[key] !== undefined) {
          updateFields.push(`${key} = $${paramIndex}`);
          values.push(updates[key]);
          paramIndex++;
        }
      });

      if (updateFields.length === 0) return null;

      values.push(userId);
      const result = await query(
        `UPDATE users 
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex} 
           AND deleted_at IS NULL
         RETURNING id, first_name, last_name, email, phone, company, 
                   account_type, email_verified, bio, preferences`,
        values
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  }

  // Update profile photo
  static async updateProfilePhoto(userId, photoUrl) {
    try {
      const result = await query(
        `UPDATE users 
         SET profile_photo_url = $2
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id, profile_photo_url`,
        [userId, photoUrl]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in updateProfilePhoto:', error);
      throw error;
    }
  }

  // Change password
  static async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await this.findById(userId);
      if (!user) return null;

      const isValid = await this.validatePassword(user, oldPassword);
      if (!isValid) return null;

      const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || 10));

      await query(
        `UPDATE users 
         SET password_hash = $2
         WHERE id = $1 AND deleted_at IS NULL`,
        [userId, hashedPassword]
      );

      // Remove all sessions after password change (except current)
      await this.removeAllSessions(userId);

      return { id: userId, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Error in changePassword:', error);
      throw error;
    }
  }

  // ==================== ADMIN METHODS ====================

  // Get all users with pagination
  static async getAllUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        role = null,
        status = null,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      const queryParams = [];
      let paramIndex = 1;

      let countQuery = 'SELECT COUNT(*) FROM users WHERE deleted_at IS NULL';
      let dataQuery = `
        SELECT 
          id, username, first_name, last_name, email, phone, company, 
          role, status, account_type, email_verified, is_active, is_online,
          profile_photo_url, last_login, last_activity, created_at, updated_at
        FROM users 
        WHERE deleted_at IS NULL
      `;

      if (search && search.trim() !== '') {
        const searchCondition = ` AND (
          first_name ILIKE $${paramIndex} OR 
          last_name ILIKE $${paramIndex} OR 
          email ILIKE $${paramIndex} OR 
          COALESCE(phone, '') ILIKE $${paramIndex} OR
          COALESCE(company, '') ILIKE $${paramIndex}
        )`;
        countQuery += searchCondition;
        dataQuery += searchCondition;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (role) {
        const roleCondition = ` AND role = $${paramIndex}`;
        countQuery += roleCondition;
        dataQuery += roleCondition;
        queryParams.push(role);
        paramIndex++;
      }

      if (status) {
        const statusCondition = ` AND status = $${paramIndex}`;
        countQuery += statusCondition;
        dataQuery += statusCondition;
        queryParams.push(status);
        paramIndex++;
      }

      const validSortColumns = ['created_at', 'first_name', 'last_name', 'email', 'last_login', 'status', 'role'];
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      dataQuery += ` ORDER BY ${sortColumn} ${order}`;
      dataQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(limit, offset);

      const countResult = await query(countQuery, queryParams.slice(0, paramIndex - 1));
      const totalUsers = parseInt(countResult.rows[0].count);

      const dataResult = await query(dataQuery, queryParams);
      const totalPages = Math.ceil(totalUsers / limit);

      return {
        users: dataResult.rows,
        pagination: {
          page,
          limit,
          total: totalUsers,
          pages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  // Get all employees
  static async getAllEmployees(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        department = null,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      const queryParams = [];
      let paramIndex = 1;

      let countQuery = `
        SELECT COUNT(*) 
        FROM users u
        JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.deleted_at IS NULL 
        AND u.role IN ('admin', 'receptionist', 'cashier', 'designer', 'printer')
      `;

      let dataQuery = `
        SELECT 
          u.id, u.username, u.first_name, u.last_name, u.email, u.phone, 
          u.role, u.status, u.is_active, u.is_online, u.profile_photo_url,
          u.last_login, u.created_at,
          ep.employee_id, ep.department, ep.position, ep.hire_date, ep.salary,
          ep.emergency_contact_name, ep.emergency_contact_phone, 
          ep.address, ep.city
        FROM users u
        JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.deleted_at IS NULL 
        AND u.role IN ('admin', 'receptionist', 'cashier', 'designer', 'printer')
      `;

      if (search && search.trim() !== '') {
        const searchCondition = ` AND (
          u.first_name ILIKE $${paramIndex} OR 
          u.last_name ILIKE $${paramIndex} OR 
          u.email ILIKE $${paramIndex} OR
          ep.employee_id ILIKE $${paramIndex}
        )`;
        countQuery += searchCondition;
        dataQuery += searchCondition;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (department) {
        const deptCondition = ` AND ep.department = $${paramIndex}`;
        countQuery += deptCondition;
        dataQuery += deptCondition;
        queryParams.push(department);
        paramIndex++;
      }

      dataQuery += ` ORDER BY ${sortBy} ${sortOrder}`;
      dataQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(limit, offset);

      const countResult = await query(countQuery, queryParams.slice(0, paramIndex - 1));
      const totalEmployees = parseInt(countResult.rows[0].count);

      const dataResult = await query(dataQuery, queryParams);
      const totalPages = Math.ceil(totalEmployees / limit);

      return {
        employees: dataResult.rows,
        pagination: {
          page,
          limit,
          total: totalEmployees,
          pages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Error in getAllEmployees:', error);
      throw error;
    }
  }

  // Get all customers
  static async getAllCustomers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        tier = null,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      const queryParams = [];
      let paramIndex = 1;

      let countQuery = `
        SELECT COUNT(*) 
        FROM users u
        JOIN customer_profiles cp ON u.id = cp.user_id
        WHERE u.deleted_at IS NULL AND u.role = 'customer'
      `;

      let dataQuery = `
        SELECT 
          u.id, u.username, u.first_name, u.last_name, u.email, u.phone, 
          u.company, u.status, u.is_active, u.email_verified, 
          u.profile_photo_url, u.last_login, u.created_at,
          cp.customer_code, cp.company_name as profile_company, 
          cp.customer_tier, cp.loyalty_points, cp.total_orders, 
          cp.total_spent, cp.average_order_value, cp.credit_limit,
          cp.billing_address, cp.shipping_address, cp.city, cp.country
        FROM users u
        JOIN customer_profiles cp ON u.id = cp.user_id
        WHERE u.deleted_at IS NULL AND u.role = 'customer'
      `;

      if (search && search.trim() !== '') {
        const searchCondition = ` AND (
          u.first_name ILIKE $${paramIndex} OR 
          u.last_name ILIKE $${paramIndex} OR 
          u.email ILIKE $${paramIndex} OR
          u.phone ILIKE $${paramIndex} OR
          cp.customer_code ILIKE $${paramIndex} OR
          COALESCE(cp.company_name, '') ILIKE $${paramIndex}
        )`;
        countQuery += searchCondition;
        dataQuery += searchCondition;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (tier) {
        const tierCondition = ` AND cp.customer_tier = $${paramIndex}`;
        countQuery += tierCondition;
        dataQuery += tierCondition;
        queryParams.push(tier);
        paramIndex++;
      }

      dataQuery += ` ORDER BY ${sortBy} ${sortOrder}`;
      dataQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(limit, offset);

      const countResult = await query(countQuery, queryParams.slice(0, paramIndex - 1));
      const totalCustomers = parseInt(countResult.rows[0].count);

      const dataResult = await query(dataQuery, queryParams);
      const totalPages = Math.ceil(totalCustomers / limit);

      return {
        customers: dataResult.rows,
        pagination: {
          page,
          limit,
          total: totalCustomers,
          pages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Error in getAllCustomers:', error);
      throw error;
    }
  }

  // Update user status (activate/deactivate)
  static async updateStatus(userId, isActive) {
    try {
      const result = await query(
        `UPDATE users 
         SET is_active = $2, 
             status = CASE WHEN $2 THEN 'active' ELSE 'inactive' END
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id, email, is_active, status`,
        [userId, isActive]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in updateStatus:', error);
      throw error;
    }
  }

  // Update user role
  static async updateRole(userId, role) {
    try {
      const result = await query(
        `UPDATE users 
         SET role = $2
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id, email, role`,
        [userId, role]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in updateRole:', error);
      throw error;
    }
  }

  // Soft delete user
  static async softDelete(userId) {
    try {
      await query(
        'UPDATE users SET deleted_at = NOW(), is_active = false WHERE id = $1',
        [userId]
      );
      await this.removeAllSessions(userId);
    } catch (error) {
      console.error('Error in softDelete:', error);
      throw error;
    }
  }

  // ==================== STATISTICS METHODS ====================

  // Get user stats for dashboard
  static async getStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'customer' THEN 1 END) as total_customers,
          COUNT(CASE WHEN role IN ('admin', 'receptionist', 'cashier', 'designer', 'printer') THEN 1 END) as total_employees,
          COUNT(CASE WHEN role = 'customer' AND status = 'active' AND is_active = true THEN 1 END) as active_customers,
          COUNT(CASE WHEN role IN ('admin', 'receptionist', 'cashier', 'designer', 'printer') AND status = 'active' AND is_active = true THEN 1 END) as active_employees,
          COUNT(CASE WHEN email_verified = false AND role = 'customer' THEN 1 END) as unverified_customers,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users_last_30days,
          COUNT(CASE WHEN last_login > NOW() - INTERVAL '7 days' THEN 1 END) as active_last_7days,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
          COUNT(CASE WHEN role = 'receptionist' THEN 1 END) as receptionist_count,
          COUNT(CASE WHEN role = 'cashier' THEN 1 END) as cashier_count,
          COUNT(CASE WHEN role = 'designer' THEN 1 END) as designer_count,
          COUNT(CASE WHEN role = 'printer' THEN 1 END) as printer_count
        FROM users 
        WHERE deleted_at IS NULL
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error in getStats:', error);
      throw error;
    }
  }

  // Get users by role
  static async getUsersByRole(role, limit = null) {
    try {
      let queryText = `
        SELECT id, first_name, last_name, email, status, last_login, profile_photo_url
        FROM users 
        WHERE role = $1 AND deleted_at IS NULL
        ORDER BY created_at DESC
      `;
      
      const params = [role];
      
      if (limit) {
        queryText += ` LIMIT $2`;
        params.push(limit);
      }

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error in getUsersByRole:', error);
      throw error;
    }
  }

  // Get recent users
  static async getRecentUsers(limit = 10) {
    try {
      const result = await query(
        `SELECT 
          id, first_name, last_name, email, status, role, profile_photo_url, created_at
         FROM users 
         WHERE deleted_at IS NULL
         ORDER BY created_at DESC
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Error in getRecentUsers:', error);
      throw error;
    }
  }

  // Search users
  static async searchUsers(searchTerm, limit = 20) {
    try {
      const result = await query(
        `SELECT 
          id, first_name, last_name, email, phone, company, status, role, profile_photo_url
         FROM users 
         WHERE deleted_at IS NULL 
           AND (
             first_name ILIKE $1 OR 
             last_name ILIKE $1 OR 
             email ILIKE $1 OR
             phone ILIKE $1
           )
         ORDER BY 
           CASE 
             WHEN email ILIKE $1 THEN 1
             WHEN first_name ILIKE $1 OR last_name ILIKE $1 THEN 2
             ELSE 3
           END,
           created_at DESC
         LIMIT $2`,
        [`%${searchTerm}%`, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Error in searchUsers:', error);
      throw error;
    }
  }

  // ==================== CUSTOMER-SPECIFIC METHODS ====================

  // Update customer tier based on spending
  static async updateCustomerTier(customerId) {
    try {
      const customer = await query(
        `SELECT total_spent FROM customer_profiles WHERE id = $1`,
        [customerId]
      );

      if (!customer.rows[0]) return null;

      const totalSpent = customer.rows[0].total_spent;
      let newTier = 'regular';

      if (totalSpent >= 10000) {
        newTier = 'platinum';
      } else if (totalSpent >= 5000) {
        newTier = 'gold';
      } else if (totalSpent >= 1000) {
        newTier = 'silver';
      }

      await query(
        `UPDATE customer_profiles 
         SET customer_tier = $2
         WHERE id = $1`,
        [customerId, newTier]
      );

      return newTier;
    } catch (error) {
      console.error('Error in updateCustomerTier:', error);
      throw error;
    }
  }

  // Add loyalty points to customer
  static async addLoyaltyPoints(customerId, points) {
    try {
      const result = await query(
        `UPDATE customer_profiles 
         SET loyalty_points = loyalty_points + $2
         WHERE id = $1
         RETURNING loyalty_points`,
        [customerId, points]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in addLoyaltyPoints:', error);
      throw error;
    }
  }

  // Update customer totals after order
  static async updateCustomerTotals(customerId, orderTotal) {
    try {
      const result = await query(
        `UPDATE customer_profiles 
         SET total_orders = total_orders + 1,
             total_spent = total_spent + $2,
             average_order_value = (total_spent + $2) / (total_orders + 1),
             last_order_date = NOW()
         WHERE id = $1
         RETURNING *`,
        [customerId, orderTotal]
      );

      // Update tier based on new total
      if (result.rows[0]) {
        await this.updateCustomerTier(customerId);
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error in updateCustomerTotals:', error);
      throw error;
    }
  }

  // ==================== EMPLOYEE-SPECIFIC METHODS ====================

  // Get employees by department
  static async getEmployeesByDepartment(department) {
    try {
      const result = await query(
        `SELECT 
          u.id, u.first_name, u.last_name, u.email, u.phone, u.role,
          ep.employee_id, ep.position, ep.hire_date
         FROM users u
         JOIN employee_profiles ep ON u.id = ep.user_id
         WHERE ep.department = $1 
           AND u.deleted_at IS NULL
           AND u.is_active = true
         ORDER BY u.first_name`,
        [department]
      );
      return result.rows;
    } catch (error) {
      console.error('Error in getEmployeesByDepartment:', error);
      throw error;
    }
  }

  // Update employee salary
  static async updateEmployeeSalary(employeeId, newSalary) {
    try {
      const result = await query(
        `UPDATE employee_profiles 
         SET salary = $2
         WHERE employee_id = $1
         RETURNING *`,
        [employeeId, newSalary]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in updateEmployeeSalary:', error);
      throw error;
    }
  }
}

module.exports = User;