const express = require('express');
const router = express.Router();
const serviceController = require('../../controllers/serviceController');

// Get all active services (public)
router.get('/', async (req, res) => {
  try {
    const { category, featured, limit = 50 } = req.query;
    
    let whereConditions = ['s.status = $1'];
    let params = ['active'];
    let paramIndex = 2;
    
    if (category) {
      whereConditions.push(`s.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }
    
    if (featured === 'true') {
      whereConditions.push('s.is_featured = true');
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    const result = await require('../../config/database').query(
      `SELECT 
        s.id, s.title, s.slug, s.short_description, s.icon_name,
        s.gradient_from, s.gradient_to, s.badge, s.category, s.price_range,
        s.is_featured, s.is_popular, s.is_new,
        c.name as category_name, c.icon_name as category_icon
      FROM services s
      LEFT JOIN service_categories c ON s.category = c.slug
      WHERE ${whereClause}
      ORDER BY s.display_order ASC, s.created_at DESC
      LIMIT $${paramIndex}`,
      [...params, parseInt(limit)]
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching public services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
});

// Get service by slug
router.get('/:slug', serviceController.getServiceBySlug);

// Get all categories
router.get('/categories/all', async (req, res) => {
  try {
    const result = await require('../../config/database').query(
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

// Get featured services (public)
router.get('/featured/list', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const result = await require('../../config/database').query(
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
});

// Search services (public)
router.get('/search/query', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.json({
        success: true,
        data: []
      });
    }

    const result = await require('../../config/database').query(
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
});

module.exports = router;