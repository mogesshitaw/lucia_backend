const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/testimonials/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'testimonial-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatars'));
    }
  }
}).single('avatar');

const testimonialController = {
  // ========== PUBLIC ROUTES ==========
  
  // Submit testimonial from customer
  async submitTestimonial(req, res) {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      try {
        const { 
          customer_name, 
          customer_role, 
          company, 
          content, 
          rating, 
          email 
        } = req.body;

        // Validate required fields
        if (!customer_name || !content || !rating) {
          return res.status(400).json({
            success: false,
            message: 'Name, content, and rating are required'
          });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
          return res.status(400).json({
            success: false,
            message: 'Rating must be between 1 and 5'
          });
        }

        const avatarPath = req.file ? req.file.path : null;

        const result = await query(
          `INSERT INTO testimonials (
            id, customer_name, customer_role, company, content, 
            rating, avatar_path, email, status, source
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id, customer_name, customer_role, company, content, rating, created_at`,
          [
            uuidv4(),
            customer_name,
            customer_role || null,
            company || null,
            content,
            parseInt(rating),
            avatarPath,
            email || null,
            'pending', // Always pending for admin approval
            'website'
          ]
        );

        res.status(201).json({
          success: true,
          message: 'Thank you for your testimonial! It will be reviewed shortly.',
          data: result.rows[0]
        });
      } catch (error) {
        console.error('Error submitting testimonial:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to submit testimonial'
        });
      }
    });
  },

  // Get approved testimonials for public display
  async getPublicTestimonials(req, res) {
    try {
      const { limit = 10, featured = false } = req.query;

      let sql = `
        SELECT 
          id,
          customer_name,
          customer_role,
          company,
          content,
          rating,
          avatar_path,
          created_at
        FROM testimonials
        WHERE status = 'approved'
      `;

      const params = [];
      
      if (featured === 'true') {
        sql += ` AND is_featured = true`;
      }

      sql += ` ORDER BY is_featured DESC, created_at DESC LIMIT $1`;
      params.push(parseInt(limit));

      const result = await query(sql, params);

      // Format avatar URLs
      const testimonials = result.rows.map(t => ({
        ...t,
        avatar: t.avatar_path 
          ? `${req.protocol}://${req.get('host')}/${t.avatar_path.replace(/\\/g, '/')}`
          : null
      }));

      res.json({
        success: true,
        data: testimonials
      });
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch testimonials'
      });
    }
  },

  // ========== ADMIN ROUTES ==========

  // Get all testimonials (admin)
  async getAllTestimonials(req, res) {
    try {
      const { page = 1, limit = 20, status, search } = req.query;
      const offset = (page - 1) * limit;

      let conditions = [];
      let params = [];
      let paramIndex = 1;

      if (status) {
        conditions.push(`status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }

      if (search) {
        conditions.push(`(customer_name ILIKE $${paramIndex} OR content ILIKE $${paramIndex} OR company ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) 
        FROM testimonials
        ${whereClause}
      `;
      const countResult = await query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Get testimonials
      const testimonialsQuery = `
        SELECT 
          t.*,
          u.first_name || ' ' || u.last_name as approver_name
        FROM testimonials t
        LEFT JOIN users u ON t.approved_by = u.id
        ${whereClause}
        ORDER BY t.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const result = await query(testimonialsQuery, [...params, parseInt(limit), parseInt(offset)]);

      res.json({
        success: true,
        data: {
          testimonials: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching all testimonials:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch testimonials'
      });
    }
  },

  // Get single testimonial
  async getTestimonial(req, res) {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT 
          t.*,
          u.first_name || ' ' || u.last_name as approver_name
         FROM testimonials t
         LEFT JOIN users u ON t.approved_by = u.id
         WHERE t.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Testimonial not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching testimonial:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch testimonial'
      });
    }
  },

  // Admin: Create testimonial
  async createTestimonial(req, res) {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      try {
        const { 
          customer_name, 
          customer_role, 
          company, 
          content, 
          rating, 
          email,
          is_featured,
          status
        } = req.body;

        if (!customer_name || !content || !rating) {
          return res.status(400).json({
            success: false,
            message: 'Name, content, and rating are required'
          });
        }

        const avatarPath = req.file ? req.file.path : null;

        const result = await query(
          `INSERT INTO testimonials (
            id,
            customer_name,
            customer_role,
            company,
            content,
            rating,
            avatar_path,
            email,
            is_featured,
            status,
            source,
            approved_at,
            approved_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12)
          RETURNING *`,
          [
            uuidv4(),
            customer_name,
            customer_role || null,
            company || null,
            content,
            parseInt(rating),
            avatarPath,
            email || null,
            is_featured === 'true',
            status || 'approved',
            'admin',
            req.user.id
          ]
        );

        res.json({
          success: true,
          message: 'Testimonial created successfully',
          data: result.rows[0]
        });
      } catch (error) {
        console.error('Error creating testimonial:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create testimonial'
        });
      }
    });
  },

  // Admin: Update testimonial
  async updateTestimonial(req, res) {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      try {
        const { id } = req.params;
        const { 
          customer_name, 
          customer_role, 
          company, 
          content, 
          rating, 
          email,
          is_featured,
          status
        } = req.body;

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (customer_name) {
          updates.push(`customer_name = $${paramIndex++}`);
          values.push(customer_name);
        }
        if (customer_role !== undefined) {
          updates.push(`customer_role = $${paramIndex++}`);
          values.push(customer_role);
        }
        if (company !== undefined) {
          updates.push(`company = $${paramIndex++}`);
          values.push(company);
        }
        if (content) {
          updates.push(`content = $${paramIndex++}`);
          values.push(content);
        }
        if (rating) {
          updates.push(`rating = $${paramIndex++}`);
          values.push(parseInt(rating));
        }
        if (email !== undefined) {
          updates.push(`email = $${paramIndex++}`);
          values.push(email);
        }
        if (req.file) {
          // Delete old avatar if exists
          const oldResult = await query('SELECT avatar_path FROM testimonials WHERE id = $1', [id]);
          if (oldResult.rows[0]?.avatar_path && fs.existsSync(oldResult.rows[0].avatar_path)) {
            fs.unlinkSync(oldResult.rows[0].avatar_path);
          }
          updates.push(`avatar_path = $${paramIndex++}`);
          values.push(req.file.path);
        }
        if (is_featured !== undefined) {
          updates.push(`is_featured = $${paramIndex++}`);
          values.push(is_featured === 'true');
        }
        if (status) {
          updates.push(`status = $${paramIndex++}`);
          values.push(status);
          if (status === 'approved') {
            updates.push(`approved_at = NOW()`);
            updates.push(`approved_by = $${paramIndex++}`);
            values.push(req.user.id);
          }
        }

        updates.push(`updated_at = NOW()`);

        if (updates.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'No fields to update'
          });
        }

        const query_str = `
          UPDATE testimonials 
          SET ${updates.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING *
        `;
        
        values.push(id);

        const result = await query(query_str, values);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Testimonial not found'
          });
        }

        res.json({
          success: true,
          message: 'Testimonial updated successfully',
          data: result.rows[0]
        });
      } catch (error) {
        console.error('Error updating testimonial:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update testimonial'
        });
      }
    });
  },

  // Admin: Approve testimonial
  async approveTestimonial(req, res) {
    try {
      const { id } = req.params;

      const result = await query(
        `UPDATE testimonials 
         SET status = 'approved',
             approved_at = NOW(),
             approved_by = $2
         WHERE id = $1
         RETURNING *`,
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Testimonial not found'
        });
      }

      res.json({
        success: true,
        message: 'Testimonial approved successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error approving testimonial:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve testimonial'
      });
    }
  },

  // Admin: Reject testimonial
  async rejectTestimonial(req, res) {
    try {
      const { id } = req.params;

      const result = await query(
        `UPDATE testimonials 
         SET status = 'rejected'
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Testimonial not found'
        });
      }

      res.json({
        success: true,
        message: 'Testimonial rejected',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject testimonial'
      });
    }
  },

  // Admin: Delete testimonial
  async deleteTestimonial(req, res) {
    try {
      const { id } = req.params;

      // Get avatar path to delete file
      const result = await query('SELECT avatar_path FROM testimonials WHERE id = $1', [id]);
      
      if (result.rows.length > 0 && result.rows[0].avatar_path) {
        const avatarPath = result.rows[0].avatar_path;
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      }

      await query('DELETE FROM testimonials WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Testimonial deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete testimonial'
      });
    }
  },

  // Toggle featured status
  async toggleFeatured(req, res) {
    try {
      const { id } = req.params;

      const result = await query(
        `UPDATE testimonials 
         SET is_featured = NOT is_featured
         WHERE id = $1
         RETURNING is_featured`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Testimonial not found'
        });
      }

      res.json({
        success: true,
        message: 'Featured status updated',
        is_featured: result.rows[0].is_featured
      });
    } catch (error) {
      console.error('Error toggling featured:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update featured status'
      });
    }
  },

  // Get stats for admin dashboard
  async getStats(req, res) {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
          COUNT(CASE WHEN is_featured = true THEN 1 END) as featured,
          ROUND(AVG(rating)::numeric, 1) as average_rating
        FROM testimonials
      `);

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch stats'
      });
    }
  }
};

module.exports = testimonialController;