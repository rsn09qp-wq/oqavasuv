import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * JWT token yaratish
 */
export const generateToken = (userId, username, role) => {
    return jwt.sign(
        {
            id: userId,
            username,
            role
        },
        process.env.JWT_SECRET || 'water-management-secret-key',
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
    );
};

/**
 * JWT token tekshirish middleware
 * Parol o'zgartirilgan bo'lsa eski tokenlarni bekor qiladi
 */
export const authenticateToken = async (req, res, next) => {
    try {
        // Token headerdan olish
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Token topilmadi. Iltimos tizimga kiring.'
            });
        }

        // Token verify qilish
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'water-management-secret-key');
        } catch (err) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Token yaroqsiz yoki muddati tugagan.'
            });
        }

        // DB dan userni olib, parol o'zgarganligini tekshirish
        const user = await User.findById(decoded.id).select('passwordChangedAt isActive username role');

        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Foydalanuvchi topilmadi.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Sizning hisobingiz faol emas.'
            });
        }

        // Parol o'zgartirilgandan keyin yaratilgan tokenmi tekshirish
        if (user.tokenIssuedBeforePasswordChange(decoded.iat)) {
            console.log(`⚠️ Eski token rad etildi: ${user.username} (parol o'zgartirilgan)`);
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Parol o\'zgartirilgan. Iltimos qayta kiring.',
                code: 'PASSWORD_CHANGED'
            });
        }

        // User ma'lumotlarini request'ga qo'shish
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            error: 'Server error',
            message: 'Token tekshirishda xatolik yuz berdi.'
        });
    }
};


/**
 * Role-based access control middleware
 */
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Autentifikatsiya talab qilinadi.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Sizda bu amalni bajarish uchun ruxsat yo\'q.'
            });
        }

        next();
    };
};

/**
 * Optional authentication - agar token bo'lsa verify qiladi, bo'lmasa davom etadi
 */
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(); // Token yo'q, davom et
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET || 'water-management-secret-key',
        (err, user) => {
            if (!err) {
                req.user = user;
            }
            next();
        }
    );
};
