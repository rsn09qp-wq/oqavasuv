import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    department: String,
    salary: {
      type: Number,
      default: 0,
    },
    salaryStatus: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
    salaryMonth: {
      type: String, // Format: "2025-12"
      default: () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      },
    },
    role: {
      type: String,
      enum: ["mutaxassis", "staff", "admin", "ishchi"],
      // Har bir xodimga o'z roli belgilanadi
    },
    // Staff type - xodim lavozimi (erkin matn)
    staffType: {
      type: String,
      default: null,
    },
    faceId: String,
    hikvisionEmployeeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    avatar: String,
    email: String,
    phone: String,

    // Role-ga oid maydonlar
    specialty: String, // Mutaxassislar uchun - mutaxassisligi
    shift: String, // Ishchilar/Qorovullar uchun - smenasi (Kunduzi/Kechqurun/Tungi)
    position: String, // Lavozimi

    // Xodim (ishchi) maydonlari
    uchastka: {
      type: String,
      default: null, // Masalan: "1-uchastka", "2-bo'lim"
    },
    internalId: {
      type: String,
      default: null, // Ichki ID raqami
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    aliases: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
employeeSchema.index({ role: 1, status: 1 });
employeeSchema.index({ name: 'text' });

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
