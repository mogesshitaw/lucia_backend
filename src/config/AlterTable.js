// src/database/migrations/add-deleted-at-to-images.js
const { query } = require('./database');

// const addDeletedAtColumn = async () => {
//   try {
//     console.log('Adding deleted_at column to images table...');
    
    // await query(`
    //   ALTER TABLE images 
    //   ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
    // `);
  
//     console.log('✅ deleted_at column added successfully');
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Error adding deleted_at column:', error);
//     process.exit(1);
//   }
// };

// addDeletedAtColumn();

const addMissingColumns = async () => {
  try {
    console.log('Adding missing columns to images table...');
     await query(`
      ALTER TABLE images 
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
    `);
      console.log('✅ deleted_at column added successfully');

    // Add category column
    await query(`
      ALTER TABLE images 
      ADD COLUMN IF NOT EXISTS category VARCHAR(100);
    `);
    console.log('✅ category column added');

    // Add title column
    await query(`
      ALTER TABLE images 
      ADD COLUMN IF NOT EXISTS title VARCHAR(255);
    `);
    console.log('✅ title column added');

    // Add description column
    await query(`
      ALTER TABLE images 
      ADD COLUMN IF NOT EXISTS description TEXT;
    `);
    console.log('✅ description column added');

    // Add tags column if not exists (should be array)
    await query(`
      ALTER TABLE images 
      ADD COLUMN IF NOT EXISTS tags TEXT[];
    `);
    console.log('✅ tags column added');

    // Add download_count column
    await query(`
      ALTER TABLE images 
      ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
    `);
    console.log('✅ download_count column added');

    // Add print_count column
    await query(`
      ALTER TABLE images 
      ADD COLUMN IF NOT EXISTS print_count INTEGER DEFAULT 0;
    `);
    console.log('✅ print_count column added');

    // Create favorites table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(image_id, user_id)
      );
    `);
    console.log('✅ favorites table created');
 await query(`ALTER TABLE images 
ADD COLUMN IF NOT EXISTS service_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS print_size VARCHAR(100),
ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS paper_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS finish VARCHAR(100),
ADD COLUMN IF NOT EXISTS color_mode_req VARCHAR(50),
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS requires_proof BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS viewed_by_printer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS metadata JSONB;
`)

    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error adding columns:', error);
    process.exit(1);
  }
};

addMissingColumns();