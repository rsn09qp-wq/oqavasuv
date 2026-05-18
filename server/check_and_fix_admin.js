import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'staff' },
    fullName: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function checkAndFixAdmin() {
    try {
        console.log('📡 MongoDB ga ulanmoqda...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB ga ulandi!\n');

        // Barcha userlarni ko'rish
        const allUsers = await User.find({}, { username: 1, email: 1, role: 1, isActive: 1 });
        console.log(`📋 Bazadagi barcha userlar (${allUsers.length} ta):`);
        allUsers.forEach(u => {
            console.log(`  - username: "${u.username}" | role: ${u.role} | active: ${u.isActive} | email: ${u.email}`);
        });

        // oqavasuv userni qidirish
        console.log('\n🔍 "oqavasuv" userni qidiryapman...');
        const adminUser = await User.findOne({ username: 'oqavasuv' });

        if (adminUser) {
            console.log('✅ User topildi!');
            console.log(`   ID: ${adminUser._id}`);
            console.log(`   Email: ${adminUser.email}`);
            console.log(`   Role: ${adminUser.role}`);
            console.log(`   isActive: ${adminUser.isActive}`);
            console.log(`   Password hash: ${adminUser.password}`);

            // suv2026 parolini tekshirish
            console.log('\n🔐 "suv2026" parolini tekshiryapman...');
            const isValid = await bcrypt.compare('suv2026', adminUser.password);
            console.log(`   Natija: ${isValid ? '✅ To\'g\'ri parol' : '❌ NOTO\'G\'RI PAROL!'}`);

            if (!isValid) {
                console.log('\n🔧 Parolni "suv2026" ga qayta o\'rnatmoqda...');
                const salt = await bcrypt.genSalt(10);
                const newHash = await bcrypt.hash('suv2026', salt);
                await User.updateOne({ username: 'oqavasuv' }, { $set: { password: newHash } });
                console.log('✅ Parol muvaffaqiyatli yangilandi!');

                // Tekshirish
                const updatedUser = await User.findOne({ username: 'oqavasuv' });
                const isNowValid = await bcrypt.compare('suv2026', updatedUser.password);
                console.log(`   Yangi parol tekshiruvi: ${isNowValid ? '✅ Muvaffaqiyatli' : '❌ Xatolik!'}`);
            }
        } else {
            console.log('❌ "oqavasuv" user bazada YO\'Q! Yangi yaratmoqda...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('suv2026', salt);

            const newAdmin = new User({
                username: 'oqavasuv',
                password: hashedPassword,
                email: 'admin@oqavasuv.uz',
                fullName: 'Oqava Suv Admin',
                role: 'admin',
                isActive: true
            });

            await newAdmin.save();
            console.log('✅ Admin user yaratildi!');
            console.log(`   username: oqavasuv`);
            console.log(`   password: suv2026`);
            console.log(`   role: admin`);
        }

        console.log('\n🎉 Endi tizimga kirish mumkin:');
        console.log('   Username: oqavasuv');
        console.log('   Password: suv2026');

    } catch (error) {
        console.error('❌ Xatolik:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n📡 MongoDB ulanishi yopildi.');
    }
}

checkAndFixAdmin();
