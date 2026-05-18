import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { fetchHikvisionEvents } from "./hikvision-service.js";
import connectDB from "./db/connection.js";
import Employee from "./models/Employee.js";
import Attendance from "./models/Attendance.js";
import { normalizeName } from "./utils/nameHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envLocalPath = path.resolve(__dirname, "./.env.local");
const envPath = path.resolve(__dirname, "./.env");
dotenv.config({ path: envLocalPath });
dotenv.config({ path: envPath });

async function restoreToday() {
    try {
        await connectDB();
        const todayStr = "2026-04-08";
        console.log(`🔄 Attempting to restore events for ${todayStr}...`);

        // 1. Fetch more events from device to ensure we get today's data
        const result = await fetchHikvisionEvents(100);
        if (!result.success) {
            console.error("❌ Failed to fetch events from Hikvision:", result.error);
            process.exit(1);
        }

        const events = result.events;
        console.log(`📥 Received ${events.length} events from device.`);

        // 2. Filter for today's events only
        const todayEvents = events.filter(e => e.time.startsWith(todayStr));
        console.log(`📅 Found ${todayEvents.length} events for today.`);

        if (todayEvents.length === 0) {
            console.log("⚠️ No events found for today on the device.");
            process.exit(0);
        }

        const allEmployees = await Employee.find();

        for (const event of todayEvents) {
            // Find employee by ID or Name
            let employee = allEmployees.find(emp => emp.hikvisionEmployeeId === event.employeeNoString);
            
            if (!employee && event.name) {
                const norm = normalizeName(event.name);
                employee = allEmployees.find(emp => normalizeName(emp.name) === norm);
            }

            if (!employee) {
                console.warn(`  ⚠️ Employee not found for event: ${event.name} (ID: ${event.employeeNoString})`);
                continue;
            }

            const eventDate = new Date(event.time);
            const dateStr = eventDate.toISOString().split("T")[0];
            const timeStr = eventDate.toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Tashkent"
            });

            // Find or create attendance
            let attendance = await Attendance.findOne({
                employeeId: employee.employeeId,
                date: dateStr
            });

            if (!attendance) {
                console.log(`  ➕ Creating new attendance for ${employee.name}`);
                attendance = new Attendance({
                    employeeId: employee.employeeId,
                    hikvisionEmployeeId: employee.hikvisionEmployeeId,
                    name: employee.name,
                    role: employee.role,
                    department: employee.department,
                    date: dateStr,
                    events: [],
                    status: 'present'
                });
            }

            // Add event if not already present
            const alreadyLogged = (attendance.events || []).some(ev => ev.time === timeStr);
            if (!alreadyLogged) {
                console.log(`  📝 Adding event at ${timeStr} for ${employee.name}`);
                attendance.events.push({
                    time: timeStr,
                    type: attendance.events.length % 2 === 0 ? 'IN' : 'OUT',
                    timestamp: eventDate
                });
                
                // Sort and update summary fields
                attendance.events.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
                attendance.firstCheckIn = attendance.events[0].time;
                attendance.lastCheckOut = attendance.events[attendance.events.length - 1].time;
                attendance.status = 'present';
                await attendance.save();
            }
        }

        console.log("\n✅ Restoration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Fatal error during restoration:", err);
        process.exit(1);
    }
}

restoreToday();
