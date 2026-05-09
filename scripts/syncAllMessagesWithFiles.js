// backend/scripts/syncAllMessagesWithFiles.js
const { query } = require('../src/config/database');
const telegramService = require('../src/services/telegramService');
const fs = require('fs-extra');
const path = require('path');

async function syncAllMessagesWithFiles() {
    console.log('=== Syncing All Messages with Files ===\n');
    
    try {
        // Test database connection
        await query('SELECT NOW()');
        console.log('✅ Database connected');
        
        await telegramService.initialize();
        console.log('✅ Telegram connected\n');
        
        // Get all customers
        const customers = await query(
            'SELECT id, telegram_id, name FROM customers WHERE telegram_id IS NOT NULL'
        );
        
        console.log(`Found ${customers.rows.length} customers\n`);
        
        let totalMessages = 0;
        let totalFiles = 0;
        
        for (const customer of customers.rows) {
            console.log(`Processing ${customer.name} (Telegram ID: ${customer.telegram_id})...`);
            
            try {
                // Get messages from Telegram
                const messages = await telegramService.getMessages(parseInt(customer.telegram_id), 500);
                console.log(`  Retrieved ${messages.length} messages from Telegram`);
                
                let saved = 0;
                let filesSaved = 0;
                
                for (const msg of messages) {
                    if (!msg || !msg.id) continue;
                    
                    // Check if message exists
                    const existing = await query(
                        'SELECT id, file_path FROM messages WHERE telegram_message_id = $1 AND chat_id = $2',
                        [msg.id, customer.telegram_id]
                    );
                    
                    // Prepare file info if message has file
                    let fileInfo = null;
                    let filePath = null;
                    let fileName = null;
                    let fileSize = null;
                    let mimeType = null;
                    
                    if (msg.hasFile && msg.media) {
                        try {
                            console.log(`  Downloading file for message ${msg.id}...`);
                            
                            // Create directory for this customer's files
                            const customerDir = path.join(telegramService.uploadsDir, 'files', `customer_${customer.id}`);
                            await fs.ensureDir(customerDir);
                            
                            // Generate filename
                            const ext = getFileExtension(msg);
                            fileName = `${msg.id}_${Date.now()}${ext}`;
                            filePath = path.join(customerDir, fileName);
                            
                            // Download file
                            await telegramService.client.downloadMedia(msg.media, {
                                outputFile: filePath
                            });
                            
                            const stats = await fs.stat(filePath);
                            fileSize = stats.size;
                            mimeType = msg.media.mimeType || getMimeType(ext);
                            
                            fileInfo = {
                                path: `uploads/files/customer_${customer.id}/${fileName}`,
                                name: fileName,
                                size: fileSize,
                                mimeType: mimeType
                            };
                            
                            console.log(`  ✅ File downloaded: ${fileName} (${fileSize} bytes)`);
                            filesSaved++;
                            
                        } catch (fileError) {
                            console.error(`  ❌ File download error for message ${msg.id}:`, fileError.message);
                        }
                    }
                    
                    if (existing.rows.length === 0) {
                        // Save message with file info
                        await query(`
                            INSERT INTO messages (
                                chat_id, telegram_message_id, message_text, has_file, is_outgoing,
                                sender_name, receiver_name, file_path, file_name, file_size, mime_type, created_at
                            )
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, to_timestamp($12))
                            ON CONFLICT (telegram_message_id) DO UPDATE SET
                                has_file = EXCLUDED.has_file,
                                file_path = EXCLUDED.file_path,
                                file_name = EXCLUDED.file_name,
                                file_size = EXCLUDED.file_size,
                                mime_type = EXCLUDED.mime_type
                        `, [
                            customer.telegram_id,
                            msg.id,
                            msg.text || '',
                            msg.hasFile || false,
                            msg.isOutgoing || false,
                            msg.isOutgoing ? 'እኔ (አድሚን)' : customer.name,
                            msg.isOutgoing ? customer.name : 'እኔ (አድሚን)',
                            fileInfo?.path || null,
                            fileInfo?.name || null,
                            fileInfo?.size || null,
                            fileInfo?.mimeType || null,
                            msg.date
                        ]);
                        saved++;
                    } else if (msg.hasFile && !existing.rows[0].file_path) {
                        // Update existing message with file info
                        await query(`
                            UPDATE messages 
                            SET has_file = true,
                                file_path = $1,
                                file_name = $2,
                                file_size = $3,
                                mime_type = $4
                            WHERE telegram_message_id = $5 AND chat_id = $6
                        `, [
                            fileInfo?.path || null,
                            fileInfo?.name || null,
                            fileInfo?.size || null,
                            fileInfo?.mimeType || null,
                            msg.id,
                            customer.telegram_id
                        ]);
                        filesSaved++;
                    }
                }
                
                totalMessages += saved;
                totalFiles += filesSaved;
                console.log(`  ✅ Saved ${saved} messages (${filesSaved} with files) for ${customer.name}\n`);
                
            } catch (customerError) {
                console.error(`  ❌ Error processing ${customer.name}:`, customerError.message);
                continue;
            }
        }
        
        // Get final counts
        const totalResult = await query('SELECT COUNT(*) FROM messages');
        const filesResult = await query('SELECT COUNT(*) FROM messages WHERE has_file = true');
        
        console.log(`\n📊 Final Results:`);
        console.log(`   Total messages in database: ${totalResult.rows[0].count}`);
        console.log(`   Messages with files: ${filesResult.rows[0].count}`);
        console.log(`   New messages saved: ${totalMessages}`);
        console.log(`   New files saved: ${totalFiles}`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

function getFileExtension(message) {
    if (message.media.className === 'MessageMediaPhoto') return '.jpg';
    if (message.media.className === 'MessageMediaDocument') {
        const mimeType = message.media.document?.mimeType;
        if (mimeType === 'application/pdf') return '.pdf';
        if (mimeType?.includes('image/png')) return '.png';
        if (mimeType?.includes('image/gif')) return '.gif';
        if (mimeType?.includes('video/mp4')) return '.mp4';
        return '.bin';
    }
    if (message.media.className === 'MessageMediaVideo') return '.mp4';
    return '.bin';
}

function getMimeType(ext) {
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.mp4': 'video/mp4',
        '.bin': 'application/octet-stream'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

syncAllMessagesWithFiles();