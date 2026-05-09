// backend/scripts/syncAllMessagesToDb.js
const { query } = require('../src/config/database');
const telegramService = require('../src/services/telegramService');

async function syncAllMessagesToDb() {
    console.log('=== Syncing All Messages to Database ===\n');
    
    try {
        // Test database connection
        const testResult = await query('SELECT NOW()');
        console.log('✅ Database connected:', testResult.rows[0].now);
        
        await telegramService.initialize();
        console.log('✅ Telegram connected\n');
        
        // Get all customers with telegram_id
        const customers = await query(
            'SELECT id, telegram_id, name FROM customers WHERE telegram_id IS NOT NULL'
        );
        
        console.log(`Found ${customers.rows.length} customers\n`);
        
        let totalMessages = 0;
        let skippedCount = 0;
        
        for (const customer of customers.rows) {
            console.log(`Processing ${customer.name} (Telegram ID: ${customer.telegram_id})...`);
            
            try {
                // Get messages from Telegram
                const messages = await telegramService.getMessages(parseInt(customer.telegram_id), 500);
                console.log(`  Retrieved ${messages.length} messages from Telegram`);
                
                let saved = 0;
                for (const msg of messages) {
                    if (!msg || !msg.id) {
                        skippedCount++;
                        continue;
                    }
                    
                    // Check if message exists in database
                    const existing = await query(
                        'SELECT id FROM messages WHERE telegram_message_id = $1 AND chat_id = $2',
                        [msg.id, customer.telegram_id]
                    );
                    
                    if (existing.rows.length === 0) {
                        // Save message to database
                        await query(`
                            INSERT INTO messages (
                                chat_id, telegram_message_id, message_text, has_file, is_outgoing,
                                sender_name, receiver_name, created_at
                            )
                            VALUES ($1, $2, $3, $4, $5, $6, $7, to_timestamp($8))
                            ON CONFLICT (telegram_message_id) DO NOTHING
                        `, [
                            customer.telegram_id,
                            msg.id,
                            msg.text || '',
                            msg.hasFile || false,
                            msg.isOutgoing || false,
                            msg.isOutgoing ? 'እኔ (አድሚን)' : customer.name,
                            msg.isOutgoing ? customer.name : 'እኔ (አድሚን)',
                            msg.date
                        ]);
                        saved++;
                    }
                }
                
                totalMessages += saved;
                console.log(`  ✅ Saved ${saved} new messages for ${customer.name}\n`);
                
            } catch (customerError) {
                console.error(`  ❌ Error processing ${customer.name}:`, customerError.message);
                continue;
            }
        }
        
        // Get total count
        const totalResult = await query('SELECT COUNT(*) FROM messages');
        console.log(`📊 Total messages in database: ${totalResult.rows[0].count}`);
        console.log(`✅ Total new messages saved: ${totalMessages}`);
        if (skippedCount > 0) {
            console.log(`⚠️ Skipped ${skippedCount} invalid messages`);
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

syncAllMessagesToDb();