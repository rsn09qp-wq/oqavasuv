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

async function report() {
    await connectDB();
    const dates = ["2026-04-07", "2026-04-08"];
    
    const employees = await Employee.find({ name: /MUNISA/i });
    console.log(`Found ${employees.length} Munisa employees`);

    for (const date of dates) {
        console.log(`\n--- Date: ${date} ---`);
        const atts = await Attendance.find({ date });
        const munisaAtts = atts.filter(a => /MUNISA/i.test(a.name));
        
        console.log(`Found ${munisaAtts.length} Munisa attendance records:`);
        munisaAtts.forEach(a => {
            console.log(`  - Record ID: ${a._id}`);
            console.log(`    Name: ${a.name}`);
            console.log(`    EmpID: ${a.employeeId}`);
            console.log(`    HikID: ${a.hikvisionEmployeeId}`);
            console.log(`    Status: ${a.status}`);
            console.log(`    Events Count: ${a.events.length}`);
            console.log(`    Events: ${JSON.stringify(a.events)}`);
            console.log(`    CheckIn: ${a.firstCheckIn}`);
        });
    }

    process.exit(0);
}

report();
