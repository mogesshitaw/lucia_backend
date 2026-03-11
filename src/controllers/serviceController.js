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
      `SELECT 
        c.*,
        COUNT(s.id) as service_count
      FROM service_categories c
      LEFT JOIN services s ON c.slug = s.category AND s.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name ASC`
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
      `SELECT 
        c.*,
        COUNT(s.id) as service_count
      FROM service_categories c
      LEFT JOIN services s ON c.slug = s.category AND s.deleted_at IS NULL
      WHERE c.id = $1
      GROUP BY c.id`,
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
      `SELECT COUNT(*) FROM services 
       WHERE category = (SELECT slug FROM service_categories WHERE id = $1)
       AND deleted_at IS NULL`,
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

// Bulk update display order
async reorderCategories(req, res) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { orders } = req.body; // Array of { id, display_order }

    for (const item of orders) {
      await client.query(
        'UPDATE service_categories SET display_order = $2 WHERE id = $1',
        [item.id, item.display_order]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Categories reordered successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error reordering categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder categories'
    });
  } finally {
    client.release();
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
 // Create new service
async  createService(req, res) {
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
    
    console.log('Received create data:', req.body);

    // Parse JSON strings to arrays
    const parseJSONArray = (field, defaultValue = []) => {
      if (!field) return defaultValue;
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : defaultValue;
        } catch (e) {
          console.log(`Failed to parse ${field}:`, e);
          return defaultValue;
        }
      }
      return defaultValue;
    };

    // Parse all array fields
    const parsedFeatures = parseJSONArray(features);
    const parsedApplications = parseJSONArray(applications);
    const parsedProcessSteps = parseJSONArray(process_steps);
    const parsedSpecifications = parseJSONArray(specifications);
    const parsedMaterials = parseJSONArray(materials);
    const parsedFormats = parseJSONArray(formats);
    const parsedColors = parseJSONArray(colors);
    const parsedFaqs = parseJSONArray(faqs);

    console.log('Parsed features:', parsedFeatures);
    console.log('Parsed applications:', parsedApplications);
    console.log('Parsed process steps:', parsedProcessSteps);
    console.log('Parsed specifications:', parsedSpecifications);
    console.log('Parsed materials:', parsedMaterials);
    console.log('Parsed formats:', parsedFormats);
    console.log('Parsed colors:', parsedColors);
    console.log('Parsed faqs:', parsedFaqs);

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

    // Insert features (using parsed array)
    if (parsedFeatures && parsedFeatures.length > 0) {
      for (let i = 0; i < parsedFeatures.length; i++) {
        const feature = parsedFeatures[i];
        // Handle both string features and object features
        if (feature) {
          const featureValue = typeof feature === 'string' ? feature : feature.feature || feature.value;
          if (featureValue && featureValue.trim() !== '') {
            await client.query(
              `INSERT INTO service_features (id, service_id, feature, display_order)
               VALUES ($1, $2, $3, $4)`,
              [uuidv4(), serviceId, featureValue.trim(), i]
            );
          }
        }
      }
    }

    // Insert applications (using parsed array)
    if (parsedApplications && parsedApplications.length > 0) {
      for (let i = 0; i < parsedApplications.length; i++) {
        const app = parsedApplications[i];
        const appValue = typeof app === 'string' ? app : app.application || app.value;
        if (appValue && appValue.trim() !== '') {
          await client.query(
            `INSERT INTO service_applications (id, service_id, application, display_order)
             VALUES ($1, $2, $3, $4)`,
            [uuidv4(), serviceId, appValue.trim(), i]
          );
        }
      }
    }

    // Insert process steps (using parsed array)
    if (parsedProcessSteps && parsedProcessSteps.length > 0) {
      for (let i = 0; i < parsedProcessSteps.length; i++) {
        const step = parsedProcessSteps[i];
        if (step && step.title && step.title.trim() !== '') {
          await client.query(
            `INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [uuidv4(), serviceId, step.step_number || i + 1, step.title.trim(), step.description || '', step.icon_name || 'Printer', i]
          );
        }
      }
    }

    // Insert specifications (using parsed array)
    if (parsedSpecifications && parsedSpecifications.length > 0) {
      for (let i = 0; i < parsedSpecifications.length; i++) {
        const spec = parsedSpecifications[i];
        if (spec && spec.label && spec.label.trim() !== '' && spec.value && spec.value.trim() !== '') {
          await client.query(
            `INSERT INTO service_specs (id, service_id, label, value, display_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [uuidv4(), serviceId, spec.label.trim(), spec.value.trim(), i]
          );
        }
      }
    }

    // Insert materials (using parsed array)
    if (parsedMaterials && parsedMaterials.length > 0) {
      for (let i = 0; i < parsedMaterials.length; i++) {
        const material = parsedMaterials[i];
        const materialValue = typeof material === 'string' ? material : material.material || material.value;
        if (materialValue && materialValue.trim() !== '') {
          await client.query(
            `INSERT INTO service_materials (id, service_id, material, display_order)
             VALUES ($1, $2, $3, $4)`,
            [uuidv4(), serviceId, materialValue.trim(), i]
          );
        }
      }
    }

    // Insert formats (using parsed array)
    if (parsedFormats && parsedFormats.length > 0) {
      for (let i = 0; i < parsedFormats.length; i++) {
        const format = parsedFormats[i];
        const formatValue = typeof format === 'string' ? format : format.format || format.value;
        if (formatValue && formatValue.trim() !== '') {
          await client.query(
            `INSERT INTO service_formats (id, service_id, format, display_order)
             VALUES ($1, $2, $3, $4)`,
            [uuidv4(), serviceId, formatValue.trim(), i]
          );
        }
      }
    }

    // Insert colors (using parsed array)
    if (parsedColors && parsedColors.length > 0) {
      for (let i = 0; i < parsedColors.length; i++) {
        const color = parsedColors[i];
        const colorValue = typeof color === 'string' ? color : color.color || color.value;
        if (colorValue && colorValue.trim() !== '') {
          await client.query(
            `INSERT INTO service_colors (id, service_id, color, display_order)
             VALUES ($1, $2, $3, $4)`,
            [uuidv4(), serviceId, colorValue.trim(), i]
          );
        }
      }
    }

    // Insert FAQs (using parsed array)
    if (parsedFaqs && parsedFaqs.length > 0) {
      for (let i = 0; i < parsedFaqs.length; i++) {
        const faq = parsedFaqs[i];
        if (faq && faq.question && faq.question.trim() !== '' && faq.answer && faq.answer.trim() !== '') {
          await client.query(
            `INSERT INTO service_faqs (id, service_id, question, answer, display_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [uuidv4(), serviceId, faq.question.trim(), faq.answer.trim(), i]
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

    // Fetch and return the created service with all relations
    const createdService = await client.query(
      `SELECT s.*, 
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', sf.id,
            'feature', sf.feature,
            'display_order', sf.display_order
          ) ORDER BY sf.display_order) 
           FROM service_features sf WHERE sf.service_id = s.id
          ), '[]'::json
        ) as features,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', sa.id,
            'application', sa.application,
            'display_order', sa.display_order
          ) ORDER BY sa.display_order) 
           FROM service_applications sa WHERE sa.service_id = s.id
          ), '[]'::json
        ) as applications,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', sp.id,
            'step_number', sp.step_number,
            'title', sp.title,
            'description', sp.description,
            'icon_name', sp.icon_name,
            'display_order', sp.display_order
          ) ORDER BY sp.display_order) 
           FROM service_process_steps sp WHERE sp.service_id = s.id
          ), '[]'::json
        ) as process_steps,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', ss.id,
            'label', ss.label,
            'value', ss.value,
            'display_order', ss.display_order
          ) ORDER BY ss.display_order) 
           FROM service_specs ss WHERE ss.service_id = s.id
          ), '[]'::json
        ) as specifications,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', sm.id,
            'material', sm.material,
            'display_order', sm.display_order
          ) ORDER BY sm.display_order) 
           FROM service_materials sm WHERE sm.service_id = s.id
          ), '[]'::json
        ) as materials,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', sf2.id,
            'format', sf2.format,
            'display_order', sf2.display_order
          ) ORDER BY sf2.display_order) 
           FROM service_formats sf2 WHERE sf2.service_id = s.id
          ), '[]'::json
        ) as formats,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', sc.id,
            'color', sc.color,
            'display_order', sc.display_order
          ) ORDER BY sc.display_order) 
           FROM service_colors sc WHERE sc.service_id = s.id
          ), '[]'::json
        ) as colors,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', sf3.id,
            'question', sf3.question,
            'answer', sf3.answer,
            'display_order', sf3.display_order
          ) ORDER BY sf3.display_order) 
           FROM service_faqs sf3 WHERE sf3.service_id = s.id
          ), '[]'::json
        ) as faqs,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', si.id,
            'image_path', si.image_path,
            'thumbnail_path', si.thumbnail_path,
            'alt_text', si.alt_text,
            'is_primary', si.is_primary,
            'display_order', si.display_order
          ) ORDER BY si.display_order) 
           FROM service_images si WHERE si.service_id = s.id
          ), '[]'::json
        ) as gallery
       FROM services s
       WHERE s.id = $1`,
      [serviceId]
    );

    res.json({
      success: true,
      message: 'Service created successfully',
      data: createdService.rows[0]
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
async  updateService(req, res) {
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

    console.log('Received update data:', req.body);

    // Parse JSON strings to arrays
    const parseJSONArray = (field, defaultValue = []) => {
      if (!field) return defaultValue;
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : defaultValue;
        } catch (e) {
          console.log(`Failed to parse ${field}:`, e);
          return defaultValue;
        }
      }
      return defaultValue;
    };

    // Parse all array fields
    const parsedFeatures = parseJSONArray(features);
    const parsedApplications = parseJSONArray(applications);
    const parsedProcessSteps = parseJSONArray(process_steps);
    const parsedSpecifications = parseJSONArray(specifications);
    const parsedMaterials = parseJSONArray(materials);
    const parsedFormats = parseJSONArray(formats);
    const parsedColors = parseJSONArray(colors);
    const parsedFaqs = parseJSONArray(faqs);
    const parsedDeletedImages = parseJSONArray(deleted_images);

    console.log('Parsed features:', parsedFeatures);
    console.log('Parsed applications:', parsedApplications);
    console.log('Parsed process steps:', parsedProcessSteps);

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

    // ============ HANDLE FEATURES ============
    // Get existing features
    const existingFeatures = await client.query(
      'SELECT id, feature FROM service_features WHERE service_id = $1',
      [id]
    );
    
    const existingFeatureMap = new Map(
      existingFeatures.rows.map(f => [f.feature, f])
    );
    
    const featuresToUpdate = [];
    const featuresToInsert = [];
    
    // Process incoming features
    for (let i = 0; i < parsedFeatures.length; i++) {
      const feature = parsedFeatures[i];
      if (!feature || typeof feature !== 'string' || feature.trim() === '') continue;
      
      const trimmedFeature = feature.trim();
      
      if (existingFeatureMap.has(trimmedFeature)) {
        // Feature exists - update display_order
        const existing = existingFeatureMap.get(trimmedFeature);
        if (existing.display_order !== i) {
          await client.query(
            'UPDATE service_features SET display_order = $1 WHERE id = $2',
            [i, existing.id]
          );
        }
        existingFeatureMap.delete(trimmedFeature);
      } else {
        // New feature
        featuresToInsert.push({ feature: trimmedFeature, display_order: i });
      }
    }
    
    // Delete features that are no longer present
    const featuresToDelete = Array.from(existingFeatureMap.values());
    if (featuresToDelete.length > 0) {
      const featureIds = featuresToDelete.map(f => f.id);
      await client.query(
        'DELETE FROM service_features WHERE id = ANY($1::uuid[])',
        [featureIds]
      );
    }
    
    // Insert new features
    for (const feat of featuresToInsert) {
      await client.query(
        `INSERT INTO service_features (id, service_id, feature, display_order)
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), id, feat.feature, feat.display_order]
      );
    }

    // ============ HANDLE APPLICATIONS ============
    const existingApps = await client.query(
      'SELECT id, application FROM service_applications WHERE service_id = $1',
      [id]
    );
    
    const existingAppMap = new Map(
      existingApps.rows.map(a => [a.application, a])
    );
    
    const appsToInsert = [];
    
    for (let i = 0; i < parsedApplications.length; i++) {
      const app = parsedApplications[i];
      if (!app || typeof app !== 'string' || app.trim() === '') continue;
      
      const trimmedApp = app.trim();
      
      if (existingAppMap.has(trimmedApp)) {
        const existing = existingAppMap.get(trimmedApp);
        if (existing.display_order !== i) {
          await client.query(
            'UPDATE service_applications SET display_order = $1 WHERE id = $2',
            [i, existing.id]
          );
        }
        existingAppMap.delete(trimmedApp);
      } else {
        appsToInsert.push({ application: trimmedApp, display_order: i });
      }
    }
    
    const appsToDelete = Array.from(existingAppMap.values());
    if (appsToDelete.length > 0) {
      const appIds = appsToDelete.map(a => a.id);
      await client.query(
        'DELETE FROM service_applications WHERE id = ANY($1::uuid[])',
        [appIds]
      );
    }
    
    for (const app of appsToInsert) {
      await client.query(
        `INSERT INTO service_applications (id, service_id, application, display_order)
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), id, app.application, app.display_order]
      );
    }

    // ============ HANDLE PROCESS STEPS ============
    const existingSteps = await client.query(
      'SELECT id, title, description, icon_name, display_order FROM service_process_steps WHERE service_id = $1',
      [id]
    );
    
    // Create a map using a composite key of title+description (or just title if that's unique enough)
    const existingStepMap = new Map();
    existingSteps.rows.forEach(step => {
      // Use title as key (assuming title is unique per service)
      existingStepMap.set(step.title, step);
    });
    
    const stepsToInsert = [];
    
    for (let i = 0; i < parsedProcessSteps.length; i++) {
      const step = parsedProcessSteps[i];
      if (!step || !step.title || step.title.trim() === '') continue;
      
      const trimmedTitle = step.title.trim();
      const description = step.description || '';
      const icon_name = step.icon_name || 'Printer';
      
      if (existingStepMap.has(trimmedTitle)) {
        const existing = existingStepMap.get(trimmedTitle);
        // Update if anything changed
        if (existing.description !== description || 
            existing.icon_name !== icon_name || 
            existing.display_order !== i) {
          await client.query(
            `UPDATE service_process_steps 
             SET description = $1, icon_name = $2, display_order = $3
             WHERE id = $4`,
            [description, icon_name, i, existing.id]
          );
        }
        existingStepMap.delete(trimmedTitle);
      } else {
        stepsToInsert.push({
          step_number: i + 1,
          title: trimmedTitle,
          description,
          icon_name,
          display_order: i
        });
      }
    }
    
    // Delete steps that are no longer present
    const stepsToDelete = Array.from(existingStepMap.values());
    if (stepsToDelete.length > 0) {
      const stepIds = stepsToDelete.map(s => s.id);
      await client.query(
        'DELETE FROM service_process_steps WHERE id = ANY($1::uuid[])',
        [stepIds]
      );
    }
    
    // Insert new steps
    for (const step of stepsToInsert) {
      await client.query(
        `INSERT INTO service_process_steps (id, service_id, step_number, title, description, icon_name, display_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [uuidv4(), id, step.step_number, step.title, step.description, step.icon_name, step.display_order]
      );
    }

    // ============ HANDLE SPECIFICATIONS ============
    const existingSpecs = await client.query(
      'SELECT id, label, value, display_order FROM service_specs WHERE service_id = $1',
      [id]
    );
    
    const existingSpecMap = new Map();
    existingSpecs.rows.forEach(spec => {
      existingSpecMap.set(spec.label, spec);
    });
    
    const specsToInsert = [];
    
    for (let i = 0; i < parsedSpecifications.length; i++) {
      const spec = parsedSpecifications[i];
      if (!spec || !spec.label || spec.label.trim() === '' || !spec.value || spec.value.trim() === '') continue;
      
      const trimmedLabel = spec.label.trim();
      const value = spec.value.trim();
      
      if (existingSpecMap.has(trimmedLabel)) {
        const existing = existingSpecMap.get(trimmedLabel);
        if (existing.value !== value || existing.display_order !== i) {
          await client.query(
            `UPDATE service_specs SET value = $1, display_order = $2 WHERE id = $3`,
            [value, i, existing.id]
          );
        }
        existingSpecMap.delete(trimmedLabel);
      } else {
        specsToInsert.push({
          label: trimmedLabel,
          value,
          display_order: i
        });
      }
    }
    
    const specsToDelete = Array.from(existingSpecMap.values());
    if (specsToDelete.length > 0) {
      const specIds = specsToDelete.map(s => s.id);
      await client.query(
        'DELETE FROM service_specs WHERE id = ANY($1::uuid[])',
        [specIds]
      );
    }
    
    for (const spec of specsToInsert) {
      await client.query(
        `INSERT INTO service_specs (id, service_id, label, value, display_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), id, spec.label, spec.value, spec.display_order]
      );
    }

    // ============ HANDLE MATERIALS ============
    const existingMaterials = await client.query(
      'SELECT id, material FROM service_materials WHERE service_id = $1',
      [id]
    );
    
    const existingMaterialMap = new Map(
      existingMaterials.rows.map(m => [m.material, m])
    );
    
    const materialsToInsert = [];
    
    for (let i = 0; i < parsedMaterials.length; i++) {
      const material = parsedMaterials[i];
      if (!material || typeof material !== 'string' || material.trim() === '') continue;
      
      const trimmedMaterial = material.trim();
      
      if (existingMaterialMap.has(trimmedMaterial)) {
        const existing = existingMaterialMap.get(trimmedMaterial);
        if (existing.display_order !== i) {
          await client.query(
            'UPDATE service_materials SET display_order = $1 WHERE id = $2',
            [i, existing.id]
          );
        }
        existingMaterialMap.delete(trimmedMaterial);
      } else {
        materialsToInsert.push({ material: trimmedMaterial, display_order: i });
      }
    }
    
    const materialsToDelete = Array.from(existingMaterialMap.values());
    if (materialsToDelete.length > 0) {
      const materialIds = materialsToDelete.map(m => m.id);
      await client.query(
        'DELETE FROM service_materials WHERE id = ANY($1::uuid[])',
        [materialIds]
      );
    }
    
    for (const material of materialsToInsert) {
      await client.query(
        `INSERT INTO service_materials (id, service_id, material, display_order)
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), id, material.material, material.display_order]
      );
    }

    // ============ HANDLE FORMATS ============
    const existingFormats = await client.query(
      'SELECT id, format FROM service_formats WHERE service_id = $1',
      [id]
    );
    
    const existingFormatMap = new Map(
      existingFormats.rows.map(f => [f.format, f])
    );
    
    const formatsToInsert = [];
    
    for (let i = 0; i < parsedFormats.length; i++) {
      const format = parsedFormats[i];
      if (!format || typeof format !== 'string' || format.trim() === '') continue;
      
      const trimmedFormat = format.trim();
      
      if (existingFormatMap.has(trimmedFormat)) {
        const existing = existingFormatMap.get(trimmedFormat);
        if (existing.display_order !== i) {
          await client.query(
            'UPDATE service_formats SET display_order = $1 WHERE id = $2',
            [i, existing.id]
          );
        }
        existingFormatMap.delete(trimmedFormat);
      } else {
        formatsToInsert.push({ format: trimmedFormat, display_order: i });
      }
    }
    
    const formatsToDelete = Array.from(existingFormatMap.values());
    if (formatsToDelete.length > 0) {
      const formatIds = formatsToDelete.map(f => f.id);
      await client.query(
        'DELETE FROM service_formats WHERE id = ANY($1::uuid[])',
        [formatIds]
      );
    }
    
    for (const format of formatsToInsert) {
      await client.query(
        `INSERT INTO service_formats (id, service_id, format, display_order)
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), id, format.format, format.display_order]
      );
    }

    // ============ HANDLE COLORS ============
    const existingColors = await client.query(
      'SELECT id, color FROM service_colors WHERE service_id = $1',
      [id]
    );
    
    const existingColorMap = new Map(
      existingColors.rows.map(c => [c.color, c])
    );
    
    const colorsToInsert = [];
    
    for (let i = 0; i < parsedColors.length; i++) {
      const color = parsedColors[i];
      if (!color || typeof color !== 'string' || color.trim() === '') continue;
      
      const trimmedColor = color.trim();
      
      if (existingColorMap.has(trimmedColor)) {
        const existing = existingColorMap.get(trimmedColor);
        if (existing.display_order !== i) {
          await client.query(
            'UPDATE service_colors SET display_order = $1 WHERE id = $2',
            [i, existing.id]
          );
        }
        existingColorMap.delete(trimmedColor);
      } else {
        colorsToInsert.push({ color: trimmedColor, display_order: i });
      }
    }
    
    const colorsToDelete = Array.from(existingColorMap.values());
    if (colorsToDelete.length > 0) {
      const colorIds = colorsToDelete.map(c => c.id);
      await client.query(
        'DELETE FROM service_colors WHERE id = ANY($1::uuid[])',
        [colorIds]
      );
    }
    
    for (const color of colorsToInsert) {
      await client.query(
        `INSERT INTO service_colors (id, service_id, color, display_order)
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), id, color.color, color.display_order]
      );
    }

    // ============ HANDLE FAQS ============
    const existingFaqs = await client.query(
      'SELECT id, question, answer, display_order FROM service_faqs WHERE service_id = $1',
      [id]
    );
    
    const existingFaqMap = new Map();
    existingFaqs.rows.forEach(faq => {
      existingFaqMap.set(faq.question, faq);
    });
    
    const faqsToInsert = [];
    
    for (let i = 0; i < parsedFaqs.length; i++) {
      const faq = parsedFaqs[i];
      if (!faq || !faq.question || faq.question.trim() === '' || !faq.answer || faq.answer.trim() === '') continue;
      
      const trimmedQuestion = faq.question.trim();
      const answer = faq.answer.trim();
      
      if (existingFaqMap.has(trimmedQuestion)) {
        const existing = existingFaqMap.get(trimmedQuestion);
        if (existing.answer !== answer || existing.display_order !== i) {
          await client.query(
            `UPDATE service_faqs SET answer = $1, display_order = $2 WHERE id = $3`,
            [answer, i, existing.id]
          );
        }
        existingFaqMap.delete(trimmedQuestion);
      } else {
        faqsToInsert.push({
          question: trimmedQuestion,
          answer,
          display_order: i
        });
      }
    }
    
    const faqsToDelete = Array.from(existingFaqMap.values());
    if (faqsToDelete.length > 0) {
      const faqIds = faqsToDelete.map(f => f.id);
      await client.query(
        'DELETE FROM service_faqs WHERE id = ANY($1::uuid[])',
        [faqIds]
      );
    }
    
    for (const faq of faqsToInsert) {
      await client.query(
        `INSERT INTO service_faqs (id, service_id, question, answer, display_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), id, faq.question, faq.answer, faq.display_order]
      );
    }

    // ============ HANDLE DELETED IMAGES ============
    if (parsedDeletedImages && parsedDeletedImages.length > 0) {
      for (const imageId of parsedDeletedImages) {
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

    // ============ HANDLE NEW GALLERY IMAGES ============
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

    // Fetch and return the updated service with all relations
    const updatedService = await client.query(
      `SELECT s.*, 
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', sf.id,
            'feature', sf.feature,
            'display_order', sf.display_order
          ) ORDER BY sf.display_order) 
           FROM service_features sf WHERE sf.service_id = s.id
          ), '[]'::json
        ) as features,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', sa.id,
            'application', sa.application,
            'display_order', sa.display_order
          ) ORDER BY sa.display_order) 
           FROM service_applications sa WHERE sa.service_id = s.id
          ), '[]'::json
        ) as applications,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', sp.id,
            'step_number', sp.step_number,
            'title', sp.title,
            'description', sp.description,
            'icon_name', sp.icon_name,
            'display_order', sp.display_order
          ) ORDER BY sp.display_order) 
           FROM service_process_steps sp WHERE sp.service_id = s.id
          ), '[]'::json
        ) as process_steps,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', ss.id,
            'label', ss.label,
            'value', ss.value,
            'display_order', ss.display_order
          ) ORDER BY ss.display_order) 
           FROM service_specs ss WHERE ss.service_id = s.id
          ), '[]'::json
        ) as specifications,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', sm.id,
            'material', sm.material,
            'display_order', sm.display_order
          ) ORDER BY sm.display_order) 
           FROM service_materials sm WHERE sm.service_id = s.id
          ), '[]'::json
        ) as materials,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', sf2.id,
            'format', sf2.format,
            'display_order', sf2.display_order
          ) ORDER BY sf2.display_order) 
           FROM service_formats sf2 WHERE sf2.service_id = s.id
          ), '[]'::json
        ) as formats,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', sc.id,
            'color', sc.color,
            'display_order', sc.display_order
          ) ORDER BY sc.display_order) 
           FROM service_colors sc WHERE sc.service_id = s.id
          ), '[]'::json
        ) as colors,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', sf3.id,
            'question', sf3.question,
            'answer', sf3.answer,
            'display_order', sf3.display_order
          ) ORDER BY sf3.display_order) 
           FROM service_faqs sf3 WHERE sf3.service_id = s.id
          ), '[]'::json
        ) as faqs,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', si.id,
            'image_path', si.image_path,
            'thumbnail_path', si.thumbnail_path,
            'alt_text', si.alt_text,
            'is_primary', si.is_primary,
            'display_order', si.display_order
          ) ORDER BY si.display_order) 
           FROM service_images si WHERE si.service_id = s.id
          ), '[]'::json
        ) as gallery
       FROM services s
       WHERE s.id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService.rows[0]
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