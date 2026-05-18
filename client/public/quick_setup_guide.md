# ⚡ Tezkor Qo'llanma - Admin PC Server O'rnatish

## 📋 Ketma-ketlik

### 1️⃣ Node.js O'rnatish
```
https://nodejs.org → LTS yuklab oling → O'rnating
```

**Tekshirish:**
```powershell
node --version
npm --version
```

---

### 2️⃣ Server Papkasini Nusxalash
```
server papkasini → C:\bm-crm-server\ ga nusxalang
```

---

### 3️⃣ Dependencies O'rnatish
```powershell
cd C:\bm-crm-server
npm install
```

---

### 4️⃣ .env Fayl Yaratish
```powershell
cd C:\bm-crm-server
Copy-Item .env.example .env
```

**Notepad'da `.env` ni oching va o'zgartiring:**
```env
NODE_ENV=development
```

---

### 5️⃣ IP Manzilni Topish
```powershell
ipconfig
```
**IPv4 ni yozib oling:** Masalan `192.168.100.25`

---

### 6️⃣ Firewall Ochish
**PowerShell (Administrator):**
```powershell
New-NetFirewallRule -DisplayName "BM-CRM-ISUP" -Direction Inbound -LocalPort 5200 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "BM-CRM-API" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

---

### 7️⃣ Hikvision Sozlash
**Brauzer:** `https://192.168.100.193` (admin/Parol8887)

**Configuration → Network → Platform Access:**
```
Enable: ON
Protocol: ISUP 5.0
Server: 192.168.100.25  ← SIZNING IP
Port: 5200
Device ID: 001
Key: bmmaktab2025
Heartbeat: 60
```
**Save** bosing

---

### 8️⃣ Server Ishga Tushirish
```powershell
cd C:\bm-crm-server
npm run dev
```

**Kutilayotgan log:**
```
🚀 ISUP Server listening on port 5200
✅ MongoDB connected
🚀 Server running on port 5000
```

---

### 9️⃣ Test Qilish
1. Hikvision oldida yuz taniting
2. Server logida ko'ring:
   ```
   ✅ Ism Familiya - CHECK IN at 09:15
   💾 Attendance saved
   ```
3. Web: https://bm-crm-test.netlify.app → Attendance

---

### 🔟 Avtomatik Ishga Tushirish
```
Win + R → shell:startup → OK
```
`C:\bm-crm-server\start-server-silent.vbs` ni Startup papkasiga nusxalang

**Tayyor!** Kompyuter yonganida server avtomatik ishga tushadi.

---

## 🆘 Tezkor Muammolar

### Port band:
```powershell
netstat -ano | findstr :5000
taskkill /F /PID <PID>
```

### Hikvision ulanmayapti:
```powershell
ping 192.168.100.193
```
- Firewall tekshiring: `Win + R → wf.msc`
- IP to'g'rimi? `ipconfig`

### Server statusini tekshirish:
```powershell
netstat -ano | findstr :5000
netstat -ano | findstr :5200
```

---

## ✅ Checklist

- [ ] Node.js o'rnatilgan
- [ ] Server `C:\bm-crm-server\` da
- [ ] `npm install` bajarildi
- [ ] `.env` yaratildi va `NODE_ENV=development`
- [ ] IP manzil topildi
- [ ] Firewall portlari ochiq
- [ ] Hikvision ISUP sozlangan
- [ ] Server ishga tushdi
- [ ] Test davomat ishladi
- [ ] Avtomatik ishga tushirish sozlandi

---

**Batafsil qo'llanma:** `admin_pc_setup_full_guide.md`
