const pool = require('./db');

async function createFoodsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS foods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        image VARCHAR(500) DEFAULT '🍽️',
        inStock BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Foods table created successfully');
    
    // Optional: Add some sample data
    await pool.query(`
      INSERT INTO foods (name, category, price, description, image, inStock)
      VALUES 
        ('Margherita Pizza', 'Pizza', 12.99, 'Classic pizza with tomato and mozzarella', '🍕', true),
        ('Cheeseburger', 'Burgers', 9.99, 'Juicy beef burger with cheese', '🍔', true),
        ('Caesar Salad', 'Salads', 7.99, 'Fresh romaine with Caesar dressing', '🥗', true)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Sample data added');
    
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
  }
}

createFoodsTable();