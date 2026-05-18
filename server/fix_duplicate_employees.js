/**
 * fix_duplicate_employees.js
 * Employee kolleksiyasida bir xil ism bo'lgan dublikatlarni birlashtiradi.
 * Barcha attendance yozuvlari ham primary ID ga o'tkaziladi.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Employee from "./models/Employee.js";
import Attendance from "./models/Attendance.js";
import { normalizeName } from "./utils/nameHelper.js";

dotenv.config();

async function fixDuplicateEmployees() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB connected\n");

  const allEmployees = await Employee.find({});
  console.log(`👥 Jami xodimlar: ${allEmployees.length}`);

  // Nom bo'yicha guruhlash
  const groups = {};
  for (const emp of allEmployees) {
    const key = normalizeName(emp.name);
    if (!groups[key]) groups[key] = [];
    groups[key].push(emp);
  }

  let fixedCount = 0;
  for (const [key, records] of Object.entries(groups)) {
    if (records.length <= 1) continue;

    console.log(`\n⚠️  DUPLICATE EMPLOYEE: "${records[0].name}" — ${records.length} ta yozuv`);
    records.forEach((r, i) => {
      console.log(`   ${i + 1}. hikvisionEmployeeId="${r.hikvisionEmployeeId}", _id=${r._id}`);
    });

    // Ko'proq ma'lumoti bo'lgan yoki eski yozuv — primary
    records.sort((a, b) => {
      // Ko'proq maydon to'lgan bo'lsin primary
      const scoreA = [a.department, a.email, a.phone, a.position].filter(Boolean).length;
      const scoreB = [b.department, b.email, b.phone, b.position].filter(Boolean).length;
      if (scoreB !== scoreA) return scoreB - scoreA;
      // Yoki eski ID kichik bo'lsin
      return String(a.hikvisionEmployeeId).length - String(b.hikvisionEmployeeId).length;
    });

    const primary = records[0];
    const duplicates = records.slice(1);

    console.log(`   ✅ PRIMARY: hikvisionEmployeeId="${primary.hikvisionEmployeeId}"`);

    for (const dup of duplicates) {
      console.log(`   🔄 Duplicate ID "${dup.hikvisionEmployeeId}" ni alias sifatida qo'shilmoqda...`);

      // Alias qo'shish
      if (!primary.aliases) primary.aliases = [];
      if (!primary.aliases.includes(dup.hikvisionEmployeeId)) {
        primary.aliases.push(dup.hikvisionEmployeeId);
      }

      // Bu duplicate ID bilan bog'liq barcha attendance ni primary ga o'tkazish
      const dupAttendances = await Attendance.find({
        hikvisionEmployeeId: dup.hikvisionEmployeeId,
      });
      console.log(`   📋 ${dupAttendances.length} ta attendance yozuvi topildi duplicate ID uchun`);

      for (const att of dupAttendances) {
        // Shu kunda primary attendance bormi?
        const primaryAtt = await Attendance.findOne({
          hikvisionEmployeeId: primary.hikvisionEmployeeId,
          date: att.date,
        });

        if (primaryAtt) {
          // Eventlarni birlashtirish
          for (const event of att.events) {
            const alreadyExists = primaryAtt.events.some(
              (e) => Math.abs(new Date(e.timestamp) - new Date(event.timestamp)) < 30000
            );
            if (!alreadyExists) {
              primaryAtt.events.push(event);
            }
          }
          primaryAtt.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          
          const inEvents = primaryAtt.events.filter(e => e.type === "IN");
          const outEvents = primaryAtt.events.filter(e => e.type === "OUT");
          if (inEvents.length > 0) primaryAtt.firstCheckIn = inEvents[0].time;
          if (outEvents.length > 0) primaryAtt.lastCheckOut = outEvents[outEvents.length - 1].time;

          await primaryAtt.save();
          await Attendance.deleteOne({ _id: att._id });
          console.log(`   🔁 ${att.date}: duplicate attendance primary ga birlashtirilddi`);
        } else {
          // Primary attendance yo'q — shu yozuvni primary ga o'tkazamiz
          att.hikvisionEmployeeId = primary.hikvisionEmployeeId;
          att.employeeId = primary.employeeId;
          att.name = primary.name;
          await att.save();
          console.log(`   🔄 ${att.date}: attendance primary ID ga o'tkazildi`);
        }
      }

      // Duplicate employee yozuvini o'chirish
      await Employee.deleteOne({ _id: dup._id });
      console.log(`   🗑️  Duplicate employee o'chirildi: ${dup.name} (${dup.hikvisionEmployeeId})`);
    }

    await primary.save();
    console.log(`   ✅ Primary saqlandi. Aliases: [${primary.aliases.join(", ")}]`);
    fixedCount++;
  }

  if (fixedCount === 0) {
    console.log("\n✅ Hech qanday duplicate employee topilmadi!");
  } else {
    console.log(`\n✅ ${fixedCount} ta xodim uchun duplicate employee tuzatildi!`);
  }

  // Final holatni ko'rsatish
  const finalCount = await Employee.countDocuments({});
  console.log(`\n📊 Endi jami xodimlar: ${finalCount} ta`);

  await mongoose.disconnect();
  console.log("🔌 MongoDB disconnected");
}

fixDuplicateEmployees().catch((err) => {
  console.error("❌ Xato:", err);
  process.exit(1);
});
