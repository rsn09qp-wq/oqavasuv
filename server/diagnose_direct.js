import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, './.env') });

import Employee from './models/Employee.js';

const NEW_URI = "mongodb://suv:zrFSHCb8MAE4HytX@ac-inwtgvm-shard-00-00.epdgsfw.mongodb.net:27017,ac-inwtgvm-shard-00-01.epdgsfw.mongodb.net:27017,ac-inwtgvm-shard-00-02.epdgsfw.mongodb.net:27017/water_management?ssl=true&replicaSet=atlas-spu9fd-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function diagnose() {
    try {
        console.log('Connecting with direct URI...');
        await mongoose.connect(NEW_URI, {
            serverSelectionTimeoutMS: 20000,
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
            console.log(`Role: ${m.role}`);
            console.log(`Status: ${m.status}`);
            console.log(`Created: ${m.createdAt}`);
        });

        const allCount = await Employee.countDocuments();
        console.log(`\nTotal Employees in DB: ${allCount}`);

        process.exit(0);
    } catch (err) {
        console.error('Connection failed again!');
        console.dir(err);
        process.exit(1);
    }
}

diagnose();
