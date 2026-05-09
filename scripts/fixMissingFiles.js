// backend/scripts/simpleFileSync.js
const { query } = require('../src/config/database');
const telegramService = require('../src/services/telegramService');
const fs = require('fs-extra');
const path = require('path');

async function simpleFileSync() {
    console.log('=== Simple File Sync ===\n');
    
    try {
        // Test connection
        await query('SELECT NOW()');
        console.log('✅ Database connected');
        
        await telegramService.initialize();
        console.log('✅ Telegram connected\n');
        
        // Get all messages that have files but missing file_path
        const result = await query(`
            SELECT 
                m.id as msg_id,
                m.chat_id,
                m.telegram_message_id
            FROM messages m
            WHERE m.has_file = true 
            AND (m.file_path IS NULL OR m.file_path = '')
            ORDER BY m.created_at DESC
            LIMIT 50
        `);
        
        console.log(`Found ${result.rows.length} messages with missing files\n`);
        
        let successCount = 0;
        
        for (const row of result.rows) {
            console.log(`Processing message ID: ${row.telegram_message_id} (Chat: ${row.chat_id})`);
            
            try {
                // Get message from Telegram
                const msgs = await telegramService.client.getMessages(row.chat_id, {
                    ids: [parseInt(row.telegram_message_id)]
                });
                
                const msg = msgs[0];
                
                if (!msg || !msg.media) {
                    console.log(`  ❌ No media found`);
                    continue;
                }
                
                // Create directory
                const fileDir = path.join(telegramService.uploadsDir, 'files', `chat_${row.chat_id}`);
                await fs.ensureDir(fileDir);
                
                // Get file extension
                let ext = '.jpg';
                if (msg.media.className === 'MessageMediaDocument') {
                    const mime = msg.media.document?.mimeType;
                    if (mime === 'application/pdf') ext = '.pdf';
                    else if (mime?.includes('png')) ext = '.png';
                    else if (mime?.includes('gif')) ext = '.gif';
                }
                
                const fileName = `${msg.id}_${Date.now()}${ext}`;
                const filePath = path.join(fileDir, fileName);
                
                // Download
                await telegramService.client.downloadMedia(msg.media, {
                    outputFile: filePath
                });
                
                const stats = await fs.stat(filePath);
                
                // Update database
                await query(`
                    UPDATE messages 
                    SET file_path = $1,
                        file_name = $2,
                        file_size = $3
                    WHERE id = $4
                `, [
                    `uploads/files/chat_${row.chat_id}/${fileName}`,
                    fileName,
                    stats.size,
                    row.msg_id
                ]);
                
                console.log(`  ✅ Saved: ${fileName} (${stats.size} bytes)`);
                successCount++;
                
            } catch (err) {
                console.error(`  ❌ Error:`, err.message);
            }
            
            // Delay
            await new Promise(r => setTimeout(r, 500));
        }
        
        console.log(`\n✅ Successfully fixed ${successCount} files`);
        
        // Show summary
        const summary = await query(`
            SELECT 
                COUNT(*) as total_with_files,
                COUNT(CASE WHEN file_path IS NOT NULL THEN 1 END) as has_path
            FROM messages 
            WHERE has_file = true
        `);
        
        console.log(`\n📊 Summary:`);
        console.log(`   Total messages with files: ${summary.rows[0].total_with_files}`);
        console.log(`   Messages with file path: ${summary.rows[0].has_path}`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    }
}

simpleFileSync();