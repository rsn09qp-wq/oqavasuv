# Oqava Suv CRM - Employee Attendance & Water Management System

## Loyiha Haqida (Project Overview)
Bu loyiha tashkilotlar (jumladan, "Oqava Suv" MChJ kabi) uchun xodimlar davomatini nazorat qilish va boshqarishga mo'ljallangan kompleks CRM tizimidir. Tizim Hikvision biometrik qurilmalari bilan integratsiya qilingan bo'lib, xodimlarning kelib-ketish vaqtlarini aniq va avtomatik tarzda qayd etadi hamda Telegram orqali bildirishnomalar yuboradi.

### Tizim Arxitekturasi
- **Hikvision Biometric Terminal**: Xodimlarning yuz/barmoq izi orqali kirish-chiqishlarini qayd qiladi.
- **Mahalliy Server (Admin PC)**: Hikvision qurilmasidan keladigan webhook so'rovlarini (Port 5000) qabul qilib oladi va xodimning holatini qayta ishlab, bulutli bazaga (MongoDB Atlas) yuboradi.
- **Bulutli API (Render.com)**: Node.js va Express da yozilgan backend. Frontend bilan ma'lumot almashinuvini ta'minlaydi.
- **Frontend Dashboard (Netlify)**: React.js da yozilgan boshqaruv paneli. Administratorlar uchun davomat statistikasi, xodimlar ro'yxati va tizim sozlamalarini boshqarish imkonini beradi.
- **Telegram Bot**: `node-cron` yordamida har kuni ertalab 09:00 da va kechqurun 22:00 da rahbariyat va ruxsat etilgan foydalanuvchilarga kunlik davomat hisobotlarini yuboradi.

---

## Texnologiyalar (Technologies Used)
- **Frontend**: React.js, Tailwind CSS, Vite, Axios, Lucide React
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io, node-cron, node-telegram-bot-api
- **Infratuzilma**: Netlify (Frontend hosting), Render.com (Backend hosting), MongoDB Atlas (Database)

---

## O'rnatish va Ishga tushirish (Setup & Installation)

### 1. Mahalliy Server (Admin PC) qismi
Mahalliy server uzluksiz ishlab turishi shart (biometrik qurilma ma'lumotlarini qabul qilish uchun).
1. `server/.env` faylida quyidagilar bo'lishi shart:
   - `PORT=5000` (Hikvision qurilmasi mo'ljallangan port)
   - `MONGODB_URI` (Ma'lumotlar bazasi manzili)
2. Serverni fonga (background) ishga tushirish uchun `start-server-background.vbs` skriptidan foydalaniladi. Bu terminal oynasini ochmasdan, kompyuter yonganda serverni avtomatik ishga tushiradi.

### 2. Frontend qismi
1. `client/.env` faylida `VITE_API_URL` bulutli API manziliga (yoki mahalliy `http://localhost:5000`) yo'naltirilgan bo'lishi kerak.
2. Ishga tushirish:
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## Qilingan So'nggi Ishlar va Tuzatishlar (Recent Fixes & Updates)
Tizimda yuzaga kelgan "Dashboard'da ma'lumotlar ko'rinmay qolishi" va "Telegram bot xabar yubormasligi" kabi jiddiy muammolar doirasida quyidagi ishlar (Senior Level darajasida) tahlil qilinib, to'liq tuzatildi:

### 1. Mahalliy Server Ishga Tushishidagi Xatoliklar Bartaraf Etildi
- **Muammo:** Loyiha papkasi joylashuvi o'zgargani sababli kompyuter yonganda server avtomatik ishga tushmay qolgan edi (`start-server.bat`, `start-server.ps1` va `start-server-background.vbs` fayllarida eski manzil `C:\bm-crm-server` qolib ketgan). Shu sababli Hikvision'dan keladigan ma'lumotlar uzilib qolgan.
- **Yechim:** Barcha skriptlardagi manzillar joriy `F:\oqava suv\server` papkasiga to'g'irlandi. Server to'g'ri ishlashi uchun `.env` faylidagi port `8000` dan terminalga mos keluvchi `5000` portiga o'zgartirildi.
- **Natija:** Server fonga muvaffaqiyatli ishga tushirildi. Telegram bot (`node-cron` orqali ishlaydigan taymer) yana o'z vaqtida (09:00 va 22:00 da) ishlaydigan holatga keltirildi.

### 2. Frontend'da Autorizatsiya Xatoligi (`401 Unauthorized`) Tuzatildi
- **Muammo:** `DashboardPage.jsx` sahifasida ma'lumotlarni tortib olish uchun oddiy `fetch()` ishlatilgan bo'lib, u so'rovlarga xavfsizlik tokenini (JWT) qo'shmasdan yuborayotgan edi. Buning oqibatida server so'rovlarni "Ruxsat etilmagan" (401) deya qaytarib, Dashboard'da ma'lumotlar o'rniga 0 ko'rsatgan.
- **Yechim:** So'rovlar `fetch` dan o'chirilib, barcha sahifalardagidek `axios` ga o'tkazildi (interceptor yordamida token avtomatik biriktiriladi). Bu orqali API ulanishlari to'liq himoyalandi.

### 3. API URL Manzillari Unifikatsiya Qilindi (Birlashtirildi)
- **Muammo:** Tizimning ba'zi qismlari (masalan, Settings sahifasi) xato joydan API URL olardi (ikkinchi turdagi eski URL'lar).
- **Yechim:** `App.jsx`, `SettingsPage.jsx` va `DashboardPage.jsx` fayllari tahrirlanib, barcha ulanishlar markaziy `config.js` faylidagi bitta `API_URL` ga bog'lab qo'yildi. Natijada loyihada URL parchalanishiga chek qo'yildi.

**Eslatma:** Agar kelajakda Netlify saytida backend o'zgarishlari (yangi route'lar, masalan Telegram userlarni boshqarish) 404 (Topilmadi) xatosini bersa, bu Render.com bulutli serveringizni so'nggi Github o'zgarishlari bilan manual (qo'lda) yangilanmaganligidan dalolat beradi. Bunday holda Render dagi loyihani oxirgi Github commit'iga qarab deploy qilish zarur.
