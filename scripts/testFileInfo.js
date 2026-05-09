// backend/scripts/testFileInfo.js
const telegramService = require('../src/services/telegramService');
const { Api } = require('telegram'); 
async function testFileInfo() {
    try {
        await telegramService.initialize();
        
        const chatId = 1018001517; // Your chat ID
        
        console.log(`Testing file info for chat ${chatId}...`);
        
        // Get messages with media
        const messages = await telegramService.client.getMessages(chatId, {
            limit: 10,
            filter: new Api.InputMessagesFilterPhotoVideo()
        });
        
        for (const msg of messages) {
            console.log(`\nMessage ${msg.id}:`);
            if (msg.media) {
                console.log(`  Type: ${msg.media.className}`);
                
                if (msg.media.className === 'MessageMediaPhoto') {
                    const photo = msg.media.photo;
                    if (photo && photo.sizes) {
                        console.log(`  Sizes: ${photo.sizes.length}`);
                        photo.sizes.forEach((size, i) => {
                            console.log(`    Size ${i}: ${size.size} bytes`);
                        });
                    }
                } else if (msg.media.className === 'MessageMediaDocument') {
                    const doc = msg.media.document;
                    if (doc) {
                        console.log(`  Size: ${doc.size} bytes`);
                        console.log(`  MimeType: ${doc.mimeType}`);
                    }
                }
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testFileInfo();