import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./db/connection.js";
import Employee from "./models/Employee.js";
import Attendance from "./models/Attendance.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "./.env") });

async function checkIds() {
    await connectDB();
    
    console.log("Checking Employees...");
    const employees = await Employee.find();
    employees.forEach(e => {
        if (typeof e.employeeId !== 'number' || isNaN(e.employeeId)) {
            console.log(`❌ Employee ${e.name} (${e._id}) has invalid employeeId: ${e.employeeId} (${typeof e.employeeId})`);
        }
    });

    console.log("Checking Attendance...");
    const attendance = await Attendance.find();
    attendance.forEach(a => {
        if (typeof a.employeeId !== 'number' || isNaN(a.employeeId)) {
            console.log(`❌ Attendance for ${a.name} on ${a.date} (${a._id}) has invalid employeeId: ${a.employeeId} (${typeof a.employeeId})`);
        }
    });

    console.log("Done.");
    process.exit(0);
}

checkIds();
