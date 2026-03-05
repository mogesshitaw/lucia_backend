const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const createDatabase = async () => {
  // Connect to default postgres database
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default database
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    console.log('Attempting to create database...');
    
    // Check if database exists
    const checkDb = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'lucia_printing']
    );

    if (checkDb.rows.length === 0) {
      // Create database
      await pool.query(`CREATE DATABASE ${process.env.DB_NAME || 'lucia_printing'}`);
      console.log(`✅ Database '${process.env.DB_NAME || 'lucia_printing'}' created successfully`);
    } else {
      console.log(`ℹ️ Database '${process.env.DB_NAME || 'lucia_printing'}' already exists`);
    }
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run if called directly
if (require.main === module) {
  createDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Database creation failed:', error);
      process.exit(1);
    });
}

module.exports = createDatabase;