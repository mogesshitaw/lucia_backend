// backend/scripts/syncContactFiles.js
const { query } = require('../src/config/database');
const telegramService = require('../src/services/telegramService');
const fs = require('fs-extra');
const path = require('path');

async function syncContactFiles() {
    const contactId = process.argv[2];
    
    if (!contactId) {
        console.log('Usage: node syncContactFiles.js <contact_id>');
        process.exit(1);
    }
    
    try {
        await query('SELECT NOW()');
        console.log('✅ Database connected');
        
        await telegramService.initialize();
        console.log('✅ Telegram connected\n');
        
        // Get contact
        const contact = await query(
            'SELECT id, telegram_id, name FROM customers WHERE id = $1',
            [contactId]
        );
        
        if (contact.rows.length === 0) {
            console.log('❌ Contact not found');
            process.exit(1);
        }
        
        const customer = contact.rows[0];
        console.log(`Processing ${customer.name}...\n`);
        
        // Get messages with files from database that don't have file_path
        const messagesWithoutFiles = await query(`
            SELECT telegram_message_id, message_text 
            FROM messages 
            WHERE chat_id = $1 AND has_file = true AND file_path IS NULL
        `, [customer.telegram_id]);
        
        console.log(`Found ${messagesWithoutFiles.rows.length} messages with missing files\n`);
        
        let restored = 0;
        
        for (const msg of messagesWithoutFiles.rows) {
            console.log(`Restoring file for message ${msg.telegram_message_id}...`);
            
            try {
                // Get full message from Telegram
                const teleMessages = await telegramService.getMessages(parseInt(customer.telegram_id), 1);
                const teleMsg = teleMessages.find(m => m.id === parseInt(msg.telegram_message_id));
                
                if (teleMsg && teleMsg.hasFile && teleMsg.media) {
                    // Download file
                    const customerDir = path.join(telegramService.uploadsDir, 'files', `customer_${customer.id}`);
                    await fs.ensureDir(customerDir);
                    
                    const ext = getFileExtension(teleMsg);
                    const fileName = `${teleMsg.id}_${Date.now()}${ext}`;
                    const filePath = path.join(customerDir, fileName);
                    
                    await telegramService.client.downloadMedia(teleMsg.media, {
                        outputFile: filePath
                    });
                    
                    const stats = await fs.stat(filePath);
                    
                    // Update database
                    await query(`
                        UPDATE messages 
                        SET file_path = $1, file_name = $2, file_size = $3, mime_type = $4
                        WHERE telegram_message_id = $5 AND chat_id = $6
                    `, [
                        `uploads/files/customer_${customer.id}/${fileName}`,
                        fileName,
                        stats.size,
                        teleMsg.media.mimeType || 'application/octet-stream',
                        teleMsg.id,
                        customer.telegram_id
                    ]);
                    
                    console.log(`  ✅ File restored: ${fileName}`);
                    restored++;
                }
            } catch (err) {
                console.error(`  ❌ Error restoring file:`, err.message);
            }
        }
        
        console.log(`\n✅ Restored ${restored} files for ${customer.name}`);
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    }
}

function getFileExtension(message) {
    if (message.media.className === 'MessageMediaPhoto') return '.jpg';
    if (message.media.className === 'MessageMediaDocument') {
        const mimeType = message.media.document?.mimeType;
        if (mimeType === 'application/pdf') return '.pdf';
        if (mimeType?.includes('image/png')) return '.png';
        return '.bin';
    }
    return '.bin';
}

syncContactFiles();