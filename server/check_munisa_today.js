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

async function checkMunisaToday() {
    await connectDB();
    
    // Find Munisa first
    const munisa = await Employee.findOne({ name: /MUNISA/i });
    if (!munisa) {
        console.log("Munisa not found");
        process.exit(0);
    }
    
    console.log(`Checking attendance for ${munisa.name} (EmpID: ${munisa.employeeId}, HikID: ${munisa.hikvisionEmployeeId})`);
    
    const today = "2026-04-08";
    const atts = await Attendance.find({ 
        $or: [
            { employeeId: munisa.employeeId },
            { hikvisionEmployeeId: munisa.hikvisionEmployeeId },
            { name: /MUNISA/i }
        ],
        date: today
    });

    console.log(`Found ${atts.length} attendance records for today`);
    atts.forEach(a => {
        console.log(`Record ID: ${a._id}`);
        console.log(`  Name: ${a.name}`);
        console.log(`  employeeId: ${a.employeeId}`);
        console.log(`  hikvisionEmployeeId: ${a.hikvisionEmployeeId}`);
        console.log(`  Status: ${a.status}`);
        console.log(`  Events: ${JSON.stringify(a.events)}`);
        console.log(`  First: ${a.firstCheckIn}, Last: ${a.lastCheckOut}`);
    });

    process.exit(0);
}

checkMunisaToday();
