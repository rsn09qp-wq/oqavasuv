import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
const Attendance = mongoose.model('Attendance', new mongoose.Schema({}, { strict: false }));

async function runMerge() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const primaryId = '69d484b312bc5df3b9bf839e'; // ABDURAHMANOVA MUNISA
        const secondaryIds = ['69cf7ec25e2afd4bd7a3c28f', '69d3aec6d7856cacd9838f6d'];

        const primaryEmployee = await Employee.findById(primaryId);
        if (!primaryEmployee) {
            console.error('Primary employee not found!');
            process.exit(1);
        }

        console.log(`Primary Employee: ${primaryEmployee.name} (${primaryEmployee._id})`);

        // Update all attendance records for the secondary employees and near-matches
        const attendanceToUpdate = await Attendance.find({
            $or: [
                { employeeId: { $in: secondaryIds } },
                { name: /MUNISA/i },
                { hikvisionEmployeeId: { $in: ['81', 'abdurahmonovamunisa', 'abdurahmanovamunisa'] } }
            ]
        });

        console.log(`Found ${attendanceToUpdate.length} attendance records to potentially update.`);

        for (const record of attendanceToUpdate) {
            console.log(`Updating attendance record for ${record.name} on ${record.date}`);
            record.employeeId = primaryEmployee.employeeId;
            record.hikvisionEmployeeId = primaryEmployee.hikvisionEmployeeId;
            record.name = primaryEmployee.name;
            await record.save();
        }

        // Delete the secondary employees
        const deleteResult = await Employee.deleteMany({ _id: { $in: secondaryIds } });
        console.log(`Deleted ${deleteResult.deletedCount} secondary employee records.`);

        process.exit(0);
    } catch (err) {
        console.error('Error during merge:', err);
        process.exit(1);
    }
}

runMerge();
