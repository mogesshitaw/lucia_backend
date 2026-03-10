const { query, transaction } = require('../config/database');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const imageController = {
  // Get images with pagination and filters
  async getImages(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        status,
        search,
        tags,
        sortBy = 'created_at',
        sortOrder = 'desc',
        customer_id
      } = req.query;
  
      const offset = (page - 1) * limit;
      const userId = req.user.id;
      const userRole = req.user.role;
  
      // Whitelist allowed sort fields to prevent SQL injection
      const allowedSortFields = ['created_at', 'updated_at', 'original_filename', 'title', 'status'];
      const allowedSortOrders = ['asc', 'desc'];
      
      const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
      const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder : 'desc';
  
      const conditions = [];
      const params = [];
      let paramIndex = 1;
  
      // Filter by customer if user is customer
      if (userRole === 'customer') {
        conditions.push(`i.customer_id = $${paramIndex}`);
        params.push(userId);
        paramIndex++;
      } else if (customer_id) {
        conditions.push(`i.customer_id = $${paramIndex}`);
        params.push(customer_id);
        paramIndex++;
      }
  
      // Filter by status
      if (status) {
        conditions.push(`i.status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }
  
      // Search by filename or title
      if (search) {
        conditions.push(`(i.original_filename ILIKE $${paramIndex} OR i.title ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }
  
      // Filter by tags
      if (tags) {
        const tagArray = tags.split(',');
        conditions.push(`i.tags && $${paramIndex}`);
        params.push(tagArray);
        paramIndex++;
      }
  
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
      // Get total count
      const countQuery = `
        SELECT COUNT(*) 
        FROM images i
        ${whereClause}
      `;
      const countResult = await query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);
  
      // Get images
      const imagesQuery = `
        SELECT 
          i.*,
          u.first_name || ' ' || u.last_name as uploader_name
        FROM images i
        JOIN users u ON i.uploaded_by = u.id
        ${whereClause}
        ORDER BY i.${safeSortBy} ${safeSortOrder}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      const imagesResult = await query(imagesQuery, [...params, parseInt(limit), parseInt(offset)]);
  
      res.json({
        success: true,
        data: {
          images: imagesResult.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error in getImages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch images'
      });
    }
  },
  // Get single image
  async getImage(req, res) {
    try {
      const { id } = req.params;
      
      const result = await query(
        `SELECT i.*, 
          u.first_name || ' ' || u.last_name as uploader_name,
          u.email as uploader_email
         FROM images i
         JOIN users u ON i.uploaded_by = u.id
        WHERE i.id = $1 AND i.deleted_at IS NULL`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }

      res.json({
        success: true,
        data: { image: result.rows[0] }
      });
    } catch (error) {
      console.error('Error in getImage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch image'
      });
    }
  },

  // Upload images
  async uploadImages(req, res) {
    try {
      const files = req.files;
      const { metadata } = req.body;
      const userId = req.user.id;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const uploadedImages = [];
      const parsedMetadata = metadata ? JSON.parse(metadata) : [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileMetadata = parsedMetadata[i] || {};

        // Generate thumbnail for images
        let thumbnailPath = null;
        if (file.mimetype.startsWith('image/')) {
          const thumbnailFilename = `thumb_${file.filename}`;
          thumbnailPath = path.join('uploads', 'thumbnails', thumbnailFilename);
          
          // Ensure thumbnail directory exists
          const thumbDir = path.join('uploads', 'thumbnails');
          if (!fs.existsSync(thumbDir)) {
            fs.mkdirSync(thumbDir, { recursive: true });
          }

          // Create thumbnail
          await sharp(file.path)
            .resize(300, 300, { fit: 'cover' })
            .toFile(thumbnailPath);
        }

        // Get image dimensions if it's an image
        let width = null, height = null;
        if (file.mimetype.startsWith('image/')) {
          const metadata = await sharp(file.path).metadata();
          width = metadata.width;
          height = metadata.height;
        }

        // Insert image record
const imageResult = await query(
  `INSERT INTO images (
    id, image_code, filename, original_filename, file_path,
    thumbnail_path, file_size, mime_type, width, height,
    uploaded_by, customer_id, title, description, tags, status,
    service_category, print_size, quantity, paper_type, finish,
    color_mode_req, instructions, requires_proof, metadata
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
  RETURNING *`,
  [
    uuidv4(),
    `IMG-${Date.now()}-${i}`,
    file.filename,
    file.originalname,
    file.path,
    thumbnailPath,
    file.size,
    file.mimetype,
    width,
    height,
    userId,
    fileMetadata.customer_id || null,
    fileMetadata.title || null,
    fileMetadata.description || null,
    fileMetadata.tags || [],
    'pending',
    fileMetadata.service_category || null,
    fileMetadata.print_size || null,
    fileMetadata.quantity || 1,
    fileMetadata.paper_type || null,
    fileMetadata.finish || null,
    fileMetadata.color_mode_req || 'cmyk',
    fileMetadata.instructions || null,
    fileMetadata.requires_proof || false,
    fileMetadata.metadata || null
  ]
);


        uploadedImages.push(imageResult.rows[0]);
      }

      res.json({
        success: true,
        message: `Successfully uploaded ${files.length} files`,
        data: { images: uploadedImages }
      });
    } catch (error) {
      console.error('Error in uploadImages:', error);
      
      // Clean up uploaded files on error
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to upload images'
      });
    }
  },

  // Approve image
  async approveImage(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await query(
        `UPDATE images 
         SET status = 'approved',
             approved_by = $2,
             approved_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }

      res.json({
        success: true,
        message: 'Image approved successfully',
        data: { image: result.rows[0] }
      });
    } catch (error) {
      console.error('Error in approveImage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve image'
      });
    }
  },

  // Reject image
  async rejectImage(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const result = await query(
        `UPDATE images 
         SET status = 'rejected',
             rejected_by = $2,
             rejected_at = NOW(),
             rejection_reason = $3
         WHERE id = $1
         RETURNING *`,
        [id, userId, reason]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }

      res.json({
        success: true,
        message: 'Image rejected successfully',
        data: { image: result.rows[0] }
      });
    } catch (error) {
      console.error('Error in rejectImage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject image'
      });
    }
  },

  // Delete image
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

      // Soft delete from database
      await query(
        'UPDATE images SET deleted_at = NOW() WHERE id = $1',
        [id]
      );

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteImage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete image'
      });
    }
  },

  // Download image
  async downloadImage(req, res) {
    try {
      const { id } = req.params;

      const result = await query(
        'SELECT * FROM images WHERE id = $1 AND deleted_at IS NULL',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }

      const image = result.rows[0];

      // Increment download count
      await query(
        'UPDATE images SET download_count = download_count + 1 WHERE id = $1',
        [id]
      );

      res.download(image.file_path, image.original_filename);
    } catch (error) {
      console.error('Error in downloadImage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download image'
      });
    }
  },

  // Update image metadata
  async updateImage(req, res) {
    try {
      const { id } = req.params;
      const { title, description, tags, category } = req.body;

const result = await query(
  `UPDATE images 
   SET title = COALESCE($2, title),
       description = COALESCE($3, description),
       tags = COALESCE($4, tags),
       category = COALESCE($5, category),
       service_category = COALESCE($6, service_category),
       print_size = COALESCE($7, print_size),
       quantity = COALESCE($8, quantity),
       paper_type = COALESCE($9, paper_type),
       finish = COALESCE($10, finish),
       color_mode_req = COALESCE($11, color_mode_req),
       instructions = COALESCE($12, instructions),
       requires_proof = COALESCE($13, requires_proof),
       updated_at = NOW()
   WHERE id = $1
   RETURNING *`,
  [id, title, description, tags, category, service_category, print_size, quantity, paper_type, finish, color_mode_req, instructions, requires_proof]
);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }

      res.json({
        success: true,
        message: 'Image updated successfully',
        data: { image: result.rows[0] }
      });
    } catch (error) {
      console.error('Error in updateImage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update image'
      });
    }
  },

  // Get image stats
  async getStats(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      let whereClause = '';
      const params = [];
      
      if (userRole === 'customer') {
        whereClause = 'WHERE customer_id = $1';
        params.push(userId);
      }

      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COALESCE(SUM(file_size), 0) as total_size
        FROM images
        ${whereClause}
      `;

      const result = await query(statsQuery, params);

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error in getStats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch stats'
      });
    }
  },

  // Get all tags
  async getTags(req, res) {
    try {
      const result = await query(`
        SELECT DISTINCT unnest(tags) as tag
        FROM images
        WHERE tags IS NOT NULL
        ORDER BY tag
      `);

      const tags = result.rows.map(row => row.tag);

      res.json({
        success: true,
        data: tags
      });
    } catch (error) {
      console.error('Error in getTags:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tags'
      });
    }
  },

  // Toggle favorite
  async toggleFavorite(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if already favorited
      const existing = await query(
        'SELECT * FROM favorites WHERE image_id = $1 AND user_id = $2',
        [id, userId]
      );

      if (existing.rows.length > 0) {
        // Remove from favorites
        await query(
          'DELETE FROM favorites WHERE image_id = $1 AND user_id = $2',
          [id, userId]
        );
        res.json({ success: true, message: 'Removed from favorites', isFavorite: false });
      } else {
        // Add to favorites
        await query(
          'INSERT INTO favorites (id, image_id, user_id) VALUES ($1, $2, $3)',
          [uuidv4(), id, userId]
        );
        res.json({ success: true, message: 'Added to favorites', isFavorite: true });
      }
    } catch (error) {
      console.error('Error in toggleFavorite:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle favorite'
      });
    }
  },

async getFavorites(req, res) {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT i.* 
       FROM images i
       JOIN favorites f ON f.image_id = i.id
       WHERE f.user_id = $1`, // Remove deleted_at condition
      [userId]
    );

    res.json({
      success: true,
      data: { images: result.rows }
    });
  } catch (error) {
    console.error('Error in getFavorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorites'
    });
  }
},

// Update getHistory method
async getHistory(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = '';
    const params = [];
    
    if (userRole === 'customer') {
      whereClause = 'WHERE customer_id = $1';
      params.push(userId);
    }

    const result = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(file_size) as total_size
       FROM images
       ${whereClause}
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 30`,
      params
    );

    res.json({
      success: true,
      data: { history: result.rows }
    });
  } catch (error) {
    console.error('Error in getHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history'
    });
  }
},

// Update getCategories method
async getCategories(req, res) {
  try {
    const result = await query(`
      SELECT 
        category,
        COUNT(*) as count
      FROM images
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: { categories: result.rows }
    });
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
}
};

module.exports = imageController;