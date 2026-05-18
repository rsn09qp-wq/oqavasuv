import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, './.env') });

import Employee from './models/Employee.js';

async function diagnoseDuplicates() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const allEmployees = await Employee.find().sort({ name: 1 });
        console.log(`\nTotal Employees: ${allEmployees.length}`);

        const nameGroups = {};
        allEmployees.forEach(emp => {
            if (!nameGroups[emp.name]) {
                nameGroups[emp.name] = [];
            }
            nameGroups[emp.name].push({
                id: emp._id,
                employeeId: emp.employeeId,
                hikvisionEmployeeId: emp.hikvisionEmployeeId,
                department: emp.department
            });
        });

        console.log('\n--- Duplicate Names Report ---');
        let duplicatesFound = false;
        for (const name in nameGroups) {
            if (nameGroups[name].length > 1) {
                duplicatesFound = true;
                console.log(`\nName: ${name}`);
                nameGroups[name].forEach((occ, idx) => {
                    console.log(`  ${idx + 1}. ID: ${occ.id}, EmployeeID: ${occ.employeeId}, HikID: ${occ.hikvisionEmployeeId}, Dept: ${occ.department}`);
                });
            }
        }

        if (!duplicatesFound) {
            console.log('No exact name duplicates found.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

diagnoseDuplicates();
