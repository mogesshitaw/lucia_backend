const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');

// Get gallery images with service details
router.get('/images', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      service_id,
      category,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    // Only show images from active services
    whereConditions.push(`s.status = 'active'`);

    if (search) {
      whereConditions.push(`(si.alt_text ILIKE $${paramIndex} OR s.title ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (service_id) {
      whereConditions.push(`si.service_id = $${paramIndex}`);
      params.push(service_id);
      paramIndex++;
    }

    if (category) {
      whereConditions.push(`s.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) 
      FROM service_images si
      JOIN services s ON si.service_id = s.id
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get images with service details
    const imagesQuery = `
      SELECT 
        si.*,
        json_build_object(
          'id', s.id,
          'title', s.title,
          'slug', s.slug,
          'category', s.category,
          'badge', s.badge,
          'icon_name', s.icon_name
        ) as service
      FROM service_images si
      JOIN services s ON si.service_id = s.id
      ${whereClause}
      ORDER BY si.${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await query(imagesQuery, [...params, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: {
        images: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery images'
    });
  }
});

// Get categories with image counts
router.get('/categories', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        s.category as value,
        sc.name as label,
        COUNT(si.id) as count
      FROM service_images si
      JOIN services s ON si.service_id = s.id
      LEFT JOIN service_categories sc ON s.category = sc.slug
      WHERE s.status = 'active'
      GROUP BY s.category, sc.name
      ORDER BY count DESC
    `);

    const categories = result.rows.map(row => ({
      ...row,
      label: row.label || row.value.split('-').map((word  ) => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }));

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// Get single image with details
router.get('/images/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        si.*,
        json_build_object(
          'id', s.id,
          'title', s.title,
          'slug', s.slug,
          'category', s.category,
          'badge', s.badge,
          'icon_name', s.icon_name,
          'short_description', s.short_description,
          'price_range', s.price_range
        ) as service
      FROM service_images si
      JOIN services s ON si.service_id = s.id
      WHERE si.id = $1 AND s.status = 'active'`,
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
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image'
    });
  }
});

// Get images by service
router.get('/services/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;

    const result = await query(
      `SELECT * FROM service_images 
       WHERE service_id = $1 
       ORDER BY is_primary DESC, display_order ASC, created_at DESC`,
      [serviceId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching service images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service images'
    });
  }
});

module.exports = router;