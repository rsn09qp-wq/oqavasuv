import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: ['admin', 'teacher', 'staff'],
        default: 'staff'
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    // Parol o'zgargan vaqt — eski tokenlarni bekor qilish uchun
    passwordChangedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Password hash qilish (save qilishdan oldin)
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // Parol o'zgargan vaqtni belgilash (yangi user uchun emas)
    if (!this.isNew) {
        this.passwordChangedAt = new Date(Date.now() - 1000); // 1 sek oldin (token saqlash vaqtini hisobga olib)
    }
});

// Password tekshirish metodi
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Token parol o'zgarishidan oldin yaratilganligini tekshirish
userSchema.methods.tokenIssuedBeforePasswordChange = function (tokenIssuedAt) {
    if (!this.passwordChangedAt) return false; // Parol hech o'zgartirilmagan
    
    // tokenIssuedAt — JWT iat (seconds), passwordChangedAt — milliseconds
    const changedAtSeconds = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return tokenIssuedAt < changedAtSeconds;
};

// Password fieldni JSON'da ko'rsatmaslik
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);

export default User;
