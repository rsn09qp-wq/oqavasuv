import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, './.env') });

import Employee from './models/Employee.js';

const URI = "mongodb://suv:zrFSHCb8MAE4HytX@ac-inwtgvm-shard-00-00.epdgsfw.mongodb.net:27017,ac-inwtgvm-shard-00-01.epdgsfw.mongodb.net:27017,ac-inwtgvm-shard-00-02.epdgsfw.mongodb.net:27017/water_management?ssl=true&replicaSet=atlas-spu9fd-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

function normalizeName(name) {
    if (!name) return "";
    return name.toUpperCase()
        .replace(/X/g, 'H') // Normalize X to H for common Uzbek variations
        .replace(/O'/g, 'O')
        .replace(/G'/g, 'G')
        .replace(/\s+/g, '')
        .trim();
}

async function findGlobalDuplicates() {
    try {
        await mongoose.connect(URI);
        const allEmployees = await Employee.find();
        
        const groups = {};
        allEmployees.forEach(emp => {
            const norm = normalizeName(emp.name);
            if (!groups[norm]) groups[norm] = [];
            groups[norm].push(emp);
        });

        console.log(`\n🔍 Analyzing ${allEmployees.length} employees for potential duplicates...\n`);

        let duplicateCount = 0;
        for (const norm in groups) {
            if (groups[norm].length > 1) {
                duplicateCount++;
                console.log(`⚠️ Possible Duplicate Group: ${norm}`);
                groups[norm].forEach((emp, i) => {
                    console.log(`  ${i+1}. "${emp.name}" (ID: ${emp.hikvisionEmployeeId}, Dept: ${emp.department})`);
                });
                console.log("");
            }
        }

        if (duplicateCount === 0) {
            console.log("✅ No other potential duplicates found.");
        } else {
            console.log(`Total groups with duplicates: ${duplicateCount}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

findGlobalDuplicates();
