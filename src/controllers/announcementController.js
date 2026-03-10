const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/announcements/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'announcement-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype.split('/')[1]);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files are allowed'));
  }
}).single('image');

const announcementController = {
  // ========== PUBLIC ROUTES ==========
  
  // Get all announcements (public)
  async getAnnouncements(req, res) {
    try {
      const { 
        type = 'all',
        featured = false,
        limit = 10,
        page = 1,
        sortBy = 'date',
        sortOrder = 'desc'
      } = req.query;

      const offset = (page - 1) * limit;
      
      let conditions = ['is_published = true'];
      let params = [];
      let paramIndex = 1;

      if (type !== 'all') {
        conditions.push(`type = $${paramIndex}`);
        params.push(type);
        paramIndex++;
      }

      if (featured === 'true') {
        conditions.push(`is_featured = true`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) 
        FROM announcements
        ${whereClause}
      `;
      const countResult = await query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Get announcements
      const itemsQuery = `
        SELECT 
          id,
          title,
          description,
          detailed_content,
          bullet_points,
          cta,
          cta_link,
          date,
          read_time,
          type,
          priority,
          image_url,
          tags,
          views,
          likes,
          comments,
          is_featured,
          created_at,
          updated_at
        FROM announcements
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}, is_featured DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const result = await query(itemsQuery, [...params, parseInt(limit), parseInt(offset)]);

      // Format image URLs
      const items = result.rows.map(item => ({
        ...item,
        image: item.image_url ? `${req.protocol}://${req.get('host')}/${item.image_url.replace(/\\/g, '/')}` : null
      }));

      res.json({
        success: true,
        data: {
          announcements: items,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching announcements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch announcements'
      });
    }
  },

  // Get single announcement
  async getAnnouncement(req, res) {
    try {
      const { id } = req.params;

      // Get client IP for view tracking
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      // Record view
      await query(
        'INSERT INTO announcement_views (id, announcement_id, viewer_ip) VALUES ($1, $2, $3)',
        [uuidv4(), id, clientIp]
      );

      const result = await query(
        `SELECT 
          a.*,
          COUNT(DISTINCT l.id) as like_count,
          COUNT(DISTINCT c.id) as comment_count
         FROM announcements a
         LEFT JOIN announcement_likes l ON a.id = l.announcement_id
         LEFT JOIN announcement_comments c ON a.id = c.announcement_id AND c.is_approved = true
         WHERE a.id = $1
         GROUP BY a.id`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }

      const item = result.rows[0];
      
      res.json({
        success: true,
        data: {
          ...item,
          image: item.image_url ? `${req.protocol}://${req.get('host')}/${item.image_url.replace(/\\/g, '/')}` : null
        }
      });
    } catch (error) {
      console.error('Error fetching announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch announcement'
      });
    }
  },

  // Get announcement stats
  async getStats(req, res) {
    try {
      const result = await query(
        'SELECT * FROM announcement_stats WHERE is_active = true ORDER BY display_order'
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch stats'
      });
    }
  },

  // Get announcement timeline
  async getTimeline(req, res) {
    try {
      const result = await query(
        `SELECT 
          t.*,
          a.title as announcement_title,
          a.id as announcement_id
         FROM announcement_timeline t
         LEFT JOIN announcements a ON t.announcement_id = a.id
         WHERE t.is_active = true
         ORDER BY t.date DESC, t.display_order
         LIMIT 10`
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching timeline:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch timeline'
      });
    }
  },

  // Get categories/types
  async getTypes(req, res) {
    try {
      const result = await query(
        `SELECT 
          type,
          COUNT(*) as count 
         FROM announcements 
         WHERE is_published = true
         GROUP BY type 
         ORDER BY count DESC`
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching types:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch types'
      });
    }
  },

  // Get tags
  async getTags(req, res) {
    try {
      const result = await query(
        `SELECT 
          unnest(tags) as tag,
          COUNT(*) as count
         FROM announcements
         WHERE is_published = true AND tags IS NOT NULL
         GROUP BY tag
         ORDER BY count DESC
         LIMIT 20`
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching tags:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tags'
      });
    }
  },

  // Like an announcement
  async likeAnnouncement(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const sessionId = req.headers['x-session-id'] || uuidv4();

      // Check if already liked
      let likeQuery = 'SELECT * FROM announcement_likes WHERE announcement_id = $1 AND ';
      let likeParams = [id];
      
      if (userId) {
        likeQuery += 'user_id = $2';
        likeParams.push(userId);
      } else {
        likeQuery += 'session_id = $2';
        likeParams.push(sessionId);
      }

      const existing = await query(likeQuery, likeParams);

      if (existing.rows.length > 0) {
        // Unlike
        await query('DELETE FROM announcement_likes WHERE id = $1', [existing.rows[0].id]);
        await query('UPDATE announcements SET likes = likes - 1 WHERE id = $1', [id]);
        
        res.json({ 
          success: true, 
          liked: false,
          sessionId: !userId ? sessionId : undefined
        });
      } else {
        // Like
        await query(
          `INSERT INTO announcement_likes (id, announcement_id, user_id, session_id) 
           VALUES ($1, $2, $3, $4)`,
          [uuidv4(), id, userId || null, !userId ? sessionId : null]
        );
        await query('UPDATE announcements SET likes = likes + 1 WHERE id = $1', [id]);
        
        res.json({ 
          success: true, 
          liked: true,
          sessionId: !userId ? sessionId : undefined
        });
      }
    } catch (error) {
      console.error('Error liking announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process like'
      });
    }
  },

  // Add comment
  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { name, email, comment } = req.body;

      if (!name || !comment) {
        return res.status(400).json({
          success: false,
          message: 'Name and comment are required'
        });
      }

      const result = await query(
        `INSERT INTO announcement_comments (id, announcement_id, user_name, user_email, comment)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_name, comment, created_at`,
        [uuidv4(), id, name, email || null, comment]
      );

      await query(
        'UPDATE announcements SET comments = comments + 1 WHERE id = $1',
        [id]
      );

      res.json({
        success: true,
        message: 'Comment added successfully. It will be displayed after approval.',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add comment'
      });
    }
  },

  // Get comments for an announcement
  async getComments(req, res) {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT id, user_name, comment, created_at
         FROM announcement_comments
         WHERE announcement_id = $1 AND is_approved = true
         ORDER BY created_at DESC`,
        [id]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch comments'
      });
    }
  },

  // Subscribe to newsletter
  async subscribeNewsletter(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Check if already subscribed
      const existing = await query(
        'SELECT * FROM newsletter_subscribers WHERE email = $1',
        [email]
      );

      if (existing.rows.length > 0) {
        if (!existing.rows[0].is_active) {
          // Reactivate subscription
          await query(
            'UPDATE newsletter_subscribers SET is_active = true, subscribed_at = NOW() WHERE email = $1',
            [email]
          );
        }
        
        return res.json({
          success: true,
          message: 'You are already subscribed!'
        });
      }

      // Add new subscriber
      await query(
        'INSERT INTO newsletter_subscribers (id, email) VALUES ($1, $2)',
        [uuidv4(), email]
      );

      // Update stats
      await query(
        `UPDATE announcement_stats 
         SET value = value + 1 
         WHERE label = 'Subscribers'`,
        []
      );

      res.json({
        success: true,
        message: 'Successfully subscribed to newsletter!'
      });
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to subscribe'
      });
    }
  },

  // Unsubscribe from newsletter
  async unsubscribeNewsletter(req, res) {
    try {
      const { email } = req.params;

      const result = await query(
        `UPDATE newsletter_subscribers 
         SET is_active = false, unsubscribed_at = NOW() 
         WHERE email = $1
         RETURNING *`,
        [decodeURIComponent(email)]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Email not found'
        });
      }

      res.json({
        success: true,
        message: 'Successfully unsubscribed from newsletter'
      });
    } catch (error) {
      console.error('Error unsubscribing:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unsubscribe'
      });
    }
  },

  // ========== ADMIN ROUTES ==========

  // Create announcement (admin)
  async createAnnouncement(req, res) {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      try {
        const {
          title,
          description,
          detailed_content,
          bullet_points,
          cta,
          cta_link,
          date,
          read_time,
          type,
          priority,
          tags,
          is_featured,
          is_published,
          status
        } = req.body;

        if (!title || !description || !type) {
          return res.status(400).json({
            success: false,
            message: 'Title, description, and type are required'
          });
        }

        const imageFile = req.file;

        const result = await query(
          `INSERT INTO announcements (
            id, title, description, detailed_content, bullet_points,
            cta, cta_link, date, read_time, type, priority,
            image_url, tags, is_featured, is_published, status, created_by,
            published_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          RETURNING *`,
          [
            uuidv4(),
            title,
            description,
            detailed_content || null,
            bullet_points ? bullet_points.split('|') : [],
            cta || null,
            cta_link || null,
            date || new Date(),
            read_time || 1,
            type,
            priority || 'medium',
            imageFile?.path || null,
            tags ? tags.split(',').map(t => t.trim()) : [],
            is_featured === 'true',
            is_published === 'true',
            status || 'published',
            req.user.id,
            is_published === 'true' ? new Date() : null
          ]
        );

        // Add to timeline if published and featured
        if (is_published === 'true' && is_featured === 'true') {
          await query(
            `INSERT INTO announcement_timeline (id, date, title, type, announcement_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [uuidv4(), date || new Date(), title, type, result.rows[0].id]
          );
        }

        res.json({
          success: true,
          message: 'Announcement created successfully',
          data: result.rows[0]
        });
      } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create announcement'
        });
      }
    });
  },

  // Update announcement (admin)
  async updateAnnouncement(req, res) {
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
          title,
          description,
          detailed_content,
          bullet_points,
          cta,
          cta_link,
          date,
          read_time,
          type,
          priority,
          tags,
          is_featured,
          is_published,
          status
        } = req.body;

        const imageFile = req.file;

        // Build update query
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (title) {
          updates.push(`title = $${paramIndex++}`);
          values.push(title);
        }
        if (description) {
          updates.push(`description = $${paramIndex++}`);
          values.push(description);
        }
        if (detailed_content !== undefined) {
          updates.push(`detailed_content = $${paramIndex++}`);
          values.push(detailed_content);
        }
        if (bullet_points !== undefined) {
          updates.push(`bullet_points = $${paramIndex++}`);
          values.push(bullet_points ? bullet_points.split('|') : []);
        }
        if (cta !== undefined) {
          updates.push(`cta = $${paramIndex++}`);
          values.push(cta);
        }
        if (cta_link !== undefined) {
          updates.push(`cta_link = $${paramIndex++}`);
          values.push(cta_link);
        }
        if (date) {
          updates.push(`date = $${paramIndex++}`);
          values.push(date);
        }
        if (read_time) {
          updates.push(`read_time = $${paramIndex++}`);
          values.push(read_time);
        }
        if (type) {
          updates.push(`type = $${paramIndex++}`);
          values.push(type);
        }
        if (priority) {
          updates.push(`priority = $${paramIndex++}`);
          values.push(priority);
        }
        if (tags !== undefined) {
          updates.push(`tags = $${paramIndex++}`);
          values.push(tags ? tags.split(',').map(t => t.trim()) : []);
        }
        if (is_featured !== undefined) {
          updates.push(`is_featured = $${paramIndex++}`);
          values.push(is_featured === 'true');
        }
        if (is_published !== undefined) {
          updates.push(`is_published = $${paramIndex++}`);
          values.push(is_published === 'true');
          if (is_published === 'true') {
            updates.push(`published_at = NOW()`);
          }
        }
        if (status) {
          updates.push(`status = $${paramIndex++}`);
          values.push(status);
        }
        if (imageFile) {
          // Delete old image
          const oldResult = await query('SELECT image_url FROM announcements WHERE id = $1', [id]);
          if (oldResult.rows[0]?.image_url && fs.existsSync(oldResult.rows[0].image_url)) {
            fs.unlinkSync(oldResult.rows[0].image_url);
          }
          updates.push(`image_url = $${paramIndex++}`);
          values.push(imageFile.path);
        }

        updates.push(`updated_at = NOW()`);

        if (updates.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'No fields to update'
          });
        }

        const query_str = `
          UPDATE announcements 
          SET ${updates.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING *
        `;
        
        values.push(id);

        const result = await query(query_str, values);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Announcement not found'
          });
        }

        res.json({
          success: true,
          message: 'Announcement updated successfully',
          data: result.rows[0]
        });
      } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update announcement'
        });
      }
    });
  },

  // Delete announcement (admin)
  async deleteAnnouncement(req, res) {
    try {
      const { id } = req.params;

      // Get image path to delete file
      const result = await query('SELECT image_url FROM announcements WHERE id = $1', [id]);
      
      if (result.rows.length > 0 && result.rows[0].image_url) {
        const imageUrl = result.rows[0].image_url;
        if (fs.existsSync(imageUrl)) {
          fs.unlinkSync(imageUrl);
        }
      }

      await query('DELETE FROM announcements WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Announcement deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete announcement'
      });
    }
  },

  // Admin: Get all announcements (including drafts)
  async getAllAnnouncementsAdmin(req, res) {
    try {
      const { page = 1, limit = 20, status, type, search } = req.query;
      const offset = (page - 1) * limit;

      let conditions = [];
      let params = [];
      let paramIndex = 1;

      if (status) {
        conditions.push(`status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }

      if (type) {
        conditions.push(`type = $${paramIndex}`);
        params.push(type);
        paramIndex++;
      }

      if (search) {
        conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) 
        FROM announcements
        ${whereClause}
      `;
      const countResult = await query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Get announcements
      const itemsQuery = `
        SELECT 
          a.*,
          u.first_name || ' ' || u.last_name as creator_name
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const result = await query(itemsQuery, [...params, parseInt(limit), parseInt(offset)]);

      res.json({
        success: true,
        data: {
          announcements: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching all announcements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch announcements'
      });
    }
  },

  // Update stats (admin)
  async updateStats(req, res) {
    try {
      const { stats } = req.body;

      if (!Array.isArray(stats)) {
        return res.status(400).json({
          success: false,
          message: 'Stats must be an array'
        });
      }

      // Begin transaction
      await query('BEGIN');

      // Clear existing stats
      await query('DELETE FROM announcement_stats');

      // Insert new stats
      for (let i = 0; i < stats.length; i++) {
        const stat = stats[i];
        await query(
          `INSERT INTO announcement_stats (id, icon, label, value, color, display_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [uuidv4(), stat.icon || null, stat.label, stat.value, stat.color || 'from-blue-500 to-cyan-500', i + 1]
        );
      }

      await query('COMMIT');

      res.json({
        success: true,
        message: 'Stats updated successfully'
      });
    } catch (error) {
      await query('ROLLBACK');
      console.error('Error updating stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update stats'
      });
    }
  },

  // Update timeline (admin)
  async updateTimeline(req, res) {
    try {
      const { events } = req.body;

      if (!Array.isArray(events)) {
        return res.status(400).json({
          success: false,
          message: 'Events must be an array'
        });
      }

      // Begin transaction
      await query('BEGIN');

      // Clear existing timeline
      await query('DELETE FROM announcement_timeline WHERE announcement_id IS NULL');

      // Insert new events
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        await query(
          `INSERT INTO announcement_timeline (id, date, title, type, display_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [uuidv4(), event.date, event.title, event.type, i + 1]
        );
      }

      await query('COMMIT');

      res.json({
        success: true,
        message: 'Timeline updated successfully'
      });
    } catch (error) {
      await query('ROLLBACK');
      console.error('Error updating timeline:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update timeline'
      });
    }
  },

  // Get subscribers (admin)
  async getSubscribers(req, res) {
    try {
      const { page = 1, limit = 50, is_active = true } = req.query;
      const offset = (page - 1) * limit;

      const countResult = await query(
        'SELECT COUNT(*) FROM newsletter_subscribers WHERE is_active = $1',
        [is_active === 'true']
      );
      const total = parseInt(countResult.rows[0].count);

      const result = await query(
        `SELECT id, email, subscribed_at
         FROM newsletter_subscribers
         WHERE is_active = $1
         ORDER BY subscribed_at DESC
         LIMIT $2 OFFSET $3`,
        [is_active === 'true', parseInt(limit), parseInt(offset)]
      );

      res.json({
        success: true,
        data: {
          subscribers: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscribers'
      });
    }
  },

  // Export subscribers (admin)
  async exportSubscribers(req, res) {
    try {
      const result = await query(
        `SELECT email, subscribed_at
         FROM newsletter_subscribers
         WHERE is_active = true
         ORDER BY subscribed_at DESC`
      );

      const csv = [
        ['Email', 'Subscribed Date'],
        ...result.rows.map(row => [row.email, row.subscribed_at])
      ].map(row => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=subscribers.csv');
      res.send(csv);
    } catch (error) {
      console.error('Error exporting subscribers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export subscribers'
      });
    }
  }
};

module.exports = announcementController;