const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'foodie_db',
  waitForConnections: true,
  connectionLimit: 10
});

// Test database connection
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
  });

// ============= CRUD ROUTES =============

// GET all foods
app.get('/api/foods', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM foods ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single food by ID
app.get('/api/foods/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM foods WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Food not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE new food
app.post('/api/foods', async (req, res) => {
  try {
    const { name, category, price, description, image, inStock } = req.body;
    const [result] = await pool.query(
      'INSERT INTO foods (name, category, price, description, image, inStock) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, price, description, image || '🍽️', inStock !== false]
    );
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      category, 
      price, 
      description, 
      image, 
      inStock 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE food
app.put('/api/foods/:id', async (req, res) => {
  try {
    const { name, category, price, description, image, inStock } = req.body;
    const [result] = await pool.query(
      'UPDATE foods SET name = ?, category = ?, price = ?, description = ?, image = ?, inStock = ? WHERE id = ?',
      [name, category, price, description, image, inStock, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Food not found' });
    }
    res.json({ id: req.params.id, name, category, price, description, image, inStock });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE food
app.delete('/api/foods/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM foods WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Food not found' });
    }
    res.json({ message: 'Food deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SEARCH foods
app.get('/api/foods/search/:query', async (req, res) => {
  try {
    const query = `%${req.params.query}%`;
    const [rows] = await pool.query(
      'SELECT * FROM foods WHERE name LIKE ? OR category LIKE ?',
      [query, query]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});