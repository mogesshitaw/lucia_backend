const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const serviceController = {
  // ==================== CATEGORY MANAGEMENT ====================

  // Get all categories
  async getCategories(req, res) {
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
  },

  // Get single category by ID
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT * FROM service_categories WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category'
      });
    }
  },

  // Create category
  async createCategory(req, res) {
    try {
      const { name, slug, description, icon_name, display_order } = req.body;

      // Check if slug already exists
      const existing = await query(
        'SELECT id FROM service_categories WHERE slug = $1',
        [slug]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Category with this slug already exists'
        });
      }

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
  },

  // Update category
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, slug, description, icon_name, display_order } = req.body;

      // Check if slug already exists for another category
      if (slug) {
        const existing = await query(
          'SELECT id FROM service_categories WHERE slug = $1 AND id != $2',
          [slug, id]
        );

        if (existing.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Category with this slug already exists'
          });
        }
      }

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
  },

  // Delete category
  async deleteCategory(req, res) {
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

      const result = await query(
        'DELETE FROM service_categories WHERE id = $1 RETURNING id',
        [id]
      );

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
  },

  // ==================== SERVICE MANAGEMENT ====================

  // Get all services with filters and pagination
  async getServices(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        status,
        search,
        featured,
        popular,
        new: isNew,
        sortBy = 'display_order',
        sortOrder = 'asc'
      } = req.query;

      const offset = (page - 1) * limit;

      // Whitelist allowed sort fields
      const allowedSortFields = ['created_at', 'title', 'display_order', 'price_range', 'status'];
      const allowedSortOrders = ['asc', 'desc'];
      
      const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'display_order';
      const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder : 'asc';

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

      if (featured === 'true') {
        whereConditions.push(`s.is_featured = true`);
      }

      if (popular === 'true') {
        whereConditions.push(`s.is_popular = true`);
      }

      if (isNew === 'true') {
        whereConditions.push(`s.is_new = true`);
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
          s.id,
          s.service_code,
          s.title,
          s.slug,
          s.short_description,
          s.icon_name,
          s.gradient_from,
          s.gradient_to,
          s.badge,
          s.category,
          s.subcategory,
          s.price_range,
          s.min_order,
          s.turnaround,
          s.is_featured,
          s.is_popular,
          s.is_new,
          s.display_order,
          s.status,
          s.seo_title,
          s.seo_description,
          s.seo_keywords,
          s.created_at,
          s.updated_at,
          c.name as category_name,
          c.icon_name as category_icon
        FROM services s
        LEFT JOIN service_categories c ON s.category = c.slug
        ${whereClause}
        ORDER BY s.${safeSortBy} ${safeSortOrder}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const result = await query(servicesQuery, [...params, parseInt(limit), parseInt(offset)]);

      // Get additional data for each service (features, applications, etc.)
const servicesWithDetails = [];
for (const service of result.rows)  {
        const [features, applications, processSteps, specs, materials, formats, colors, faqs, gallery] = await Promise.all([
          query('SELECT feature FROM service_features WHERE service_id = $1 ORDER BY display_order', [service.id]),
          query('SELECT application FROM service_applications WHERE service_id = $1 ORDER BY display_order', [service.id]),
          query('SELECT step_number, title, description, icon_name FROM service_process_steps WHERE service_id = $1 ORDER BY display_order', [service.id]),
          query('SELECT label, value FROM service_specs WHERE service_id = $1 ORDER BY display_order', [service.id]),
          query('SELECT material FROM service_materials WHERE service_id = $1 ORDER BY display_order', [service.id]),
          query('SELECT format FROM service_formats WHERE service_id = $1 ORDER BY display_order', [service.id]),
          query('SELECT color FROM service_colors WHERE service_id = $1 ORDER BY display_order', [service.id]),
          query('SELECT question, answer FROM service_faqs WHERE service_id = $1 ORDER BY display_order', [service.id]),
          query('SELECT id, image_path, thumbnail_path, alt_text, is_primary FROM service_images WHERE service_id = $1 ORDER BY display_order', [service.id])
        ]);

     servicesWithDetails.push({
         ...service,
          features: features.rows.map(f => f.feature),
          applications: applications.rows.map(a => a.application),
          process_steps: processSteps.rows,
          specifications: specs.rows,
          materials: materials.rows.map(m => m.material),
          formats: formats.rows.map(f => f.format),
          colors: colors.rows.map(c => c.color),
          faqs: faqs.rows,
          gallery: gallery.rows
     });
      };

      res.json({
        success: true,
        data: servicesWithDetails,
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
  },

  // Get single service by ID
  async getServiceById(req, res) {
    try {
      const { id } = req.params;

      const serviceResult = await query(
        `SELECT 
          s.*,
          c.name as category_name,
          c.icon_name as category_icon
        FROM services s
        LEFT JOIN service_categories c ON s.category = c.slug
        WHERE s.id = $1`,
        [id]
      );

      if (serviceResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      const service = serviceResult.rows[0];

      // Get related data
      const [features, applications, processSteps, specs, materials, formats, colors, faqs, gallery] = await Promise.all([
        query('SELECT feature FROM service_features WHERE service_id = $1 ORDER BY display_order', [id]),
        query('SELECT application FROM service_applications WHERE service_id = $1 ORDER BY display_order', [id]),
        query('SELECT step_number, title, description, icon_name FROM service_process_steps WHERE service_id = $1 ORDER BY display_order', [id]),
        query('SELECT label, value FROM service_specs WHERE service_id = $1 ORDER BY display_order', [id]),
        query('SELECT material FROM service_materials WHERE service_id = $1 ORDER BY display_order', [id]),
        query('SELECT format FROM service_formats WHERE service_id = $1 ORDER BY display_order', [id]),
        query('SELECT color FROM service_colors WHERE service_id = $1 ORDER BY display_order', [id]),
        query('SELECT question, answer FROM service_faqs WHERE service_id = $1 ORDER BY display_order', [id]),
        query('SELECT id, image_path, thumbnail_path, alt_text, is_primary FROM service_images WHERE service_id = $1 ORDER BY display_order', [id])
      ]);

      res.json({
        success: true,
        data: {
          ...service,
          features: features.rows.map(f => f.feature),
          applications: applications.rows.map(a => a.application),
          process_steps: processSteps.rows,
          specifications: specs.rows,
          materials: materials.rows.map(m => m.material),
          formats: formats.rows.map(f => f.format),
          colors: colors.rows.map(c => c.color),
          faqs: faqs.rows,
          gallery: gallery.rows
        }
      });
    } catch (error) {
      console.error('Error fetching service:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch service'
      });
    }
  },

  // Get service by slug (public)
  async getServiceBySlug(req, res) {
    try {
      const { slug } = req.params;

      const serviceResult = await query(
        `SELECT 
          s.*,
          c.name as category_name,
          c.icon_name as category_icon
        FROM services s
        LEFT JOIN service_categories c ON s.category = c.slug
        WHERE s.slug = $1 AND s.status = 'active'`,
        [slug]
      );

      if (serviceResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      const service = serviceResult.rows[0];

      // Get related data
      const [features, applications, processSteps, specs, materials, formats, colors, faqs, gallery] = await Promise.all([
        query('SELECT feature FROM service_features WHERE service_id = $1 ORDER BY display_order', [service.id]),
        query('SELECT application FROM service_applications WHERE service_id = $1 ORDER BY display_order', [service.id]),
        query('SELECT step_number, title, description, icon_name FROM service_process_steps WHERE service_id = $1 ORDER BY display_order', [service.id]),
        query('SELECT label, value FROM service_specs WHERE service_id = $1 ORDER BY display_order', [service.id]),
        query('SELECT material FROM service_materials WHERE service_id = $1 ORDER BY display_order', [service.id]),
        query('SELECT format FROM service_formats WHERE service_id = $1 ORDER BY display_order', [service.id]),
        query('SELECT color FROM service_colors WHERE service_id = $1 ORDER BY display_order', [service.id]),
        query('SELECT question, answer FROM service_faqs WHERE service_id = $1 ORDER BY display_order', [service.id]),
        query('SELECT id, image_path, thumbnail_path, alt_text, is_primary FROM service_images WHERE service_id = $1 ORDER BY display_order', [service.id])
      ]);

      res.json({
        success: true,
        data: {
          ...service,
          features: features.rows.map(f => f.feature),
          applications: applications.rows.map(a => a.application),
          process_steps: processSteps.rows,
          specifications: specs.rows,
          materials: materials.rows.map(m => m.material),
          formats: formats.rows.map(f => f.format),
          colors: colors.rows.map(c => c.color),
          faqs: faqs.rows,
          gallery: gallery.rows
        }
      });
    } catch (error) {
      console.error('Error fetching service by slug:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch service'
      });
    }
  },

  // Create new service
  async createService(req, res) {
    const client = await require('../config/database').pool.connect();
    
    try {
      await client.query('BEGIN');

      const {
        title, slug, short_description, full_description,
        icon_name, gradient_from, gradient_to, badge,
        category, subcategory, price_range, min_order,
        turnaround, is_featured, is_popular, is_new,
        display_order, status, seo_title, seo_description,
        seo_keywords,
        features, applications, process_steps,
        specifications, materials, formats, colors, faqs
      } = req.body;

      const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
      const serviceId = uuidv4();
      const serviceCode = `SRV-${Date.now()}`;

      // Check if slug already exists
      const existingSlug = await client.query(
        'SELECT id FROM services WHERE slug = $1',
        [slug]
      );

      if (existingSlug.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Service with this slug already exists'
        });
      }

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
      if (features && Array.isArray(features)) {
        for (let i = 0; i < features.length; i++) {
          if (features[i]) {
            await client.query(
              `INSERT INTO service_features (id, service_id, feature, display_order)
               VALUES ($1, $2, $3, $4)`,
              [uuidv4(), serviceId, features[i], i]
            );
          }
        }
      }

      // Insert applications
      if (applications && Array.isArray(applications)) {
        for (let i = 0; i < applications.length; i++) {
          if (applications[i]) {
            await client.query(
              `INSERT INTO service_applications (id, service_id, application, display_order)
               VALUES ($1, $2, $3, $4)`,
              [uuidv4(), serviceId, applications[i], i]
            );
          }
        }
      }

      // Insert process steps
      if (process_steps && Array.isArray(process_steps)) {
        for (let i = 0; i < process_steps.length; i++) {
          const step = process_steps[i];
          if (step && step.title) {
            await client.query(
              `INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [uuidv4(), serviceId, step.step_number || i + 1, step.title, step.description || '', step.icon_name || 'Printer', i]
            );
          }
        }
      }

      // Insert specifications
      if (specifications && Array.isArray(specifications)) {
        for (let i = 0; i < specifications.length; i++) {
          const spec = specifications[i];
          if (spec && spec.label && spec.value) {
            await client.query(
              `INSERT INTO service_specs (id, service_id, label, value, display_order)
               VALUES ($1, $2, $3, $4, $5)`,
              [uuidv4(), serviceId, spec.label, spec.value, i]
            );
          }
        }
      }

      // Insert materials
      if (materials && Array.isArray(materials)) {
        for (let i = 0; i < materials.length; i++) {
          if (materials[i]) {
            await client.query(
              `INSERT INTO service_materials (id, service_id, material, display_order)
               VALUES ($1, $2, $3, $4)`,
              [uuidv4(), serviceId, materials[i], i]
            );
          }
        }
      }

      // Insert formats
      if (formats && Array.isArray(formats)) {
        for (let i = 0; i < formats.length; i++) {
          if (formats[i]) {
            await client.query(
              `INSERT INTO service_formats (id, service_id, format, display_order)
               VALUES ($1, $2, $3, $4)`,
              [uuidv4(), serviceId, formats[i], i]
            );
          }
        }
      }

      // Insert colors
      if (colors && Array.isArray(colors)) {
        for (let i = 0; i < colors.length; i++) {
          if (colors[i]) {
            await client.query(
              `INSERT INTO service_colors (id, service_id, color, display_order)
               VALUES ($1, $2, $3, $4)`,
              [uuidv4(), serviceId, colors[i], i]
            );
          }
        }
      }

      // Insert FAQs
      if (faqs && Array.isArray(faqs)) {
        for (let i = 0; i < faqs.length; i++) {
          const faq = faqs[i];
          if (faq && faq.question && faq.answer) {
            await client.query(
              `INSERT INTO service_faqs (id, service_id, question, answer, display_order)
               VALUES ($1, $2, $3, $4, $5)`,
              [uuidv4(), serviceId, faq.question, faq.answer, i]
            );
          }
        }
      }

      // Handle gallery images if files were uploaded
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
        message: 'Failed to create service',
        error: error.message
      });
    } finally {
      client.release();
    }
  },

  // Update service
  async updateService(req, res) {
    const client = await require('../config/database').pool.connect();
    
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
        features, applications, process_steps,
        specifications, materials, formats, colors, faqs,
        deleted_images
      } = req.body;

      const userId = req.user?.id;

      // Check if service exists
      const serviceExists = await client.query(
        'SELECT id FROM services WHERE id = $1',
        [id]
      );

      if (serviceExists.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      // Check if slug already exists for another service
      if (slug) {
        const existingSlug = await client.query(
          'SELECT id FROM services WHERE slug = $1 AND id != $2',
          [slug, id]
        );

        if (existingSlug.rows.length > 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: 'Service with this slug already exists'
          });
        }
      }

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
         WHERE id = $1
         RETURNING *`,
        [id, title, slug, short_description, full_description,
         icon_name, gradient_from, gradient_to, badge, category, subcategory,
         price_range, min_order, turnaround, is_featured, is_popular, is_new,
         display_order, status, seo_title, seo_description, seo_keywords,
         userId]
      );

      // Delete existing related data
      await client.query('DELETE FROM service_features WHERE service_id = $1', [id]);
      await client.query('DELETE FROM service_applications WHERE service_id = $1', [id]);
      await client.query('DELETE FROM service_process_steps WHERE service_id = $1', [id]);
      await client.query('DELETE FROM service_specs WHERE service_id = $1', [id]);
      await client.query('DELETE FROM service_materials WHERE service_id = $1', [id]);
      await client.query('DELETE FROM service_formats WHERE service_id = $1', [id]);
      await client.query('DELETE FROM service_colors WHERE service_id = $1', [id]);
      await client.query('DELETE FROM service_faqs WHERE service_id = $1', [id]);

      // Delete specific images if requested
      if (deleted_images && Array.isArray(deleted_images)) {
        for (const imageId of deleted_images) {
          const imageResult = await client.query(
            'SELECT image_path, thumbnail_path FROM service_images WHERE id = $1',
            [imageId]
          );
          
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
      if (features && Array.isArray(features)) {
        for (let i = 0; i < features.length; i++) {
          if (features[i]) {
            await client.query(
              `INSERT INTO service_features (id, service_id, feature, display_order)
               VALUES ($1, $2, $3, $4)`,
              [uuidv4(), id, features[i], i]
            );
          }
        }
      }

      // Insert updated applications
      if (applications && Array.isArray(applications)) {
        for (let i = 0; i < applications.length; i++) {
          if (applications[i]) {
            await client.query(
              `INSERT INTO service_applications (id, service_id, application, display_order)
               VALUES ($1, $2, $3, $4)`,
              [uuidv4(), id, applications[i], i]
            );
          }
        }
      }

      // Insert updated process steps
      if (process_steps && Array.isArray(process_steps)) {
        for (let i = 0; i < process_steps.length; i++) {
          const step = process_steps[i];
          if (step && step.title) {
            await client.query(
              `INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [uuidv4(), id, step.step_number || i + 1, step.title, step.description || '', step.icon_name || 'Printer', i]
            );
          }
        }
      }

      // Insert updated specifications
      if (specifications && Array.isArray(specifications)) {
        for (let i = 0; i < specifications.length; i++) {
          const spec = specifications[i];
          if (spec && spec.label && spec.value) {
            await client.query(
              `INSERT INTO service_specs (id, service_id, label, value, display_order)
               VALUES ($1, $2, $3, $4, $5)`,
              [uuidv4(), id, spec.label, spec.value, i]
            );
          }
        }
      }

      // Insert updated materials
      if (materials && Array.isArray(materials)) {
        for (let i = 0; i < materials.length; i++) {
          if (materials[i]) {
            await client.query(
              `INSERT INTO service_materials (id, service_id, material, display_order)
               VALUES ($1, $2, $3, $4)`,
              [uuidv4(), id, materials[i], i]
            );
          }
        }
      }

      // Insert updated formats
      if (formats && Array.isArray(formats)) {
        for (let i = 0; i < formats.length; i++) {
          if (formats[i]) {
            await client.query(
              `INSERT INTO service_formats (id, service_id, format, display_order)
               VALUES ($1, $2, $3, $4)`,
              [uuidv4(), id, formats[i], i]
            );
          }
        }
      }

      // Insert updated colors
      if (colors && Array.isArray(colors)) {
        for (let i = 0; i < colors.length; i++) {
          if (colors[i]) {
            await client.query(
              `INSERT INTO service_colors (id, service_id, color, display_order)
               VALUES ($1, $2, $3, $4)`,
              [uuidv4(), id, colors[i], i]
            );
          }
        }
      }

      // Insert updated FAQs
      if (faqs && Array.isArray(faqs)) {
        for (let i = 0; i < faqs.length; i++) {
          const faq = faqs[i];
          if (faq && faq.question && faq.answer) {
            await client.query(
              `INSERT INTO service_faqs (id, service_id, question, answer, display_order)
               VALUES ($1, $2, $3, $4, $5)`,
              [uuidv4(), id, faq.question, faq.answer, i]
            );
          }
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
        message: 'Failed to update service',
        error: error.message
      });
    } finally {
      client.release();
    }
  },

  // Delete service
  async deleteService(req, res) {
    const client = await require('../config/database').pool.connect();
    
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
      const result = await client.query(
        'DELETE FROM services WHERE id = $1 RETURNING id',
        [id]
      );

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
  },

  // Toggle service status
  async toggleServiceStatus(req, res) {
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
  },

  // Bulk update display order
  async reorderServices(req, res) {
    const client = await require('../config/database').pool.connect();
    
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
  },

  // Get service stats
  async getServiceStats(req, res) {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
          COUNT(CASE WHEN is_featured = true THEN 1 END) as featured,
          COUNT(CASE WHEN is_popular = true THEN 1 END) as popular,
          COUNT(CASE WHEN is_new = true THEN 1 END) as new,
          COUNT(DISTINCT category) as categories
        FROM services
      `);

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching service stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch service stats'
      });
    }
  },

  // Get services by category
  async getServicesByCategory(req, res) {
    try {
      const { category } = req.params;

      const result = await query(
        `SELECT 
          s.id, s.title, s.slug, s.short_description, s.icon_name,
          s.gradient_from, s.gradient_to, s.badge, s.price_range,
          s.is_featured, s.is_popular, s.is_new
        FROM services s
        WHERE s.category = $1 AND s.status = 'active'
        ORDER BY s.display_order ASC, s.created_at DESC`,
        [category]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching services by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch services'
      });
    }
  },

  // Get featured services
  async getFeaturedServices(req, res) {
    try {
      const { limit = 6 } = req.query;

      const result = await query(
        `SELECT 
          s.id, s.title, s.slug, s.short_description, s.icon_name,
          s.gradient_from, s.gradient_to, s.badge, s.price_range,
          c.name as category_name
        FROM services s
        LEFT JOIN service_categories c ON s.category = c.slug
        WHERE s.is_featured = true AND s.status = 'active'
        ORDER BY s.display_order ASC
        LIMIT $1`,
        [parseInt(limit)]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching featured services:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch featured services'
      });
    }
  },

  // Search services
  async searchServices(req, res) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q) {
        return res.json({
          success: true,
          data: []
        });
      }

      const result = await query(
        `SELECT 
          s.id, s.title, s.slug, s.short_description, s.icon_name,
          s.price_range, s.category,
          c.name as category_name
        FROM services s
        LEFT JOIN service_categories c ON s.category = c.slug
        WHERE s.status = 'active' 
          AND (s.title ILIKE $1 OR s.short_description ILIKE $1 OR s.full_description ILIKE $1)
        ORDER BY 
          CASE 
            WHEN s.title ILIKE $2 THEN 1
            WHEN s.short_description ILIKE $3 THEN 2
            ELSE 3
          END,
          s.is_featured DESC,
          s.display_order ASC
        LIMIT $4`,
        [`%${q}%`, `${q}%`, `%${q}%`, parseInt(limit)]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error searching services:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search services'
      });
    }
  },

  // Clone service
  async cloneService(req, res) {
    const client = await require('../config/database').pool.connect();
    
    try {
      await client.query('BEGIN');

      const { id } = req.params;
      const userId = req.user?.id;

      // Get original service
      const original = await client.query(
        'SELECT * FROM services WHERE id = $1',
        [id]
      );

      if (original.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      const service = original.rows[0];
      const newId = uuidv4();
      const newSlug = `${service.slug}-copy-${Date.now()}`;
      const newCode = `SRV-${Date.now()}`;

      // Clone main service
      await client.query(
        `INSERT INTO services (
          id, service_code, title, slug, short_description, full_description,
          icon_name, gradient_from, gradient_to, badge, category, subcategory,
          price_range, min_order, turnaround, is_featured, is_popular, is_new,
          display_order, status, seo_title, seo_description, seo_keywords,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
        [newId, newCode, `${service.title} (Copy)`, newSlug, service.short_description, service.full_description,
         service.icon_name, service.gradient_from, service.gradient_to, service.badge, service.category, service.subcategory,
         service.price_range, service.min_order, service.turnaround, false, false, false,
         999, 'inactive', service.seo_title, service.seo_description, service.seo_keywords,
         userId]
      );

      // Clone features
      const features = await client.query(
        'SELECT feature, display_order FROM service_features WHERE service_id = $1',
        [id]
      );
      for (const row of features.rows) {
        await client.query(
          'INSERT INTO service_features (id, service_id, feature, display_order) VALUES ($1, $2, $3, $4)',
          [uuidv4(), newId, row.feature, row.display_order]
        );
      }

      // Clone applications
      const applications = await client.query(
        'SELECT application, display_order FROM service_applications WHERE service_id = $1',
        [id]
      );
      for (const row of applications.rows) {
        await client.query(
          'INSERT INTO service_applications (id, service_id, application, display_order) VALUES ($1, $2, $3, $4)',
          [uuidv4(), newId, row.application, row.display_order]
        );
      }

      // Clone process steps
      const steps = await client.query(
        'SELECT step_number, title, description, icon_name, display_order FROM service_process_steps WHERE service_id = $1',
        [id]
      );
      for (const row of steps.rows) {
        await client.query(
          `INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uuidv4(), newId, row.step_number, row.title, row.description, row.icon_name, row.display_order]
        );
      }

      // Clone specifications
      const specs = await client.query(
        'SELECT label, value, display_order FROM service_specs WHERE service_id = $1',
        [id]
      );
      for (const row of specs.rows) {
        await client.query(
          'INSERT INTO service_specs (id, service_id, label, value, display_order) VALUES ($1, $2, $3, $4, $5)',
          [uuidv4(), newId, row.label, row.value, row.display_order]
        );
      }

      // Clone materials
      const materials = await client.query(
        'SELECT material, display_order FROM service_materials WHERE service_id = $1',
        [id]
      );
      for (const row of materials.rows) {
        await client.query(
          'INSERT INTO service_materials (id, service_id, material, display_order) VALUES ($1, $2, $3, $4)',
          [uuidv4(), newId, row.material, row.display_order]
        );
      }

      // Clone formats
      const formats = await client.query(
        'SELECT format, display_order FROM service_formats WHERE service_id = $1',
        [id]
      );
      for (const row of formats.rows) {
        await client.query(
          'INSERT INTO service_formats (id, service_id, format, display_order) VALUES ($1, $2, $3, $4)',
          [uuidv4(), newId, row.format, row.display_order]
        );
      }

      // Clone colors
      const colors = await client.query(
        'SELECT color, display_order FROM service_colors WHERE service_id = $1',
        [id]
      );
      for (const row of colors.rows) {
        await client.query(
          'INSERT INTO service_colors (id, service_id, color, display_order) VALUES ($1, $2, $3, $4)',
          [uuidv4(), newId, row.color, row.display_order]
        );
      }

      // Clone FAQs
      const faqs = await client.query(
        'SELECT question, answer, display_order FROM service_faqs WHERE service_id = $1',
        [id]
      );
      for (const row of faqs.rows) {
        await client.query(
          'INSERT INTO service_faqs (id, service_id, question, answer, display_order) VALUES ($1, $2, $3, $4, $5)',
          [uuidv4(), newId, row.question, row.answer, row.display_order]
        );
      }

      // Clone images (copy files)
      const images = await client.query(
        'SELECT image_path, thumbnail_path, alt_text FROM service_images WHERE service_id = $1 ORDER BY display_order',
        [id]
      );
      
      for (let i = 0; i < images.rows.length; i++) {
        const img = images.rows[i];
        
        // Generate new filenames
        const ext = path.extname(img.image_path);
        const newFilename = `service-${newId}-${i}${ext}`;
        const newPath = path.join('uploads', 'services', newFilename);
        const newThumbFilename = `thumb-${newFilename}`;
        const newThumbPath = path.join('uploads', 'services', 'thumbnails', newThumbFilename);
        
        // Copy original file
        if (fs.existsSync(img.image_path)) {
          fs.copyFileSync(img.image_path, newPath);
        }
        
        // Copy or recreate thumbnail
        if (img.thumbnail_path && fs.existsSync(img.thumbnail_path)) {
          fs.copyFileSync(img.thumbnail_path, newThumbPath);
        } else if (fs.existsSync(img.image_path)) {
          // Create new thumbnail
          await sharp(img.image_path)
            .resize(300, 300, { fit: 'cover' })
            .toFile(newThumbPath);
        }
        
        await client.query(
          `INSERT INTO service_images (id, service_id, image_path, thumbnail_path, alt_text, is_primary, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uuidv4(), newId, newPath, newThumbPath, img.alt_text || `Image ${i + 1}`, i === 0, i]
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Service cloned successfully',
        data: { id: newId }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error cloning service:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clone service'
      });
    } finally {
      client.release();
    }
  }
};

module.exports = serviceController;