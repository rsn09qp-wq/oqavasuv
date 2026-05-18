import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
const Attendance = mongoose.model('Attendance', new mongoose.Schema({}, { strict: false }));

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const emps = await Employee.find({ name: /MUNISA/i });
        const results = [];
        
        for (const e of emps) {
            const att = await Attendance.find({ 
                $or: [ 
                    { employeeId: e._id }, 
                    { hikvisionEmployeeId: e.hikvisionEmployeeId }
                ] 
            });
            results.push({
                _id: e._id,
                name: e.name,
                employeeId: e.employeeId,
                hikvisionEmployeeId: e.hikvisionEmployeeId,
                attendanceCount: att.length
            });
        }
        
        fs.writeFileSync('munisa_data.json', JSON.stringify(results, null, 2));
        console.log('Results written to munisa_data.json');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
