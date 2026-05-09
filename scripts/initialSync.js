// backend/scripts/initialSync.js
const { query, testConnection } = require('../src/config/database');
const telegramService = require('../src/services/telegramService');
const { Api } = require('telegram');
require('dotenv').config();

async function initialSync() {
    console.log('=== Initial Telegram Contacts Sync ===\n');
    
    try {
        // Test database connection
        console.log('📊 Testing database connection...');
        const dbConnected = await testConnection();
        if (!dbConnected) {
            throw new Error('Database connection failed');
        }
        console.log('✅ Database connected\n');
        
        // Initialize Telegram
        console.log('🤖 Initializing Telegram...');
        await telegramService.initialize();
        console.log('✅ Telegram connected\n');
        
        // Get contacts from Telegram using invoke
        console.log('📱 Fetching contacts from Telegram...');
        let contacts = [];
        try {
            const result = await telegramService.client.invoke(new Api.contacts.GetContacts({
                hash: 0
            }));
            contacts = result.users || [];
            console.log(`Found ${contacts.length} contacts\n`);
        } catch (error) {
            console.error('Error fetching contacts:', error.message);
            contacts = [];
        }
        
        let savedCount = 0;
        let updatedCount = 0;
        
        for (const contact of contacts) {
            // Extract contact info safely
            const firstName = contact.firstName || '';
            const lastName = contact.lastName || '';
            const name = `${firstName} ${lastName}`.trim() || contact.username || 'Unknown';
            const phone = contact.phone || null;
            const username = contact.username || null;
            const telegramId = contact.id ? contact.id.toString() : null;
            
            if (!telegramId) {
                console.log('⚠️ Skipping contact without ID');
                continue;
            }
            
            // Clean telegram_id - remove any quotes
            const cleanTelegramId = telegramId.replace(/["']/g, '');
            
            // Check if exists
            const existing = await query(
                'SELECT id FROM customers WHERE telegram_id = $1',
                [cleanTelegramId]
            );
            
            if (existing.rows.length === 0) {
                // Insert new contact
                await query(`
                    INSERT INTO customers (telegram_id, name, username, phone, created_at, first_order_date, last_order_date)
                    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `, [cleanTelegramId, name, username, phone]);
                savedCount++;
                console.log(`✅ Added: ${name} (${cleanTelegramId})`);
            } else {
                // Update existing contact
                await query(`
                    UPDATE customers 
                    SET name = $2, username = $3, phone = $4, updated_at = CURRENT_TIMESTAMP
                    WHERE telegram_id = $1
                `, [cleanTelegramId, name, username, phone]);
                updatedCount++;
                console.log(`🔄 Updated: ${name} (${cleanTelegramId})`);
            }
        }
        
        console.log(`\n📊 Contacts summary:`);
        console.log(`   New contacts added: ${savedCount}`);
        console.log(`   Updated contacts: ${updatedCount}`);
        console.log(`   Total contacts processed: ${contacts.length}`);
        
        // Also get dialogs (people who messaged but not in contacts)
        console.log('\n💬 Fetching dialogs...');
        let dialogs = [];
        try {
            dialogs = await telegramService.client.getDialogs({});
            console.log(`Found ${dialogs.length} dialogs\n`);
        } catch (error) {
            console.error('Error fetching dialogs:', error.message);
            dialogs = [];
        }
        
        let dialogCount = 0;
        for (const dialog of dialogs) {
            const entity = dialog.entity;
            if (entity && entity.className === 'User' && entity.id) {
                const firstName = entity.firstName || '';
                const lastName = entity.lastName || '';
                const name = `${firstName} ${lastName}`.trim() || entity.username || 'Unknown';
                const phone = entity.phone || null;
                const username = entity.username || null;
                const telegramId = entity.id ? entity.id.toString() : null;
                
                if (!telegramId) continue;
                
                const cleanTelegramId = telegramId.replace(/["']/g, '');
                
                const existing = await query(
                    'SELECT id FROM customers WHERE telegram_id = $1',
                    [cleanTelegramId]
                );
                
                if (existing.rows.length === 0) {
                    await query(`
                        INSERT INTO customers (telegram_id, name, username, phone, created_at)
                        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
                    `, [cleanTelegramId, name, username, phone]);
                    dialogCount++;
                    console.log(`✅ Added from dialog: ${name} (${cleanTelegramId})`);
                }
            }
        }
        
        console.log(`\n📊 Dialog summary:`);
        console.log(`   New contacts from dialogs: ${dialogCount}`);
        
        // Get total count
        const totalResult = await query('SELECT COUNT(*) FROM customers WHERE telegram_id IS NOT NULL');
        const totalContacts = parseInt(totalResult.rows[0].count);
        
        console.log(`\n✅ Sync completed successfully!`);
        console.log(`📊 Total contacts in database: ${totalContacts}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync failed:', error);
        console.error('Error details:', error.stack);
        process.exit(1);
    }
}

initialSync();