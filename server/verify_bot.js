import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

console.log('🔍 Testing Telegram Bot Initialization...');
console.log(`Token: ${process.env.TELEGRAM_BOT_TOKEN ? '✅ Found' : '❌ Missing'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

try {
    // Import the service, which will trigger bot initialization
    const { default: bot } = await import('./services/telegram.service.js');
    
    if (bot) {
        console.log('✅ Bot object created successfully.');
        // Give it a moment to initialize polling/webhook
        setTimeout(() => {
            console.log('\n🚀 Bot is running in the background.');
            console.log('Check the console above for initialization messages (POLLING/WEBHOOK).');
            process.exit(0);
        }, 2000);
    } else {
        console.log('❌ Bot was not initialized (token might be missing or placeholder).');
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Failed to import telegram service:', error);
    process.exit(1);
}
