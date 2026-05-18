# 🖥️ Admin PC Server O'rnatish - To'liq Qo'llanma
## BM Maktab CRM - Hikvision Terminal Integratsiyasi

> **Maqsad:** Admin kompyuterini lokal server sifatida sozlash va Hikvision terminaldan kelgan davomat ma'lumotlarini cloud database'ga yuborish

---

## 📋 Tizim Arxitekturasi

```mermaid
graph LR
    A[Hikvision Terminal<br/>192.168.100.193] -->|ISUP Protocol<br/>Port 5200| B[Admin PC<br/>Lokal Server]
    B -->|Internet| C[MongoDB Atlas<br/>Cloud Database]
    C -->|API| D[Netlify Frontend<br/>bm-crm-test.netlify.app]
    
    style A fill:#ff6b6b
    style B fill:#4ecdc4
    style C fill:#45b7d1
    style D fill:#96ceb4
```

### Tizim Komponentlari:

1. **Hikvision Terminal** (192.168.100.193)
   - Lokal tarmoqda joylashgan
   - Yuz tanish orqali davomat yozadi
   - ISUP 5.0 protokoli orqali ma'lumot yuboradi

2. **Admin PC - Lokal Server** (Sizning kompyuteringiz)
   - Node.js server ishga tushadi
   - Hikvision'dan ma'lumot qabul qiladi
   - MongoDB Atlas'ga ma'lumot yuboradi
   - 2 ta port ishlatadi: 5200 (ISUP), 5000 (API)

3. **MongoDB Atlas** (Cloud Database)
   - Barcha ma'lumotlar saqlanadi
   - Internet orqali kirish mumkin

4. **Netlify Frontend** (Web Interface)
   - Foydalanuvchilar uchun web interfeys
   - Davomat ma'lumotlarini ko'rsatadi

---

## 🎯 QISM 1: Tayyorgarlik

### 1.1 Zarur Dasturlar

> [!IMPORTANT]
> Quyidagi dasturlarni o'rnatish shart!

#### ✅ Node.js (JavaScript Runtime)

**Nima uchun kerak?** Server Node.js'da yozilgan, uni ishlatish uchun Node.js kerak.

**O'rnatish:**

1. Brauzerda oching: https://nodejs.org
2. **LTS** (Long Term Support) versiyasini yuklab oling
   - Hozir: v20.x yoki v22.x
3. Yuklab olingan faylni ishga tushiring
4. O'rnatish jarayonida:
   - ✅ "Automatically install necessary tools" - belgilang
   - ✅ Default sozlamalarni qoldiring
   - **Next → Next → Install**

**Tekshirish:**

PowerShell yoki CMD ochib, quyidagi buyruqlarni kiriting:

```powershell
node --version
# Natija: v20.11.0 (yoki shunga o'xshash)

npm --version
# Natija: 10.2.4 (yoki shunga o'xshash)
```

> [!TIP]
> Agar buyruqlar ishlamasa, kompyuterni qayta ishga tushiring.

---

### 1.2 Server Papkasini Tayyorlash

> [!WARNING]
> Faqat `server` papkasini nusxalang, butun loyihani emas!

**Qadamlar:**

1. **Server papkasini topish:**
   - Hozirgi joylashuv: `c:\Users\BOBORAHIM MASHRAB\Downloads\bm crmm\bm crmm\server`

2. **Yangi joyga nusxalash:**
   - `C:\` diskida yangi papka yarating: `bm-crm-server`
   - `server` papkasidagi **barcha fayllarni** `C:\bm-crm-server\` ga nusxalang
   - Natijada: `C:\bm-crm-server\index.js`, `C:\bm-crm-server\package.json` va boshqalar bo'lishi kerak

> [!TIP]
> **Nima uchun C:\ ga?** 
> - Yo'l qisqa va sodda
> - Ruxsatlar bilan muammo bo'lmaydi
> - Oson topish mumkin

---

### 1.3 Dependencies O'rnatish

**Dependencies** - bu server ishlashi uchun kerak bo'lgan kutubxonalar (express, mongoose, xml2js va boshqalar).

**PowerShell ochish:**

1. `Win + X` tugmalarini bosing
2. **Windows PowerShell** yoki **Terminal** ni tanlang

**Buyruqlar:**

```powershell
# Server papkasiga o'tish
cd C:\bm-crm-server

# Dependencies o'rnatish (3-5 daqiqa davom etadi)
npm install
```

**Kutilayotgan natija:**

```
added 150 packages, and audited 151 packages in 2m

found 0 vulnerabilities
```

> [!NOTE]
> Agar `WARN` (ogohlantirish) ko'rsangiz, muammo emas. Faqat `ERROR` muhim.

---

## 🎯 QISM 2: Konfiguratsiya

### 2.1 Environment Variables (.env fayl)

**Nima bu?** `.env` fayl - bu server sozlamalari (database ulanish, portlar va h.k.)

**Qadamlar:**

1. **PowerShell'da:**

```powershell
cd C:\bm-crm-server

# .env.example dan .env yaratish
Copy-Item .env.example .env
```

2. **`.env` faylini tahrirlash:**

   - `C:\bm-crm-server\.env` faylini **Notepad** yoki **VS Code** da oching
   - Quyidagi qatorni toping va o'zgartiring:

```env
# Eski:
NODE_ENV=production

# Yangi:
NODE_ENV=development
```

3. **Saqlang va yoping**

> [!IMPORTANT]
> **Nima uchun `development`?**
> - Lokal server uchun
> - Batafsil loglar ko'rsatadi
> - Xatolarni topish osonroq

**To'liq `.env` fayl shunday ko'rinishi kerak:**

```env
# MongoDB Atlas (PRODUCTION DATABASE)
MONGODB_URI=mongodb+srv://hasanboyleo97_db_user:Mjm88aTbZQFmxMNu@bmcrm.1ieuljj.mongodb.net/attendance_db?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Origins (Cloud URLs)
CORS_ORIGINS=https://bm-crm-test.netlify.app,http://localhost:5173

# Hikvision Configuration (optional)
HIKVISION_IP=192.168.100.193
HIKVISION_USERNAME=admin
HIKVISION_PASSWORD=your_password
```

> [!NOTE]
> `MONGODB_URI` - bu cloud database ulanish. Uni o'zgartirmang, u tayyor!

---

### 2.2 IP Manzilni Aniqlash

**Nima uchun kerak?** Hikvision terminalga admin PC'ning IP manzilini ko'rsatish kerak.

**PowerShell'da:**

```powershell
ipconfig
```

**Natijadan quyidagini toping:**

```
Ethernet adapter Ethernet:
   IPv4 Address. . . . . . . . . . . : 192.168.100.25
```

> [!IMPORTANT]
> **Sizning IP manzilni yozib oling!** Masalan: `192.168.100.25`
> 
> Bu IP Hikvision sozlamalarida kerak bo'ladi.

---

### 2.3 Windows Firewall Sozlash

**Nima uchun kerak?** Hikvision terminal server'ga ulanishi uchun firewall portlarni ochish kerak.

> [!CAUTION]
> PowerShell'ni **Administrator** sifatida ochish kerak!

**PowerShell (Administrator) ochish:**

1. `Win + X` tugmalarini bosing
2. **Windows PowerShell (Admin)** yoki **Terminal (Admin)** ni tanlang
3. "Do you want to allow this app to make changes?" → **Yes**

**Buyruqlar:**

```powershell
# ISUP protokoli uchun port (5200)
New-NetFirewallRule -DisplayName "BM-CRM-ISUP" -Direction Inbound -LocalPort 5200 -Protocol TCP -Action Allow

# API uchun port (5000)
New-NetFirewallRule -DisplayName "BM-CRM-API" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

**Kutilayotgan natija:**

```
Name                  : {GUID}
DisplayName           : BM-CRM-ISUP
Enabled               : True
```

> [!TIP]
> **Tekshirish:**
> 1. `Win + R` → `wf.msc` → **OK**
> 2. **Inbound Rules** → `BM-CRM-ISUP` va `BM-CRM-API` ni toping
> 3. Enabled (yashil belgi) bo'lishi kerak

---

## 🎯 QISM 3: Hikvision Terminal Sozlash

### 3.1 Hikvision Web Interfeys'ga Kirish

**Brauzerda oching:**

```
https://192.168.100.193
```

> [!NOTE]
> Agar "Your connection is not private" ogohlantirishini ko'rsangiz:
> - **Advanced** → **Proceed to 192.168.100.193**

**Login:**

```
Username: admin
Password: Parol8887
```

---

### 3.2 ISUP Protokolini Sozlash

> [!IMPORTANT]
> Bu eng muhim qism! Diqqat bilan bajaring.

**Qadamlar:**

1. **Menyuga o'tish:**
   - **Configuration** → **Network** → **Platform Access**

2. **ISUP sozlamalari:**

```
Enable Platform Access: ✅ ON

Protocol Type: ISUP 5.0

Server Address: 192.168.100.25  ← SIZNING IP MANZIL
Server Port: 5200

Device ID: 001
Encryption Key: bmmaktab2025

Heartbeat Interval: 60 (seconds)
```

> [!WARNING]
> **Diqqat:**
> - `Server Address` - bu sizning admin PC'ning IP manzili (2.2 qadamda topgan)
> - `Encryption Key` - aynan `bmmaktab2025` bo'lishi kerak (server kodida ham shunday)

3. **Saqlash:**
   - **Save** tugmasini bosing
   - Terminal qayta yuklanadi (30 sekund)

---

### 3.3 HTTP Webhook (Ixtiyoriy)

> [!TIP]
> Bu qo'shimcha xavfsizlik uchun. Majburiy emas.

**Agar sozlamoqchi bo'lsangiz:**

1. **Configuration** → **Network** → **HTTP(S) Listening**

```
Enable: ✅ ON
Protocol: HTTP
IP Address: 192.168.100.25  ← SIZNING IP
Port: 5000
URL: /webhook/hikvision
```

2. **Save**

---

## 🎯 QISM 4: Server'ni Ishga Tushirish

### 4.1 Birinchi Marta Ishga Tushirish

**PowerShell'da:**

```powershell
cd C:\bm-crm-server

# Development rejimda ishga tushirish
npm run dev
```

**Kutilayotgan loglar:**

```
🚀 ISUP Server listening on port 5200
📡 Ready to accept connections from Hikvision devices
✅ MongoDB connected to: attendance_db
🚀 Server running on port 5000
🌐 CORS enabled for: https://bm-crm-test.netlify.app, http://localhost:5173
```

> [!IMPORTANT]
> **Agar shu loglarni ko'rsangiz - TABRIKLAYMIZ! Server ishga tushdi! 🎉**

---

### 4.2 Test Qilish

**1. Hikvision oldida yuz taniting:**

   - Terminalga yaqinlashing
   - Yuzingizni ko'rsating
   - "Beep" tovushi eshitilishi kerak

**2. Server loglarini kuzating:**

PowerShell'da quyidagi loglar paydo bo'lishi kerak:

```
🔌 New ISUP connection: 192.168.100.193:xxxxx
📨 ISUP Command: Register
✅ Device 001 registered
📨 ISUP Command: EventNotification
📥 Processing attendance event: {...}
👨‍🎓 Found in Student collection: Ism Familiya
✅ Ism Familiya (student) - CHECK IN at 09:15
💾 Attendance saved to database
```

**3. Web interfeys'da tekshiring:**

   - Brauzerda oching: https://bm-crm-test.netlify.app
   - Login: `admin` / `admin123`
   - **Attendance** sahifasiga o'ting
   - Yangi davomat yozuvi ko'rinishi kerak

> [!TIP]
> **Agar davomat ko'rinmasa:**
> - Sahifani yangilang (F5)
> - Bugungi sanani tanlang
> - Server loglarida xato bormi tekshiring

---

### 4.3 Server'ni To'xtatish

**PowerShell'da:**

```
Ctrl + C
```

Savol: `Terminate batch job (Y/N)?` → **Y** bosing

---

## 🎯 QISM 5: Avtomatik Ishga Tushirish

> [!NOTE]
> **Maqsad:** Kompyuter yonganida server avtomatik ishga tushsin

### 5.1 Startup Papkasiga Qo'shish (Eng Oson Usul)

**Qadamlar:**

1. **Startup papkasini ochish:**

```
Win + R → shell:startup → OK
```

2. **Shortcut yaratish:**

   - `C:\bm-crm-server\start-server-silent.vbs` faylini toping
   - Uni **Startup** papkasiga **nusxalang** (Copy-Paste)

3. **Tayyor!**

**Test qilish:**

1. Kompyuterni qayta ishga tushiring
2. 30 sekund kuting
3. PowerShell'da tekshiring:

```powershell
netstat -ano | findstr :5000
netstat -ano | findstr :5200
```

Agar natija ko'rsatsa - server ishlayapti! ✅

---

### 5.2 PM2 (Professional Usul)

> [!TIP]
> **Afzalliklari:**
> - Avtomatik qayta ishga tushirish (agar crash bo'lsa)
> - Loglarni boshqarish
> - Monitoring

**O'rnatish:**

```powershell
# PM2 global o'rnatish
npm install -g pm2
npm install -g pm2-windows-startup

# PM2 startup sozlash
pm2-startup install

# Server qo'shish
cd C:\bm-crm-server
pm2 start index.js --name "bm-crm-server"
pm2 save
```

**Boshqarish buyruqlari:**

```powershell
pm2 status              # Status ko'rish
pm2 logs bm-crm-server  # Loglarni ko'rish
pm2 restart bm-crm-server  # Qayta ishga tushirish
pm2 stop bm-crm-server     # To'xtatish
pm2 start bm-crm-server    # Ishga tushirish
```

---

## 🎯 QISM 6: Kundalik Foydalanish

### 6.1 Har Kuni Ishga Tushirish (Agar Avtomatik Bo'lmasa)

```powershell
cd C:\bm-crm-server
npm run dev
```

### 6.2 Loglarni Kuzatish

Server ishlab turganida PowerShell oynasini yopmang! U yerda loglar ko'rinadi:

- ✅ Muvaffaqiyatli ulanishlar
- 📥 Davomat ma'lumotlari
- ❌ Xatolar (agar bo'lsa)

### 6.3 Server Statusini Tekshirish

**Portlar ochiqmi?**

```powershell
netstat -ano | findstr :5000
netstat -ano | findstr :5200
```

**Hikvision ulanganmi?**

```powershell
ping 192.168.100.193
```

---

## 🆘 QISM 7: Muammolarni Hal Qilish

### 7.1 "Port Already in Use" Xatosi

**Muammo:** Port band, server ishga tushmayapti

**Yechim:**

```powershell
# Qaysi dastur portni ishlatayotganini topish
netstat -ano | findstr :5000

# Natija: TCP  0.0.0.0:5000  0.0.0.0:0  LISTENING  12345
# 12345 - bu PID (Process ID)

# Dasturni to'xtatish
taskkill /F /PID 12345
```

---

### 7.2 Hikvision Ulanmayapti

**Tekshirish:**

1. **Tarmoq ulanishi:**

```powershell
ping 192.168.100.193
```

Agar `Request timed out` - tarmoq muammosi.

2. **Firewall:**

```
Win + R → wf.msc → OK
Inbound Rules → BM-CRM-ISUP va BM-CRM-API Enabled bo'lishi kerak
```

3. **Hikvision sozlamalari:**

   - Web interfeys'ga kiring
   - Platform Access sozlamalarini qayta tekshiring
   - Server Address to'g'rimi?

4. **IP manzil o'zgardimi?**

```powershell
ipconfig
```

Agar IP o'zgargan bo'lsa, Hikvision sozlamalarida yangilang.

---

### 7.3 MongoDB Ulanmayapti

**Xato:** `❌ MongoDB connection failed`

**Yechim:**

1. **Internet ulanishini tekshiring:**

```powershell
ping google.com
```

2. **`.env` faylini tekshiring:**

   - `MONGODB_URI` to'g'ri yozilganmi?
   - Bo'sh joylar yo'qmi?

3. **MongoDB Atlas statusini tekshiring:**

   - https://cloud.mongodb.com
   - Login qiling
   - Cluster ishlab turganmi?

---

### 7.4 Davomat Saqlanmayapti

**Tekshirish:**

1. **Server loglarida xato bormi?**

   - PowerShell oynasini ko'ring
   - `❌` belgili qatorlarni toping

2. **Hikvision Employee ID to'g'rimi?**

   - Web interfeys: https://bm-crm-test.netlify.app
   - **Students** yoki **Staff** sahifasiga o'ting
   - `Hikvision ID` to'ldirilganmi?

3. **Database'da tekshirish:**

```powershell
cd C:\bm-crm-server
node check-today-attendance.js
```

---

### 7.5 Server Crash Bo'ldi

**Sabablari:**

- Node.js yangilanishi kerak
- Dependencies buzilgan
- Disk joy yo'q

**Yechim:**

```powershell
cd C:\bm-crm-server

# Dependencies qayta o'rnatish
Remove-Item -Recurse -Force node_modules
npm install

# Server qayta ishga tushirish
npm run dev
```

---

## 📊 QISM 8: Monitoring va Maintenance

### 8.1 Loglarni Saqlash

**PM2 bilan (tavsiya etiladi):**

```powershell
pm2 logs bm-crm-server --lines 100  # Oxirgi 100 qator
pm2 logs bm-crm-server --err        # Faqat xatolar
```

**Manual:**

Server loglarini fayl sifatida saqlash:

```powershell
npm run dev > logs.txt 2>&1
```

---

### 8.2 Database Backup

> [!IMPORTANT]
> MongoDB Atlas avtomatik backup qiladi, lekin qo'shimcha export foydali.

**Bugungi davomat export qilish:**

```powershell
cd C:\bm-crm-server
node check-today-attendance.js > attendance_$(Get-Date -Format 'yyyy-MM-dd').txt
```

---

### 8.3 Haftalik Tekshiruv

**Har haftada bir marta:**

1. ✅ Server loglarini ko'rib chiqing
2. ✅ Disk joyini tekshiring
3. ✅ Windows Update qiling
4. ✅ Node.js yangilanishlarini tekshiring

```powershell
npm outdated  # Yangilanishlarni ko'rish
```

---

## ✅ QISM 9: Yakuniy Tekshiruv

### 9.1 Checklist

Quyidagi barcha bandlar ✅ bo'lishi kerak:

- [ ] Node.js o'rnatilgan (`node --version` ishlaydi)
- [ ] Server papkasi `C:\bm-crm-server\` da
- [ ] `npm install` muvaffaqiyatli bajarildi
- [ ] `.env` fayl yaratilgan va `NODE_ENV=development`
- [ ] IP manzil aniqlangan
- [ ] Firewall portlari ochiq (5000, 5200)
- [ ] Hikvision ISUP sozlangan
- [ ] Server ishga tushadi (`npm run dev`)
- [ ] Hikvision ulanadi (logda `Device 001 registered`)
- [ ] Test davomat ishlaydi
- [ ] Web interfeys'da davomat ko'rinadi
- [ ] Avtomatik ishga tushirish sozlangan

---

### 9.2 Ish Jarayoni Diagrammasi

```mermaid
sequenceDiagram
    participant T as Hikvision Terminal
    participant S as Admin PC Server
    participant D as MongoDB Atlas
    participant W as Web Interface
    
    T->>S: 1. Yuz tanish (ISUP)
    S->>S: 2. Ma'lumot qayta ishlash
    S->>D: 3. Davomat saqlash
    W->>D: 4. Ma'lumot so'rash
    D->>W: 5. Davomat ko'rsatish
    
    Note over T,W: Real-time jarayon (1-2 sekund)
```

---

## 📞 QISM 10: Qo'shimcha Ma'lumot

### 10.1 Muhim Fayllar

| Fayl | Maqsad |
|------|--------|
| `index.js` | Asosiy server fayl |
| `isup-server.js` | Hikvision ISUP protokol handler |
| `.env` | Konfiguratsiya (parollar, portlar) |
| `package.json` | Dependencies ro'yxati |
| `models/` | Database schema'lar |

### 10.2 Portlar

| Port | Protokol | Maqsad |
|------|----------|--------|
| 5200 | TCP | ISUP (Hikvision ulanish) |
| 5000 | HTTP | REST API |

### 10.3 Foydali Buyruqlar

```powershell
# Server statusini tekshirish
netstat -ano | findstr :5000

# IP manzilni ko'rish
ipconfig

# Hikvision'ga ping
ping 192.168.100.193

# Loglarni ko'rish (PM2)
pm2 logs bm-crm-server

# Server qayta ishga tushirish
pm2 restart bm-crm-server

# Bugungi davomat
node check-today-attendance.js
```

---

## 🎓 Xulosa

Siz muvaffaqiyatli quyidagilarni amalga oshirdingiz:

1. ✅ Admin PC'ni lokal server sifatida sozladingiz
2. ✅ Hikvision terminalni integratsiya qildingiz
3. ✅ Cloud database bilan bog'ladingiz
4. ✅ Real-time davomat tizimini ishga tushirdingiz

**Ish jarayoni:**

```
Hikvision Terminal → Admin PC Server → MongoDB Atlas → Web Interface
```

**Natija:**

- 🎯 Avtomatik davomat yozish
- 📊 Real-time monitoring
- ☁️ Cloud backup
- 🌐 Istalgan joydan kirish

---

## 📚 Qo'shimcha Resurslar

- [Node.js Documentation](https://nodejs.org/docs)
- [PM2 Guide](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [MongoDB Atlas](https://cloud.mongodb.com)
- [Hikvision ISUP Protocol](https://www.hikvision.com/en/support/download/sdk/)

---

**Versiya:** 4.0 Complete  
**Sana:** 2026-01-05  
**Muallif:** BM CRM Development Team

**Omad tilaymiz! 🚀**
