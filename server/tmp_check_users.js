import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TelegramUser from './models/TelegramUser.js';

dotenv.config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await TelegramUser.countDocuments();
        const activeCount = await TelegramUser.countDocuments({ isActive: true });
        console.log(`\n📊 Telegram Users Status:`);
        console.log(`Total users: ${count}`);
        console.log(`Active users: ${activeCount}`);
        
        if (count > 0) {
            const users = await TelegramUser.find().limit(5);
            console.log('\n📝 Latest users:');
            users.forEach(u => console.log(`- ${u.firstName} (${u.chatId}) - ${u.isActive ? '✅ Active' : '❌ Inactive'}`));
        }
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Database error:', err.message);
        process.exit(1);
    }
}

checkUsers();
