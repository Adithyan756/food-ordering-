const pool = require('./db');

async function testConnection() {
  try {
    console.log('Testing Aiven PostgreSQL connection...\n');
    
    const result = await pool.query('SELECT NOW(), version()');
    console.log('✅ Connection successful!');
    console.log('📅 Server time:', result.rows[0].now);
    console.log('📊 PostgreSQL version:', result.rows[0].version.split(' ')[1]);
    
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables in your database:');
    if (tables.rows.length === 0) {
      console.log('   No tables yet - database is empty');
    } else {
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
    await pool.end();
    console.log('\n✓ Connection test completed!');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    await pool.end();
    process.exit(1);
  }
}

testConnection();