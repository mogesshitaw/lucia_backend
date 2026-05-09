// scripts/getTelegramSession.js
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function getTelegramSession() {
    console.log('\n🚀 Telegram Session Generator for SPUMS\n');
    console.log('='.repeat(60));
    
    const apiId = parseInt(await askQuestion('TELEGRAM_API_ID ያስገቡ (ከ my.telegram.org): '));
    const apiHash = await askQuestion('TELEGRAM_API_HASH ያስገቡ: ');
    const phoneNumber = await askQuestion('ስልክ ቁጥር (ከአገር ኮድ ጋር፣ ለምሳሌ +2519xxxxxxxx): ');
    
    console.log('\n📱 በመገናኘት ላይ...\n');
    
    const client = new TelegramClient(
        new StringSession(''),
        apiId,
        apiHash,
        {
            connectionRetries: 5,
            useWSS: true,
            deviceModel: 'SPUMS Session Generator',
            systemVersion: '1.0.0',
            appVersion: '1.0.0'
        }
    );
    
    await client.start({
        phoneNumber: async () => phoneNumber,
        phoneCode: async () => {
            return await askQuestion('በቴሌግራም የተላከውን ኮድ ያስገቡ: ');
        },
        password: async () => {
            return await askQuestion('2FA የይለፍ ቃል (ካለ): ');
        },
        onError: (err) => console.log('Error:', err),
    });
    
    const sessionString = client.session.save();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ በተሳካ ሁኔታ ተገናኝተዋል!\n');
    console.log('📝 ይህን በ .env ፋይል ውስጥ ያስቀምጡ:');
    console.log('\nTELEGRAM_API_ID=' + apiId);
    console.log('TELEGRAM_API_HASH=' + apiHash);
    console.log('TELEGRAM_SESSION=' + sessionString);
    console.log('\n' + '='.repeat(60));
    
    // ሴሽኑን ወደ ፋይልም ያስቀምጡ
    const sessionFile = path.join(__dirname, '../telegram_session.json');
    await fs.writeJson(sessionFile, {
        session: sessionString,
        apiId: apiId,
        createdAt: new Date().toISOString()
    }, { spaces: 2 });
    
    console.log('\n💾 Session also saved to: ' + sessionFile);
    
    rl.close();
    process.exit(0);
}

getTelegramSession().catch(console.error);