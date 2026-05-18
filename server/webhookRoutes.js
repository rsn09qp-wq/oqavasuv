import express from "express";
import multer from "multer";
import Employee from "./models/Employee.js";
import Attendance from "./models/Attendance.js";

const router = express.Router();
const upload = multer(); // For parsing multipart/form-data

/**
 * HTTP Webhook endpoint for Hikvision
 * This endpoint receives HTTP POST notifications from Hikvision device
 * Works with cloud hosting (Render, Heroku, etc)
 */
router.post("/hikvision", upload.any(), async (req, res) => {
  try {
    console.log("📨 Webhook received from Hikvision");
    console.log("=".repeat(60));
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("Files:", req.files ? req.files.length : 0);
    console.log("Form fields:", req.body);
    console.log("=".repeat(60));

    // Hikvision sends data in multipart/form-data
    // Try to parse from form fields or body
    let eventData = req.body;

    // Check if event_log field contains JSON string
    if (req.body.event_log) {
      try {
        const parsedLog = JSON.parse(req.body.event_log);
        eventData = parsedLog;
        console.log("✅ event_log parsed:", parsedLog);
      } catch (e) {
        console.log("Failed to parse event_log:", e.message);
      }
    }

    // Check if data is in a specific field
    if (req.body.data) {
      try {
        eventData =
          typeof req.body.data === "string"
            ? JSON.parse(req.body.data)
            : req.body.data;
      } catch (e) {
        console.log("Failed to parse data field:", e.message);
      }
    }

    // Extract employee info from various possible fields
    // Check nested AccessControllerEvent structure
    const acEvent = eventData.AccessControllerEvent;
    const employeeNo =
      (acEvent && acEvent.employeeNoString) ||
      eventData.employeeNoString ||
      eventData.employeeNo ||
      eventData.EmployeeNoString ||
      eventData.cardNo ||
      req.body.employeeNoString ||
      req.body.employeeNo;

    const eventTime = new Date(
      acEvent?.dateTime ||
        eventData.dateTime ||
        eventData.time ||
        eventData.Time ||
        req.body.time ||
        new Date(),
    );
    const dateStr = eventTime.toISOString().split("T")[0];
    // Convert to Uzbekistan timezone UTC+5
    const timeStr = eventTime.toLocaleTimeString("en-US", {
      timeZone: "Asia/Tashkent",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    console.log("Extracted data:", {
      employeeNo,
      eventTime: eventTime.toISOString(),
      dateStr,
      timeStr,
    });

    if (!employeeNo) {
      console.warn("⚠️  No employee number in webhook data");
      console.log("💡 Terminal oldida yuz taniting va loglarni kuzating...");
      return res
        .status(200)
        .json({ success: false, message: "No employee number" });
    }

    const { normalizeName } = await import("./utils/nameHelper.js");
    const normalizedEmployeeName = acEvent?.name || acEvent?.employeeName || eventData.employeeName || req.body.employeeName;
    const normalizedSearchName = normalizeName(normalizedEmployeeName || "");

    // Find all possible employee records for this person
    const allMatchingEmployees = await Employee.find({
      $or: [
        { hikvisionEmployeeId: employeeNo },
        { aliases: employeeNo },
        { name: new RegExp('^' + (normalizedEmployeeName || "").replace(/[.*+?^${}()|[\]\].*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
      ]
    });

    let employee;
    if (allMatchingEmployees.length > 0) {
      // Pick the oldest record as primary, or the one with specific hikvisionEmployeeId
      employee = allMatchingEmployees.find(e => e.hikvisionEmployeeId === employeeNo) || allMatchingEmployees[0];
      
      // If multiple records exist, merge them!
      if (allMatchingEmployees.length > 1) {
        console.warn(`🤝 AUTO-MERGE: Found ${allMatchingEmployees.length} records for ${employee.name}. Merging...`);
        for (const other of allMatchingEmployees) {
          if (other._id.toString() === employee._id.toString()) continue;
          
          // Merge IDs into aliases
          if (!employee.aliases) employee.aliases = [];
          if (!employee.aliases.includes(other.hikvisionEmployeeId)) {
            employee.aliases.push(other.hikvisionEmployeeId);
          }
          if (other.aliases) {
            other.aliases.forEach(alias => {
              if (!employee.aliases.includes(alias)) employee.aliases.push(alias);
            });
          }
          
          // Migrate attendance records
          await Attendance.updateMany(
            { hikvisionEmployeeId: other.hikvisionEmployeeId },
            { 
              hikvisionEmployeeId: employee.hikvisionEmployeeId,
              employeeId: employee.employeeId,
              name: employee.name
            }
          );
          
          // Delete secondary record
          await Employee.deleteOne({ _id: other._id });
        }
        await employee.save();
        console.log(`✅ Merge completed for ${employee.name}`);
      }
      
      // Ensure the current ID is in aliases
      if (!employee.aliases) employee.aliases = [];
      if (employee.hikvisionEmployeeId !== employeeNo && !employee.aliases.includes(employeeNo)) {
        employee.aliases.push(employeeNo);
        await employee.save();
      }
    }

    if (!employee) {
      // Auto-register new employee from Hikvision data
      const employeeName =
        acEvent?.name ||
        acEvent?.employeeName ||
        eventData.employeeName ||
        req.body.employeeName ||
        "Unknown Employee";

      const normalizedNewName = normalizeName(employeeName);
      const allEmployees = await Employee.find({});
      const existingByName = allEmployees.find((e) => {
        if (!e.name) return false;
        return normalizeName(e.name) === normalizedNewName;
      });

      if (existingByName) {
        console.warn(
          `⚠️ Duplicate detected! ${employeeName} (Terminal ID: ${employeeNo}) is already in database as ${existingByName.name} (DB ID: ${existingByName.hikvisionEmployeeId})`,
        );
        console.log(`📡 Using existing employee record and adding alias.`);
        employee = existingByName;

        // Add to aliases if not already there
        if (!employee.aliases) employee.aliases = [];
        if (!employee.aliases.includes(employeeNo)) {
          employee.aliases.push(employeeNo);
          await employee.save();
          console.log(
            `✅ ID ${employeeNo} added as alias for ${employee.name}`,
          );
        }

        // Broadcast duplicate warning to frontend if needed
        if (global.io) {
          global.io.emit("employee:duplicate_detected", {
            name: employeeName,
            newId: employeeNo,
            existingId: existingByName.hikvisionEmployeeId,
            timestamp: new Date(),
          });
        }
      } else {
        console.log(
          `📝 Yangi xodim avtomatik ro'yhatga olinmoqda: ${employeeName} (${employeeNo})`,
        );

        employee = new Employee({
          employeeId: parseInt(employeeNo) || Date.now(),
          hikvisionEmployeeId: employeeNo,
          name: employeeName,
          role: "staff", // Default role
          department: "IT", // Default department
          status: "active",
          registeredAt: new Date(),
        });

        await employee.save();
        console.log(`✅ Xodim ro'yhatga olingan: ${employee.name}`);
      }
    }

    // ✅ DEDUPLICATION: Find attendance by multiple strategies
    // Strategy 1: By primary hikvisionEmployeeId
    let attendance = await Attendance.findOne({
      hikvisionEmployeeId: employee.hikvisionEmployeeId,
      date: dateStr,
    });

    // Strategy 2: By any alias ID (if employee has multiple IDs)
    if (!attendance && employee.aliases && employee.aliases.length > 0) {
      attendance = await Attendance.findOne({
        hikvisionEmployeeId: { $in: employee.aliases },
        date: dateStr,
      });
      if (attendance) {
        console.log(`📡 Found attendance by alias ID for ${employee.name}, updating to primary ID`);
        attendance.hikvisionEmployeeId = employee.hikvisionEmployeeId;
        attendance.employeeId = employee.employeeId;
      }
    }

    // Strategy 3: By normalized name (catches all remaining duplicates)
    if (!attendance) {
      const { normalizeName } = await import("./utils/nameHelper.js");
      const normalizedEmployeeName = normalizeName(employee.name);
      // Get all attendance for this date and find by name match
      const sameDayAttendances = await Attendance.find({ date: dateStr });
      const foundByName = sameDayAttendances.find(a => normalizeName(a.name) === normalizedEmployeeName);
      if (foundByName) {
        attendance = foundByName;
        console.log(`📡 ⚠️ DUPLICATE PREVENTION: Found attendance by name '${foundByName.name}' for ${employee.name} on ${dateStr}. Merging into existing record.`);
        // Fix the IDs to point to primary employee
        attendance.hikvisionEmployeeId = employee.hikvisionEmployeeId;
        attendance.employeeId = employee.employeeId;
        attendance.name = employee.name;
      }
    }

    if (!attendance) {
      // New check-in - create attendance record
      attendance = new Attendance({
        employeeId: employee.employeeId,
        hikvisionEmployeeId: employee.hikvisionEmployeeId,
        name: employee.name,
        role: employee.role,
        department: employee.department,
        date: dateStr,
        events: [
          {
            time: timeStr,
            type: "IN",
            timestamp: eventTime,
          },
        ],
        firstCheckIn: timeStr,
        status: "present",
      });
      console.log(`✅ ${employee.name} - CHECK IN at ${timeStr}`);
    } else {
      // ✅ Update role and department if they changed in Employee database
      if (
        attendance.role !== employee.role ||
        attendance.department !== employee.department
      ) {
        attendance.role = employee.role;
        attendance.department = employee.department;
      }

      // ✅ Check if this exact event timestamp already exists (prevent double-fire)
      const isDuplicate = attendance.events.some(
        (e) => Math.abs(new Date(e.timestamp) - eventTime) < 30000 // within 30 seconds
      );

      if (isDuplicate) {
        console.log(`⚠️ DUPLICATE EVENT skipped for ${employee.name} at ${timeStr} (already recorded within 30s)`);
        return res.status(200).json({
          success: true,
          message: "Duplicate event ignored",
          employee: employee.name,
          time: timeStr,
        });
      }

      // Sort all events by timestamp to ensure chronological order
      attendance.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Calculate check-in/out times based on actual events
      const inEvents = attendance.events.filter(e => e.type === "IN");
      const outEvents = attendance.events.filter(e => e.type === "OUT");

      if (inEvents.length > 0) {
        attendance.firstCheckIn = inEvents[0].time;
      }
      
      if (outEvents.length > 0) {
        attendance.lastCheckOut = outEvents[outEvents.length - 1].time;
      }

      // Final status logic
      if (attendance.firstCheckIn) {
        attendance.status = "present";
      }
    }

    await attendance.save();
    console.log(`💾 Attendance updated for ${employee.name}. In: ${attendance.firstCheckIn}, Out: ${attendance.lastCheckOut}`);

    // 🔄 Socket.IO - Broadcast real-time update to all clients
    if (global.io) {
      global.io.emit("attendance:updated", {
        employeeId: employee.employeeId,
        name: employee.name,
        hikvisionEmployeeId: employeeNo,
        department: employee.department,
        role: employee.role,
        date: dateStr,
        checkInTime: attendance.firstCheckIn,
        checkOutTime: attendance.lastCheckOut,
        status: attendance.status,
        timestamp: new Date(),
        eventType:
          attendance.events[attendance.events.length - 1]?.type || "IN",
        isNewEmployee: false,
      });

      // If this is a newly registered employee, send special event
      if (employee.registeredAt && new Date() - employee.registeredAt < 5000) {
        global.io.emit("employee:registered", {
          employeeId: employee.employeeId,
          name: employee.name,
          hikvisionEmployeeId: employeeNo,
          department: employee.department,
          role: employee.role,
          avatar:
            employee.name?.split(" ")[0]?.substring(0, 2).toUpperCase() || "?",
        });
        console.log("🎉 Yangi xodim ro'yhatga olingan event yuborildi");
      }

      console.log("📡 Socket.IO broadcast sent");
    }

    res.status(200).json({
      success: true,
      message: "Event processed",
      employee: employee.name,
      time: timeStr,
    });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Test webhook endpoint
 */
router.post("/hikvision/test", async (req, res) => {
  console.log("🧪 Test webhook called");
  console.log("Body:", req.body);
  res.json({
    success: true,
    message: "Webhook endpoint is working!",
    receivedData: req.body,
  });
});

/**
 * Get webhook status
 */
router.get("/hikvision/status", (req, res) => {
  res.json({
    webhook: "active",
    endpoint: "/webhook/hikvision",
    testEndpoint: "/webhook/hikvision/test",
    method: "POST",
    description: "Receives HTTP notifications from Hikvision device",
  });
});

/**
 * Telegram Bot Webhook endpoint
 * This endpoint receives updates from Telegram servers
 * Used in production (Render) to avoid polling conflicts
 */
router.post("/telegram", async (req, res) => {
  try {
    const update = req.body;
    console.log("📨 Telegram webhook update:", JSON.stringify(req.body, null, 2));

    // Return 200 OK immediately as required by Telegram
    res.sendStatus(200);

    if (!update || !update.update_id) {
       console.warn("⚠️ Invalid Telegram update received (Missing update_id)");
       return;
    }

    // Import bot instance dynamically to avoid circular dependency
    const { default: bot } = await import("./services/telegram.service.js");

    if (bot) {
      console.log(`🤖 Processing update ${update.update_id} via ${bot.options.webHook ? 'WEBHOOK' : 'POLLING'}`);
      bot.processUpdate(update);
    } else {
      console.warn("⚠️ Telegram bot instance not found in telegram.service.js");
    }
  } catch (error) {
    console.error("❌ Telegram webhook error:", error);
  }
});

export default router;
