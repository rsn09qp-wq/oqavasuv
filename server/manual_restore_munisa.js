import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./db/connection.js";
import Employee from "./models/Employee.js";
import Attendance from "./models/Attendance.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envLocalPath = path.resolve(__dirname, "./.env.local");
const envPath = path.resolve(__dirname, "./.env");
dotenv.config({ path: envLocalPath });
dotenv.config({ path: envPath });

async function manualRestore() {
    try {
        await connectDB();
        const dateStr = "2026-04-08";
        
        const m = await Employee.findOne({ name: /MUNISA/i });
        if (!m) {
            console.log("Munisa not found");
            process.exit(1);
        }

        console.log(`Manual restoration for ${m.name} on ${dateStr}`);

        let att = await Attendance.findOne({
            employeeId: m.employeeId,
            date: dateStr
        });

        if (!att) {
            att = new Attendance({
                employeeId: m.employeeId,
                hikvisionEmployeeId: m.hikvisionEmployeeId,
                name: m.name,
                role: m.role,
                department: m.department,
                date: dateStr
            });
        }

        const events = [
            {
                time: "09:02",
                type: "IN",
                timestamp: new Date(`${dateStr}T09:02:00`)
            },
            {
                time: "12:14",
                type: "OUT",
                timestamp: new Date(`${dateStr}T12:14:00`)
            }
        ];

        att.events = events;
        att.firstCheckIn = "09:02";
        att.lastCheckOut = "12:14";
        att.status = "present";
        
        await att.save();
        console.log("✅ Munisa attendance restored manually using screenshot data.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

manualRestore();
