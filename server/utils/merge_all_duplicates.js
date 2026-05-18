import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../db/connection.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import { normalizeName } from "./nameHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envLocalPath = path.resolve(__dirname, "../.env.local");
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envLocalPath });
dotenv.config({ path: envPath });

async function mergeAll() {
  try {
    await connectDB();
    const allEmployees = await Employee.find();
    console.log(`Analyzing ${allEmployees.length} employees...`);

    const groups = {};
    allEmployees.forEach(e => {
        const norm = normalizeName(e.name);
        if (!groups[norm]) groups[norm] = [];
        groups[norm].push(e);
    });

    for (const norm in groups) {
        const group = groups[norm];
        if (group.length > 1) {
            console.log(`\nMerging group: ${norm}`);
            
            // Sort to find primary
            group.sort((a,b) => {
                const aHi = a.hikvisionEmployeeId || "";
                const bHi = b.hikvisionEmployeeId || "";
                const aIsNum = !isNaN(aHi) && aHi.length < 10;
                const bIsNum = !isNaN(bHi) && bHi.length < 10;
                if (aIsNum && !bIsNum) return -1;
                if (!aIsNum && bIsNum) return 1;
                return b.updatedAt - a.updatedAt;
            });

            const primary = group[0];
            const secondaries = group.slice(1);
            
            console.log(`  Primary: ${primary.name} (HikID: ${primary.hikvisionEmployeeId}, EmpID: ${primary.employeeId})`);

            for (const secondary of secondaries) {
                console.log(`  Merging secondary: ${secondary.name} (HikID: ${secondary.hikvisionEmployeeId}, EmpID: ${secondary.employeeId})`);
                
                // Find all attendance for this secondary
                const atts = await Attendance.find({
                    $or: [
                        { employeeId: secondary.employeeId },
                        { hikvisionEmployeeId: secondary.hikvisionEmployeeId }
                    ]
                });

                console.log(`    Found ${atts.length} attendance records.`);

                for (const att of atts) {
                    // check if primary already has attendance for this date
                    const existing = await Attendance.findOne({
                        employeeId: primary.employeeId,
                        date: att.date
                    });

                    if (existing) {
                        if (existing._id.toString() === att._id.toString()) continue;
                        
                        // Merge events
                        console.log(`    Merging events for ${att.date}...`);
                        const combinedEvents = [
                            ...(existing.events || []).map(e => e.toObject ? e.toObject() : e), 
                            ...(att.events || []).map(e => e.toObject ? e.toObject() : e)
                        ];
                        const seen = new Set();
                        const unique = [];
                        combinedEvents
                            .map(ev => ({
                                time: ev.time,
                                type: ev.type,
                                timestamp: ev.timestamp ? new Date(ev.timestamp) : new Date()
                            }))
                            .sort((a,b) => a.timestamp - b.timestamp)
                            .filter(ev => ev.time) // Ensure time exists
                            .forEach(ev => {
                                if (!seen.has(ev.time)) {
                                    unique.push(ev);
                                    seen.add(ev.time);
                                }
                            });
                        
                        if (unique.length > 0) {
                            existing.events = unique;
                            existing.firstCheckIn = unique[0].time;
                            existing.lastCheckOut = unique[unique.length - 1].time;
                            existing.status = 'present';
                            
                            try {
                                await existing.save();
                                await Attendance.deleteOne({ _id: att._id });
                            } catch (e) {
                                console.error(`      ❌ Error saving primary attendance: ${e.message}`);
                            }
                        } else {
                            console.log(`    ⚠️ No valid events found to merge for ${att.date}`);
                            // If no events but record exists, maybe just update IDs for now
                            await Attendance.deleteOne({ _id: att._id });
                        }
                    } else {
                        // Update secondary record to primary
                        try {
                            att.employeeId = primary.employeeId;
                            att.hikvisionEmployeeId = primary.hikvisionEmployeeId;
                            att.name = primary.name;
                            att.department = primary.department;
                            att.role = primary.role;
                            await att.save();
                        } catch (e) {
                            console.error(`      ❌ Error updating secondary attendance: ${e.message}`);
                        }
                    }
                }
                
                // Delete secondary employee
                await Employee.deleteOne({ _id: secondary._id });
                console.log(`    Deleted secondary employee ${secondary._id}`);
            }
        }
    }

    console.log("\nAll done!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

mergeAll();
