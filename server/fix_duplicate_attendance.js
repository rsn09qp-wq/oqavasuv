/**
 * fix_duplicate_attendance.js
 * Bugungi duplicate attendance yozuvlarni tozalaydi.
 * Bir xil ism bo'lsa — bitta yozuvga birlashtiradi.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Employee from "./models/Employee.js";
import Attendance from "./models/Attendance.js";
import { normalizeName } from "./utils/nameHelper.js";

dotenv.config();

async function fixDuplicateAttendance() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB connected");

  const today = new Date().toISOString().split("T")[0];
  console.log(`\n📅 Tekshirilayotgan kun: ${today}`);

  // Bugungi barcha attendance yozuvlarini ol
  const allAttendance = await Attendance.find({ date: today });
  console.log(`📋 Jami attendance yozuvlari: ${allAttendance.length}`);

  // Nom bo'yicha guruhlash
  const groups = {};
  for (const att of allAttendance) {
    const key = normalizeName(att.name);
    if (!groups[key]) groups[key] = [];
    groups[key].push(att);
  }

  let fixedCount = 0;
  for (const [key, records] of Object.entries(groups)) {
    if (records.length <= 1) continue;

    console.log(`\n⚠️  DUPLICATE TOPILDI: "${records[0].name}" — ${records.length} ta yozuv`);

    // Birlamchi employee ni DB dan top
    const primaryEmployee = await Employee.findOne({
      $or: [
        { hikvisionEmployeeId: records[0].hikvisionEmployeeId },
        { hikvisionEmployeeId: records[1].hikvisionEmployeeId },
      ],
    });

    // Birinchi yozuvni asosiy deb olamiz (eng ko'p event bo'lgani)
    records.sort((a, b) => b.events.length - a.events.length);
    const primary = records[0];
    const duplicates = records.slice(1);

    // Duplicate yozuvlardan eventlarni asosiyga ko'chirish
    for (const dup of duplicates) {
      console.log(`   🗑️  Duplicate: hikvisionEmployeeId=${dup.hikvisionEmployeeId}, events=${dup.events.length}`);
      
      for (const event of dup.events) {
        // Bir xil vaqt bo'lmasa qo'shamiz (30 soniya ichida bo'lsa skip)
        const alreadyExists = primary.events.some(
          (e) => Math.abs(new Date(e.timestamp) - new Date(event.timestamp)) < 30000
        );
        if (!alreadyExists) {
          primary.events.push(event);
          console.log(`   ➕ Event qo'shildi: ${event.type} ${event.time}`);
        }
      }

      // Duplicate yozuvni o'chir
      await Attendance.deleteOne({ _id: dup._id });
      console.log(`   ✅ Duplicate o'chirildi: ${dup._id}`);
    }

    // Primary yozuvni primary employee ID bilan yangilash
    if (primaryEmployee) {
      primary.hikvisionEmployeeId = primaryEmployee.hikvisionEmployeeId;
      primary.employeeId = primaryEmployee.employeeId;
      primary.name = primaryEmployee.name;
    }

    // Eventlarni vaqt bo'yicha tartiblaymiz
    primary.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // firstCheckIn va lastCheckOut ni yangilash
    const inEvents = primary.events.filter(e => e.type === "IN");
    const outEvents = primary.events.filter(e => e.type === "OUT");
    if (inEvents.length > 0) primary.firstCheckIn = inEvents[0].time;
    if (outEvents.length > 0) primary.lastCheckOut = outEvents[outEvents.length - 1].time;

    await primary.save();
    console.log(`   ✅ Asosiy yozuv yangilandi: ${primary.name} (${primary.events.length} event)`);
    fixedCount++;
  }

  if (fixedCount === 0) {
    console.log("\n✅ Hech qanday duplicate topilmadi. Ma'lumotlar toza!");
  } else {
    console.log(`\n✅ ${fixedCount} ta xodim uchun duplicate attendance tuzatildi!`);
  }

  await mongoose.disconnect();
  console.log("🔌 MongoDB disconnected");
}

fixDuplicateAttendance().catch((err) => {
  console.error("❌ Xato:", err);
  process.exit(1);
});
