# OQAVA SUV CRM

Oqava suv (yoki istalgan boshqa turdagi) kompaniyalar uchun xodimlar davomatini nazorat qilish va boshqarishga mo'ljallangan to'liq funksional CRM tizimi.

📦 Texnologiyalar

| Layer | Stack |
| --- | --- |
| Backend | Node.js, Express, MongoDB (Mongoose) |
| Frontend | React, Vite, TailwindCSS, Lucide React |
| Real-time | Socket.io |
| Hardware | Hikvision Biometric Terminal (ISUP/Webhook) |
| Notifications | Telegram Bot (node-telegram-bot-api, node-cron) |
| Hosting | Render.com (backend), Netlify (frontend) |

🏗️ Arxitektura

```
oqava suv/
├── server/
│   ├── controllers/      # HTTP handler'lar (biznes logika)
│   ├── services/         # Asosiy biznes logika (telegram, scheduler, hikvision)
│   ├── models/           # Mongoose schema'lar
│   ├── routes/           # Express router'lar
│   ├── middleware/       # auth, xavfsizlik tekshiruvlari
│   ├── utils/            # yordamchi funksiyalar
│   ├── webhookRoutes.js  # Hikvision terminali uchun Webhook qabul qilgich
│   └── index.js          # Entry point
└── client/
    ├── src/
    │   ├── components/   # UI komponentlar (Dashboard, Sidebar)
    │   ├── pages/        # Sahifalar (Settings, Notifications, kelish-ketish)
    │   ├── config.js     # API manzillari
    │   └── App.jsx       # Asosiy router va interceptor'lar
    └── vite.config.js
```

🚀 Local Setup

Talablar
- Node.js >= 18
- MongoDB Atlas klaster (yoki local MongoDB)
- Hikvision Biometric Terminal (Ixtiyoriy, davomatni avtomatlashtirish uchun)

1. Clone va install

```bash
git clone <repo-url>
cd oqava suv

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

2. Environment variables

```bash
# server/.env faylini yarating
cp server/.env.example server/.env

# client/.env faylini yarating
cp client/.env.example client/.env
```

Muhim ENV variable'lar (Server):

| Variable | Tavsif | Majburiy |
| --- | --- | --- |
| MONGODB_URI | MongoDB Atlas connection string | ✅ |
| PORT | Mahalliy server porti (terminal 5000 ga sozlangan) | ✅ |
| JWT_SECRET | Access token signing key | ✅ |
| CORS_ORIGINS | Frontend URL (CORS uchun) | ✅ |
| TELEGRAM_BOT_TOKEN | Telegram bot tokeni | ✅ |
| TELEGRAM_CHAT_ID | Bildirishnomalar boradigan guruh ID'si | ✅ |

Muhim ENV variable'lar (Client):

| Variable | Tavsif | Majburiy |
| --- | --- | --- |
| VITE_API_URL | Backend API manzili | ✅ |

✅ Qilingan So'nggi Yangilanishlar (Senior Level Fixes)

- Mahalliy Server Uzluksizligi: Kompyuter yonganda avtomatik ravishda mahalliy webhook server fonga (background) ishga tushishi uchun `.bat`, `.ps1` va `.vbs` skriptlaridagi yo'nalish manzillari to'liq to'g'irlandi. Hikvision terminalining standart ishlashiga moslash uchun port aynan `5000` ga biriktirildi.
- Autorizatsiya Xatosi (401 Unauthorized): Frontend (Netlify) tizimidan serverga so'rov yuborishda auth tokenini unutib qo'yuvchi eski `fetch` o'chirilib, barcha joyda xavfsiz va markazlashgan interceptor'ga ega `axios` kutubxonasi o'rnatildi.
- API Routing va URL Muvofiqlashtirish: Kod bo'ylab tartibsiz tarqalib ketgan URL o'zgaruvchilaridan (masalan, ikkilangan `VITE_API_BASE`) voz kechilib, barcha sahifalar faqat markazlashgan `config.js` ichidagi yagona `API_URL` ga bog'landi. Tizim arxitekturasi barqarorlashtirildi.
- Telegram Taymerlari: `node-cron` va bot logikasi to'xtab qolmasligi uchun Local Serverni doimiy ishlatish yechimi joriy etildi. Endi tizim aniq soat 09:00 va 22:00 da o'z-o'zidan hisobot jo'natadi.
