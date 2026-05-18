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

async function debugMunisa() {
    await connectDB();
    const today = "2026-04-08";
    
    console.log("--- MUNISA EMPLOYEE ---");
    const m = await Employee.findOne({ name: /MUNISA/i });
    console.log(JSON.stringify(m, null, 2));

    console.log("\n--- MUNISA ATTENDANCE TODAY ---");
    const a = await Attendance.find({ 
        date: today,
        $or: [
            { name: /MUNISA/i },
            { employeeId: m?.employeeId },
            { hikvisionEmployeeId: m?.hikvisionEmployeeId }
        ]
    });
    console.log(JSON.stringify(a, null, 2));

    process.exit(0);
}

debugMunisa();
