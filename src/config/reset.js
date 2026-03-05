const { pool } = require('./database');
const createTables = require('./migrate'); // This now imports the function directly
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const resetDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database reset...');
    console.log('=============================================');
    
    await client.query('BEGIN');
    
    console.log('📦 Dropping all tables...');
    
    // Disable triggers temporarily to avoid foreign key issues during drop
    await client.query('SET session_replication_role = replica;');
    
    // Get all table names and drop them dynamically
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    
    for (const table of tables.rows) {
      await client.query(`DROP TABLE IF EXISTS ${table.tablename} CASCADE;`);
      console.log(`  ✅ Dropped ${table.tablename}`);
    }
    
    // Drop sequences
    const sequences = await client.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public';
    `);
    
    for (const seq of sequences.rows) {
      await client.query(`DROP SEQUENCE IF EXISTS ${seq.sequence_name} CASCADE;`);
      console.log(`  ✅ Dropped sequence ${seq.sequence_name}`);
    }
    
    // Drop ENUM types
    const enums = await client.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      AND typnamespace = 'public'::regnamespace;
    `);
    
    for (const enum_type of enums.rows) {
      await client.query(`DROP TYPE IF EXISTS ${enum_type.typname} CASCADE;`);
      console.log(`  ✅ Dropped ENUM ${enum_type.typname}`);
    }
    
    // Re-enable triggers
    await client.query('SET session_replication_role = DEFAULT;');
    
    await client.query('COMMIT');
    console.log('\n✅ All database objects dropped successfully');
    
    // Recreate tables
    console.log('\n📦 Creating new tables...');
    await createTables(); // This now properly awaits the async function
    
    console.log('\n=============================================');
    console.log('✅ Database reset completed successfully!');
    console.log('=============================================');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run if called directly
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('\n✨ Reset completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Reset failed:', error);
      process.exit(1);
    });
}

module.exports = resetDatabase;