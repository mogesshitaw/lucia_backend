const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Configure multer for service images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/services/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'service-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// ==================== Service Categories ====================

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM service_categories 
       ORDER BY display_order ASC, name ASC`
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// Create category
router.post('/categories', async (req, res) => {
  try {
    const { name, slug, description, icon_name, display_order } = req.body;
    
    const result = await query(
      `INSERT INTO service_categories (id, name, slug, description, icon_name, display_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [uuidv4(), name, slug, description, icon_name, display_order || 0]
    );
    
    res.json({
      success: true,
      message: 'Category created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon_name, display_order } = req.body;
    
    const result = await query(
      `UPDATE service_categories 
       SET name = COALESCE($2, name),
           slug = COALESCE($3, slug),
           description = COALESCE($4, description),
           icon_name = COALESCE($5, icon_name),
           display_order = COALESCE($6, display_order)
       WHERE id = $1
       RETURNING *`,
      [id, name, slug, description, icon_name, display_order]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has services
    const checkResult = await query(
      'SELECT COUNT(*) FROM services WHERE category = (SELECT slug FROM service_categories WHERE id = $1)',
      [id]
    );
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing services'
      });
    }
    
    const result = await query('DELETE FROM service_categories WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
});

// ==================== Services ====================

// Get all services with related data
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, search } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;
    
    if (category) {
      whereConditions.push(`s.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }
    
    if (status) {
      whereConditions.push(`s.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    
    if (search) {
      whereConditions.push(`(s.title ILIKE $${paramIndex} OR s.short_description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) FROM services s ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);
    
    // Get services
    const servicesQuery = `
      SELECT 
        s.*,
        c.name as category_name,
        c.icon_name as category_icon,
        (SELECT json_agg(json_build_object('feature', f.feature, 'order', f.display_order) ORDER BY f.display_order) 
         FROM service_features f WHERE f.service_id = s.id) as features,
        (SELECT json_agg(json_build_object('application', a.application, 'order', a.display_order) ORDER BY a.display_order) 
         FROM service_applications a WHERE a.service_id = s.id) as applications,
        (SELECT json_agg(json_build_object('step', p.step_number, 'title', p.title, 'description', p.description, 'icon', p.icon_name, 'order', p.display_order) ORDER BY p.display_order) 
         FROM service_process_steps p WHERE p.service_id = s.id) as process_steps,
        (SELECT json_agg(json_build_object('label', sp.label, 'value', sp.value, 'order', sp.display_order) ORDER BY sp.display_order) 
         FROM service_specs sp WHERE sp.service_id = s.id) as specifications,
        (SELECT json_agg(m.material ORDER BY m.display_order) 
         FROM service_materials m WHERE m.service_id = s.id) as materials,
        (SELECT json_agg(f.format ORDER BY f.display_order) 
         FROM service_formats f WHERE f.service_id = s.id) as formats,
        (SELECT json_agg(c.color ORDER BY c.display_order) 
         FROM service_colors c WHERE c.service_id = s.id) as colors,
        (SELECT json_agg(json_build_object('question', f.question, 'answer', f.answer, 'order', f.display_order) ORDER BY f.display_order) 
         FROM service_faqs f WHERE f.service_id = s.id) as faqs,
        (SELECT json_agg(json_build_object('path', i.image_path, 'thumbnail', i.thumbnail_path, 'alt', i.alt_text, 'primary', i.is_primary) ORDER BY i.display_order) 
         FROM service_images i WHERE i.service_id = s.id) as gallery
      FROM services s
      LEFT JOIN service_categories c ON s.category = c.slug
      ${whereClause}
      ORDER BY s.display_order ASC, s.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const result = await query(servicesQuery, [...params, parseInt(limit), parseInt(offset)]);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
});

// Get single service by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT 
        s.*,
        c.name as category_name,
        c.icon_name as category_icon,
        (SELECT json_agg(f.feature ORDER BY f.display_order) FROM service_features f WHERE f.service_id = s.id) as features,
        (SELECT json_agg(a.application ORDER BY a.display_order) FROM service_applications a WHERE a.service_id = s.id) as applications,
        (SELECT json_agg(json_build_object('step', p.step_number, 'title', p.title, 'description', p.description, 'icon', p.icon_name) ORDER BY p.display_order) 
         FROM service_process_steps p WHERE p.service_id = s.id) as process_steps,
        (SELECT json_agg(json_build_object('label', sp.label, 'value', sp.value) ORDER BY sp.display_order) 
         FROM service_specs sp WHERE sp.service_id = s.id) as specifications,
        (SELECT json_agg(m.material ORDER BY m.display_order) FROM service_materials m WHERE m.service_id = s.id) as materials,
        (SELECT json_agg(f.format ORDER BY f.display_order) FROM service_formats f WHERE f.service_id = s.id) as formats,
        (SELECT json_agg(c.color ORDER BY c.display_order) FROM service_colors c WHERE c.service_id = s.id) as colors,
        (SELECT json_agg(json_build_object('question', f.question, 'answer', f.answer) ORDER BY f.display_order) 
         FROM service_faqs f WHERE f.service_id = s.id) as faqs,
        (SELECT json_agg(json_build_object('path', i.image_path, 'thumbnail', i.thumbnail_path, 'alt', i.alt_text, 'primary', i.is_primary) ORDER BY i.display_order) 
         FROM service_images i WHERE i.service_id = s.id) as gallery
      FROM services s
      LEFT JOIN service_categories c ON s.category = c.slug
      WHERE s.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service'
    });
  }
});

// Get service by slug (for frontend)
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const result = await query(
      `SELECT 
        s.*,
        c.name as category_name,
        c.icon_name as category_icon,
        (SELECT json_agg(f.feature ORDER BY f.display_order) FROM service_features f WHERE f.service_id = s.id) as features,
        (SELECT json_agg(a.application ORDER BY a.display_order) FROM service_applications a WHERE a.service_id = s.id) as applications,
        (SELECT json_agg(json_build_object('step', p.step_number, 'title', p.title, 'description', p.description, 'icon', p.icon_name) ORDER BY p.display_order) 
         FROM service_process_steps p WHERE p.service_id = s.id) as process_steps,
        (SELECT json_agg(json_build_object('label', sp.label, 'value', sp.value) ORDER BY sp.display_order) 
         FROM service_specs sp WHERE sp.service_id = s.id) as specifications,
        (SELECT json_agg(m.material ORDER BY m.display_order) FROM service_materials m WHERE m.service_id = s.id) as materials,
        (SELECT json_agg(f.format ORDER BY f.display_order) FROM service_formats f WHERE f.service_id = s.id) as formats,
        (SELECT json_agg(c.color ORDER BY c.display_order) FROM service_colors c WHERE c.service_id = s.id) as colors,
        (SELECT json_agg(json_build_object('question', f.question, 'answer', f.answer) ORDER BY f.display_order) 
         FROM service_faqs f WHERE f.service_id = s.id) as faqs,
        (SELECT json_agg(json_build_object('path', i.image_path, 'thumbnail', i.thumbnail_path, 'alt', i.alt_text, 'primary', i.is_primary) ORDER BY i.display_order) 
         FROM service_images i WHERE i.service_id = s.id) as gallery
      FROM services s
      LEFT JOIN service_categories c ON s.category = c.slug
      WHERE s.slug = $1 AND s.status = 'active'`,
      [slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching service by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service'
    });
  }
});

// Create new service
router.post('/', upload.array('gallery', 10), async (req, res) => {
  const client = await query.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      title, slug, short_description, full_description,
      icon_name, gradient_from, gradient_to, badge,
      category, subcategory, price_range, min_order,
      turnaround, is_featured, is_popular, is_new,
      display_order, status, seo_title, seo_description,
      seo_keywords,
      // JSON fields
      features, applications, process_steps,
      specifications, materials, formats, colors, faqs
    } = req.body;
    
    const userId = req.user.id;
    const serviceId = uuidv4();
    const serviceCode = `SRV-${Date.now()}`;
    
    // Insert main service
    await client.query(
      `INSERT INTO services (
        id, service_code, title, slug, short_description, full_description,
        icon_name, gradient_from, gradient_to, badge, category, subcategory,
        price_range, min_order, turnaround, is_featured, is_popular, is_new,
        display_order, status, seo_title, seo_description, seo_keywords,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
      [serviceId, serviceCode, title, slug, short_description, full_description,
       icon_name, gradient_from, gradient_to, badge, category, subcategory,
       price_range, min_order, turnaround, is_featured || false, is_popular || false, is_new || false,
       display_order || 0, status || 'active', seo_title, seo_description, seo_keywords,
       userId]
    );
    
    // Insert features
    if (features) {
      const featuresArray = JSON.parse(features);
      for (let i = 0; i < featuresArray.length; i++) {
        await client.query(
          `INSERT INTO service_features (id, service_id, feature, display_order)
           VALUES ($1, $2, $3, $4)`,
          [uuidv4(), serviceId, featuresArray[i], i]
        );
      }
    }
    
    // Insert applications
    if (applications) {
      const applicationsArray = JSON.parse(applications);
      for (let i = 0; i < applicationsArray.length; i++) {
        await client.query(
          `INSERT INTO service_applications (id, service_id, application, display_order)
           VALUES ($1, $2, $3, $4)`,
          [uuidv4(), serviceId, applicationsArray[i], i]
        );
      }
    }
    
    // Insert process steps
    if (process_steps) {
      const stepsArray = JSON.parse(process_steps);
      for (let i = 0; i < stepsArray.length; i++) {
        const step = stepsArray[i];
        await client.query(
          `INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uuidv4(), serviceId, step.step || i+1, step.title, step.description, step.icon, i]
        );
      }
    }
    
    // Insert specifications
    if (specifications) {
      const specsArray = JSON.parse(specifications);
      for (let i = 0; i < specsArray.length; i++) {
        const spec = specsArray[i];
        await client.query(
          `INSERT INTO service_specs (id, service_id, label, value, display_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [uuidv4(), serviceId, spec.label, spec.value, i]
        );
      }
    }
    
    // Insert materials
    if (materials) {
      const materialsArray = JSON.parse(materials);
      for (let i = 0; i < materialsArray.length; i++) {
        await client.query(
          `INSERT INTO service_materials (id, service_id, material, display_order)
           VALUES ($1, $2, $3, $4)`,
          [uuidv4(), serviceId, materialsArray[i], i]
        );
      }
    }
    
    // Insert formats
    if (formats) {
      const formatsArray = JSON.parse(formats);
      for (let i = 0; i < formatsArray.length; i++) {
        await client.query(
          `INSERT INTO service_formats (id, service_id, format, display_order)
           VALUES ($1, $2, $3, $4)`,
          [uuidv4(), serviceId, formatsArray[i], i]
        );
      }
    }
    
    // Insert colors
    if (colors) {
      const colorsArray = JSON.parse(colors);
      for (let i = 0; i < colorsArray.length; i++) {
        await client.query(
          `INSERT INTO service_colors (id, service_id, color, display_order)
           VALUES ($1, $2, $3, $4)`,
          [uuidv4(), serviceId, colorsArray[i], i]
        );
      }
    }
    
    // Insert FAQs
    if (faqs) {
      const faqsArray = JSON.parse(faqs);
      for (let i = 0; i < faqsArray.length; i++) {
        const faq = faqsArray[i];
        await client.query(
          `INSERT INTO service_faqs (id, service_id, question, answer, display_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [uuidv4(), serviceId, faq.question, faq.answer, i]
        );
      }
    }
    
    // Insert gallery images
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        
        // Create thumbnail
        const thumbnailFilename = `thumb-${file.filename}`;
        const thumbnailPath = path.join('uploads', 'services', 'thumbnails', thumbnailFilename);
        
        // Ensure thumbnail directory exists
        const thumbDir = path.join('uploads', 'services', 'thumbnails');
        if (!fs.existsSync(thumbDir)) {
          fs.mkdirSync(thumbDir, { recursive: true });
        }
        
        // Create thumbnail
        await sharp(file.path)
          .resize(300, 300, { fit: 'cover' })
          .toFile(thumbnailPath);
        
        await client.query(
          `INSERT INTO service_images (id, service_id, image_path, thumbnail_path, alt_text, is_primary, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uuidv4(), serviceId, file.path, thumbnailPath, file.originalname, i === 0, i]
        );
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Service created successfully',
      data: { id: serviceId }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service'
    });
  } finally {
    client.release();
  }
});

// Update service
router.put('/:id', upload.array('gallery', 10), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const {
      title, slug, short_description, full_description,
      icon_name, gradient_from, gradient_to, badge,
      category, subcategory, price_range, min_order,
      turnaround, is_featured, is_popular, is_new,
      display_order, status, seo_title, seo_description,
      seo_keywords,
      // JSON fields
      features, applications, process_steps,
      specifications, materials, formats, colors, faqs,
      deleted_images
    } = req.body;
    
    const userId = req.user.id;
    
    // Update main service
    await client.query(
      `UPDATE services 
       SET title = COALESCE($2, title),
           slug = COALESCE($3, slug),
           short_description = COALESCE($4, short_description),
           full_description = COALESCE($5, full_description),
           icon_name = COALESCE($6, icon_name),
           gradient_from = COALESCE($7, gradient_from),
           gradient_to = COALESCE($8, gradient_to),
           badge = COALESCE($9, badge),
           category = COALESCE($10, category),
           subcategory = COALESCE($11, subcategory),
           price_range = COALESCE($12, price_range),
           min_order = COALESCE($13, min_order),
           turnaround = COALESCE($14, turnaround),
           is_featured = COALESCE($15, is_featured),
           is_popular = COALESCE($16, is_popular),
           is_new = COALESCE($17, is_new),
           display_order = COALESCE($18, display_order),
           status = COALESCE($19, status),
           seo_title = COALESCE($20, seo_title),
           seo_description = COALESCE($21, seo_description),
           seo_keywords = COALESCE($22, seo_keywords),
           updated_by = $23,
           updated_at = NOW()
       WHERE id = $1`,
      [id, title, slug, short_description, full_description,
       icon_name, gradient_from, gradient_to, badge, category, subcategory,
       price_range, min_order, turnaround, is_featured, is_popular, is_new,
       display_order, status, seo_title, seo_description, seo_keywords,
       userId]
    );
    
    // Delete old related data
    await client.query('DELETE FROM service_features WHERE service_id = $1', [id]);
    await client.query('DELETE FROM service_applications WHERE service_id = $1', [id]);
    await client.query('DELETE FROM service_process_steps WHERE service_id = $1', [id]);
    await client.query('DELETE FROM service_specs WHERE service_id = $1', [id]);
    await client.query('DELETE FROM service_materials WHERE service_id = $1', [id]);
    await client.query('DELETE FROM service_formats WHERE service_id = $1', [id]);
    await client.query('DELETE FROM service_colors WHERE service_id = $1', [id]);
    await client.query('DELETE FROM service_faqs WHERE service_id = $1', [id]);
    
    // Delete specific images if requested
    if (deleted_images) {
      const deletedImagesArray = JSON.parse(deleted_images);
      for (const imageId of deletedImagesArray) {
        const imageResult = await client.query('SELECT image_path, thumbnail_path FROM service_images WHERE id = $1', [imageId]);
        if (imageResult.rows.length > 0) {
          const image = imageResult.rows[0];
          // Delete files
          if (fs.existsSync(image.image_path)) fs.unlinkSync(image.image_path);
          if (image.thumbnail_path && fs.existsSync(image.thumbnail_path)) fs.unlinkSync(image.thumbnail_path);
        }
        await client.query('DELETE FROM service_images WHERE id = $1', [imageId]);
      }
    }
    
    // Insert updated features
    if (features) {
      const featuresArray = JSON.parse(features);
      for (let i = 0; i < featuresArray.length; i++) {
        await client.query(
          `INSERT INTO service_features (id, service_id, feature, display_order)
           VALUES ($1, $2, $3, $4)`,
          [uuidv4(), id, featuresArray[i], i]
        );
      }
    }
    
    // Insert updated applications
    if (applications) {
      const applicationsArray = JSON.parse(applications);
      for (let i = 0; i < applicationsArray.length; i++) {
        await client.query(
          `INSERT INTO service_applications (id, service_id, application, display_order)
           VALUES ($1, $2, $3, $4)`,
          [uuidv4(), id, applicationsArray[i], i]
        );
      }
    }
    
    // Insert updated process steps
    if (process_steps) {
      const stepsArray = JSON.parse(process_steps);
      for (let i = 0; i < stepsArray.length; i++) {
        const step = stepsArray[i];
        await client.query(
          `INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uuidv4(), id, step.step || i+1, step.title, step.description, step.icon, i]
        );
      }
    }
    
    // Insert updated specifications
    if (specifications) {
      const specsArray = JSON.parse(specifications);
      for (let i = 0; i < specsArray.length; i++) {
        const spec = specsArray[i];
        await client.query(
          `INSERT INTO service_specs (id, service_id, label, value, display_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [uuidv4(), id, spec.label, spec.value, i]
        );
      }
    }
    
    // Insert updated materials
    if (materials) {
      const materialsArray = JSON.parse(materials);
      for (let i = 0; i < materialsArray.length; i++) {
        await client.query(
          `INSERT INTO service_materials (id, service_id, material, display_order)
           VALUES ($1, $2, $3, $4)`,
          [uuidv4(), id, materialsArray[i], i]
        );
      }
    }
    
    // Insert updated formats
    if (formats) {
      const formatsArray = JSON.parse(formats);
      for (let i = 0; i < formatsArray.length; i++) {
        await client.query(
          `INSERT INTO service_formats (id, service_id, format, display_order)
           VALUES ($1, $2, $3, $4)`,
          [uuidv4(), id, formatsArray[i], i]
        );
      }
    }
    
    // Insert updated colors
    if (colors) {
      const colorsArray = JSON.parse(colors);
      for (let i = 0; i < colorsArray.length; i++) {
        await client.query(
          `INSERT INTO service_colors (id, service_id, color, display_order)
           VALUES ($1, $2, $3, $4)`,
          [uuidv4(), id, colorsArray[i], i]
        );
      }
    }
    
    // Insert updated FAQs
    if (faqs) {
      const faqsArray = JSON.parse(faqs);
      for (let i = 0; i < faqsArray.length; i++) {
        const faq = faqsArray[i];
        await client.query(
          `INSERT INTO service_faqs (id, service_id, question, answer, display_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [uuidv4(), id, faq.question, faq.answer, i]
        );
      }
    }
    
    // Insert new gallery images
    if (req.files && req.files.length > 0) {
      const existingImages = await client.query(
        'SELECT COUNT(*) FROM service_images WHERE service_id = $1',
        [id]
      );
      const startIndex = parseInt(existingImages.rows[0].count);
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        
        // Create thumbnail
        const thumbnailFilename = `thumb-${file.filename}`;
        const thumbnailPath = path.join('uploads', 'services', 'thumbnails', thumbnailFilename);
        
        // Ensure thumbnail directory exists
        const thumbDir = path.join('uploads', 'services', 'thumbnails');
        if (!fs.existsSync(thumbDir)) {
          fs.mkdirSync(thumbDir, { recursive: true });
        }
        
        // Create thumbnail
        await sharp(file.path)
          .resize(300, 300, { fit: 'cover' })
          .toFile(thumbnailPath);
        
        await client.query(
          `INSERT INTO service_images (id, service_id, image_path, thumbnail_path, alt_text, is_primary, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uuidv4(), id, file.path, thumbnailPath, file.originalname, false, startIndex + i]
        );
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Service updated successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service'
    });
  } finally {
    client.release();
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // Get all images to delete files
    const imagesResult = await client.query(
      'SELECT image_path, thumbnail_path FROM service_images WHERE service_id = $1',
      [id]
    );
    
    // Delete image files
    for (const image of imagesResult.rows) {
      if (fs.existsSync(image.image_path)) fs.unlinkSync(image.image_path);
      if (image.thumbnail_path && fs.existsSync(image.thumbnail_path)) fs.unlinkSync(image.thumbnail_path);
    }
    
    // Delete service (cascades will delete related records)
    const result = await client.query('DELETE FROM services WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service'
    });
  } finally {
    client.release();
  }
});

// Toggle service status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await query(
      `UPDATE services 
       SET status = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING id, title, status`,
      [id, status]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      message: `Service ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error toggling service status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service status'
    });
  }
});

// Bulk update display order
router.post('/reorder', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { orders } = req.body; // Array of { id, display_order }
    
    for (const item of orders) {
      await client.query(
        'UPDATE services SET display_order = $2 WHERE id = $1',
        [item.id, item.display_order]
      );
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Services reordered successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error reordering services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder services'
    });
  } finally {
    client.release();
  }
});

module.exports = router;