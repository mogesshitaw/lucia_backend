// backend/src/routes/customers.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// ሁሉም routes authentication ይፈልጋሉ
router.use(authenticate);

// ሁሉንም ደንበኞች ማግኘት
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    const pool = require('../db/connection').getPool();
    
    let query = `
      SELECT c.*, 
             COUNT(o.id) as total_orders,
             COALESCE(SUM(o.total_price), 0) as total_spent
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
    `;
    
    const params = [];
    
    if (search) {
      query += ` WHERE c.name ILIKE $1 OR c.phone ILIKE $1 OR c.username ILIKE $1`;
      params.push(`%${search}%`);
    }
    
    query += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    res.json({ 
      success: true, 
      customers: result.rows,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// አንድ ደንበኛ ማግኘት
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = require('../db/connection').getPool();
    
    const result = await pool.query(`
      SELECT c.*, 
             COUNT(o.id) as total_orders,
             COALESCE(SUM(o.total_price), 0) as total_spent,
             json_agg(
               json_build_object(
                 'id', o.id,
                 'order_number', o.order_number,
                 'status', o.status,
                 'total_price', o.total_price,
                 'created_at', o.created_at
               ) ORDER BY o.created_at DESC
             ) as orders
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    res.json({ success: true, customer: result.rows[0] });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// አዲስ ደንበኛ መፍጠር
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, address, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    
    const pool = require('../db/connection').getPool();
    
    const result = await pool.query(`
      INSERT INTO customers (name, phone, email, address, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, phone, email, address, notes]);
    
    res.json({ success: true, customer: result.rows[0] });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ደንበኛ ማዘመን
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, notes } = req.body;
    
    const pool = require('../db/connection').getPool();
    
    const result = await pool.query(`
      UPDATE customers 
      SET name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          email = COALESCE($3, email),
          address = COALESCE($4, address),
          notes = COALESCE($5, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [name, phone, email, address, notes, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    res.json({ success: true, customer: result.rows[0] });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ደንበኛ መሰረዝ
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = require('../db/connection').getPool();
    
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;