import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, './.env') });

import Employee from './models/Employee.js';

async function diagnose() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log('Connected.');

        const munisas = await Employee.find({ name: { $regex: /MUNISA/i } });
        console.log(`\nFound ${munisas.length} entries for "MUNISA":`);
        
        munisas.forEach((m, i) => {
            console.log(`\n--- Entry ${i + 1} ---`);
            console.log(`ID: ${m._id}`);
            console.log(`Name: ${m.name}`);
            console.log(`HikID: ${m.hikvisionEmployeeId}`);
            console.log(`EmpID: ${m.employeeId}`);
            console.log(`Dept: ${m.department}`);
            console.log(`Created: ${m.createdAt}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Connection failed!');
        console.dir(err);
        process.exit(1);
    }
}

diagnose();
