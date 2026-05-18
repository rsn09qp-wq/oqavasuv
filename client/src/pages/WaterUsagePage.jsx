import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  Users,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  Edit2,
  FileText,
  MoreVertical,
  User,
} from "lucide-react";
import { io } from "socket.io-client";
import RoleSelectionModal from "../components/RoleSelectionModal.jsx"; // ✅ YANGI CHIROYLI MODAL
import EmployeeEditModal from "../components/EmployeeEditModal.jsx"; // ✅ EMPLOYEE EDIT MODAL
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_URL as BASE_URL } from "../config";
import * as XLSX from "xlsx";

const API_URL = BASE_URL;

const WaterUsagePage = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [searchQuery, setSearchQuery] = useState(""); // Xodim qidirish
  const [selectedStatus, setSelectedStatus] = useState(""); // Status filter
  const [sortBy, setSortBy] = useState("name"); // New: sort by
  const [sortOrder, setSortOrder] = useState("asc"); // New: sort order
  const [water_usageData, setwater_usageData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // 📊 Kechikish hisoblash funksiyasi (9:30 asosida)
  const calculateLateInfo = (checkInTime) => {
    if (!checkInTime) return { isLate: false, lateMinutes: 0, lateText: "" };

    const LATE_THRESHOLD_HOUR = 9;
    const LATE_THRESHOLD_MINUTE = 30;

    let hours, minutes;

    // ISO date string ni parse qilish ("2026-04-13T07:42:00.000Z" yoki "07:42" format)
    if (checkInTime.includes && checkInTime.includes("T")) {
      // ISO format - local vaqtga o'girish
      const date = new Date(checkInTime);
      if (isNaN(date.getTime())) return { isLate: false, lateMinutes: 0, lateText: "" };
      hours = date.getHours();
      minutes = date.getMinutes();
    } else if (typeof checkInTime === 'string') {
      // Oddiy "HH:MM" format
      const parts = checkInTime.split(":");
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    } else {
        return { isLate: false, lateMinutes: 0, lateText: "" };
    }

    if (isNaN(hours) || isNaN(minutes)) return { isLate: false, lateMinutes: 0, lateText: "" };

    const checkInMinutes = hours * 60 + minutes;
    const thresholdMinutes = LATE_THRESHOLD_HOUR * 60 + LATE_THRESHOLD_MINUTE;

    if (checkInMinutes > thresholdMinutes) {
      const lateMinutes = checkInMinutes - thresholdMinutes;
      const lateHours = Math.floor(lateMinutes / 60);
      const remainingMinutes = lateMinutes % 60;

      let lateText = "";
      if (lateHours > 0) {
        lateText = `${lateHours} soat ${remainingMinutes} daq`;
      } else {
        lateText = `${lateMinutes} daqiqa`;
      }

      return { isLate: true, lateMinutes, lateText };
    }

    return { isLate: false, lateMinutes: 0, lateText: "" };
  };

  // 📊 Erta ketganlikni hisoblash (18:00 asosida)
  const calculateEarlyLeaveInfo = (checkOutTime) => {
    if (!checkOutTime) return { isEarly: false, earlyMinutes: 0, earlyText: "" };

    const EARLY_THRESHOLD_HOUR = 18;
    const EARLY_THRESHOLD_MINUTE = 0;

    let hours, minutes;

    // ISO date string ni parse qilish
    if (checkOutTime.includes && checkOutTime.includes("T")) {
      const date = new Date(checkOutTime);
      if (isNaN(date.getTime())) return { isEarly: false, earlyMinutes: 0, earlyText: "" };
      hours = date.getHours();
      minutes = date.getMinutes();
    } else if (typeof checkOutTime === 'string') {
      const parts = checkOutTime.split(":");
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    } else {
      return { isEarly: false, earlyMinutes: 0, earlyText: "" };
    }

    if (isNaN(hours) || isNaN(minutes)) return { isEarly: false, earlyMinutes: 0, earlyText: "" };

    const checkOutMinutes = hours * 60 + minutes;
    const thresholdMinutes = EARLY_THRESHOLD_HOUR * 60 + EARLY_THRESHOLD_MINUTE;

    if (checkOutMinutes < thresholdMinutes) {
      const earlyMinutes = thresholdMinutes - checkOutMinutes;
      const earlyHours = Math.floor(earlyMinutes / 60);
      const remainingMinutes = earlyMinutes % 60;

      let earlyText = "";
      if (earlyHours > 0) {
        earlyText = `${earlyHours} soat ${remainingMinutes} daq`;
      } else {
        earlyText = `${earlyMinutes} daqiqa`;
      }

      return { isEarly: true, earlyMinutes, earlyText };
    }

    return { isEarly: false, earlyMinutes: 0, earlyText: "" };
  };

  // Mock data
  const mockwater_usageData = [
    {
      id: 1,
      name: "Ahmad Karimov",
      class: "10-A",
      checkIn: "08:15",
      checkOut: "14:30",
      status: "present",
      avatar: "AK",
      lateMinutes: 0,
    },
    {
      id: 2,
      name: "Malika Tosheva",
      class: "11-B",
      checkIn: "08:10",
      checkOut: "14:25",
      status: "present",
      avatar: "MT",
      lateMinutes: 0,
    },
    {
      id: 3,
      name: "Bobur Rashidov",
      class: "9-A",
      checkIn: "08:35",
      checkOut: null,
      status: "late",
      avatar: "BR",
      lateMinutes: 35,
    },
    {
      id: 4,
      name: "Nigora Saidova",
      class: "10-C",
      checkIn: null,
      checkOut: null,
      status: "absent",
      avatar: "NS",
      lateMinutes: 0,
    },
    {
      id: 5,
      name: "Anvar Abdullayev",
      class: "11-A",
      checkIn: "08:05",
      checkOut: "14:20",
      status: "present",
      avatar: "AA",
      lateMinutes: 0,
    },
  ];

  // Mock classes list - now fetched dynamically from students

  useEffect(() => {
    fetchEmployees();

    // Socket.IO real-time updates uchun
    const socket = io(BASE_URL);

    // ✅ YANGI: Davomat yangilanganida (keldi/ketdi) real-time ko'rsatish
    socket.on("attendance:updated", (data) => {
      console.log("⚡ attendance:updated received in WaterUsagePage:", data);
      setwater_usageData((prev) =>
        prev.map((emp) => {
          // hikvisionEmployeeId yoki name bo'yicha moslashtirish
          const hikMatch =
            emp.hikvisionEmployeeId?.toString() === data.hikvisionEmployeeId?.toString() ||
            emp.employeeId?.toString() === data.hikvisionEmployeeId?.toString();
          const nameMatch =
            emp.name?.toLowerCase() === data.name?.toLowerCase();

          if (hikMatch || nameMatch) {
            console.log(`✅ Real-time update in WaterUsage: ${emp.name} → checkIn=${data.checkInTime}, checkOut=${data.checkOutTime}`);
            return {
              ...emp,
              checkIn: data.checkInTime || emp.checkIn,
              checkOut: data.checkOutTime || emp.checkOut,
              status: data.checkInTime ? "present" : emp.status,
            };
          }
          return emp;
        })
      );
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  // Следим за изменением выбранной даты
  useEffect(() => {
    if (employees.length > 0) {
      fetchwater_usageDataWithEmployees(employees);
    }
  }, [selectedDate, employees]);

  // 📥 Загрузка данных посещаемости (с уже загруженными сотрудниками)
  const fetchwater_usageDataWithEmployees = async (employeesList) => {
    try {
      console.log(`📊 Loading water_usage data for date: ${selectedDate}`);
      const response = await axios.get(
        `${API_URL}/api/water_usage?date=${selectedDate}`,
      );

      const water_usageRecords = response.data.data || [];
      console.log(`📋 Found ${water_usageRecords.length} water_usage records`);
      console.log(`👥 Employees list has ${employeesList.length} employees`);

      // Debug: показать первые записи
      if (water_usageRecords.length > 0) {
        console.log("📝 First water_usage record:", water_usageRecords[0]);
      }
      if (employeesList.length > 0) {
        console.log("👤 First employee:", employeesList[0]);
      }

      // Обновляем данные с информацией о посещаемости
      const updatedData = employeesList.map((employee) => {
        // Ищем запись посещаемости для этого сотрудника по разным полям
        const water_usage = water_usageRecords.find((record) => {
          // Сопоставление по hikvisionEmployeeId
          const empHikId = employee.employeeId?.toString();
          const recHikId = record.hikvisionEmployeeId?.toString();
          const recEmpId = record.employeeId?.toString();

          // Debug logging for ishchi role
          if (employee.role === "ishchi") {
            console.log(`🔍 [water_usage] Matching ishchi ${employee.name}:`, {
              empHikId,
              recHikId,
              recEmpId,
              recordName: record.name,
              employeeName: employee.name,
            });
          }

          const match =
            (recHikId && empHikId && recHikId === empHikId) ||
            (recEmpId && empHikId && recEmpId === empHikId) ||
            (record.name &&
              employee.name &&
              record.name.toLowerCase() === employee.name.toLowerCase());

          if (match && employee.role === "ishchi") {
            console.log(
              `✅ [water_usage] Match found for ishchi ${employee.name}`,
            );
          }

          return match;
        });

        if (water_usage) {
          console.log(
            `✅ Found water_usage for ${employee.name}: checkIn=${water_usage.checkIn}, checkOut=${water_usage.checkOut}`,
          );
          return {
            ...employee,
            checkIn: water_usage.checkIn || null,
            checkOut: water_usage.checkOut || null,
            status: water_usage.checkIn ? "present" : "absent",
            lateMinutes: water_usage.lateMinutes || 0,
          };
        }

        return {
          ...employee,
          checkIn: null,
          checkOut: null,
          status: "absent",
          lateMinutes: 0,
        };
      });

      setwater_usageData(updatedData);
    } catch (error) {
      console.error("❌ Error loading water_usage data:", error);
    }
  };

  // Форматирование времени
  const formatTime = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return null;
    }
  };

  // 📥 Загрузка данных посещаемости
  const fetchwater_usageData = async () => {
    try {
      console.log(`📊 Loading water_usage data for date: ${selectedDate}`);
      const response = await axios.get(
        `${API_URL}/api/water_usage?date=${selectedDate}`,
      );

      const water_usageRecords = response.data.records || [];
      console.log(`📋 Found ${water_usageRecords.length} water_usage records`);

      // Обновляем существующие данные с информацией о посещаемости
      setwater_usageData((prevData) =>
        prevData.map((employee) => {
          // Ищем запись посещаемости для этого сотрудника
          const water_usage = water_usageRecords.find(
            (record) =>
              record.hikvisionEmployeeId === employee.employeeId ||
              record.employeeId === employee.employeeId,
          );

          if (water_usage) {
            return {
              ...employee,
              checkIn: water_usage.firstCheckIn
                ? (() => {
                  const date = new Date(water_usage.firstCheckIn);
                  return isNaN(date.getTime())
                    ? null
                    : date.toLocaleTimeString("uz-UZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                })()
                : null,
              checkOut: water_usage.lastCheckOut
                ? (() => {
                  const date = new Date(water_usage.lastCheckOut);
                  return isNaN(date.getTime())
                    ? null
                    : date.toLocaleTimeString("uz-UZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                })()
                : null,
              status: water_usage.firstCheckIn ? "present" : "absent",
              lateMinutes: water_usage.lateMinutes || 0,
            };
          }

          // Если записи нет, сбрасываем на absent
          return {
            ...employee,
            checkIn: null,
            checkOut: null,
            status: "absent",
            lateMinutes: 0,
          };
        }),
      );
    } catch (error) {
      console.error("❌ Error loading water_usage data:", error);
      toast.error("Ошибка загрузки данных посещаемости");
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      // Faqat bitta API'dan barcha xodimlarni olish
      console.log("📡 Fetching all employees from /api/all-staff...");
      const response = await axios.get(`${API_URL}/api/all-staff`);

      const allEmployees = response.data.employees || [];
      console.log(`📊 Loaded ${allEmployees.length} employees from API`);

      // Debug: Show first few employees
      if (allEmployees.length > 0) {
        console.log(
          "📋 Sample employees:",
          allEmployees.slice(0, 3).map((emp) => ({
            name: emp.name,
            role: emp.role || "NO_ROLE",
          })),
        );
      }

      // Barcha xodimlarni use qilish - filtr yo'q
      const ishchilar = allEmployees.filter((emp) => emp.role === "ishchi");
      const mutaxassislar = allEmployees.filter((emp) => emp.role === "mutaxassis");
      const staffList = allEmployees.filter((emp) => emp.role === "staff");
      const unassigned = allEmployees.filter((emp) => !emp.role);

      console.log(
        `📈 Roles: Ishchilar=${ishchilar.length}, Mutaxassislar=${mutaxassislar.length}, Staff=${staffList.length}, Unassigned=${unassigned.length}`,
      );

      // Ma'lumotlarni saqlash va water_usage formatiga o'tkazish
      console.log("📊 Ma'lumotlar yuklandi:", {
        ishchilar: ishchilar.length,
        mutaxassislar: mutaxassislar.length,
        staff: staffList.length,
        unassigned: unassigned.length,
        total: allEmployees.length,
      });

      // Faqat staff xodimlarni saqlash
      const staffOnly = allEmployees.filter(
        (emp) =>
          emp.role === "staff" || emp.role === null || emp.role === undefined,
      );
      setEmployees(staffOnly);

      // Classes not needed for water organization

      // Convert all staff to water_usage format
      const water_usageList = allEmployees.map((employee) => {
        // Use staffType as department display, fallback to department or "IT"
        const department = employee.staffType || employee.department || "IT";

        return {
          id: employee._id,
          name: employee.name,
          department: department,
          staffType: employee.staffType || employee.department || "IT",
          phone: employee.phone || "",
          role: "staff",
          employeeId: employee.employeeId,
          hikvisionEmployeeId: employee.hikvisionEmployeeId,
          checkIn: null,
          checkOut: null,
          status: "absent",
          avatar:
            employee.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "??",
          lateMinutes: 0,
        };
      });

      setwater_usageData(water_usageList);

      // После загрузки сотрудников, загружаем данные посещаемости
      setTimeout(() => {
        fetchwater_usageDataWithEmployees(water_usageList);
      }, 100);
    } catch (error) {
      console.error("❌ Ma'lumotlarni yuklashda xato:", error);
      toast.error("Ma'lumotlarni yuklashda xato");
    } finally {
      setLoading(false);
    }
  };





  const handleEditEmployee = (employee) => {
    // Close all dropdowns first
    document.querySelectorAll(".action-dropdown").forEach((d) => d.classList.add("hidden"));

    // Use employee data directly
    setSelectedEmployee(employee);
    setEditModalOpen(true);
  };

  const handleSaveEmployee = async (updatedEmployee) => {
    try {
      console.log("💾 [FRONTEND] Employee saqlash boshlandi:", {
        id: updatedEmployee._id || updatedEmployee.id,
        name: updatedEmployee.name,
        phone: updatedEmployee.phone,
        staffType: updatedEmployee.staffType,
      });

      // 1. Server'ga API so'rov yuborish
      const employeeId = updatedEmployee.id || updatedEmployee._id;
      console.log("🆔 Employee ID:", employeeId, "from:", updatedEmployee);

      const saveResponse = await axios.put(
        `${API_URL}/api/employee/${employeeId}`,
        {
          phone: updatedEmployee.phone,
          staffType: updatedEmployee.staffType,
          department: updatedEmployee.department,
        },
      );

      console.log("✅ [FRONTEND] Server javob:", saveResponse.data);

      // 2. Local state'ni yangilash - telefon va lavozim bilan
      setwater_usageData((prevData) =>
        prevData.map((emp) => {
          if (emp.id === employeeId) {
            return {
              ...emp,
              phone: updatedEmployee.phone,
              staffType: updatedEmployee.staffType,
              department: updatedEmployee.staffType || emp.department,
            };
          }
          return emp;
        }),
      );

      // 3. Server'dan yangilangan ma'lumotlarni qayta yuklash
      console.log("🔄 [FRONTEND] Ma'lumotlarni qayta yuklash...");
      await fetchEmployees();

      setEditModalOpen(false);
      setSelectedEmployee(null);

      toast.success(`✅ ${updatedEmployee.name} ma'lumotlari yangilandi!`, {
        duration: 3000,
      });

      console.log("🎉 [FRONTEND] Employee saqlash yakunlandi!");
    } catch (error) {
      console.error("❌ [FRONTEND] Employee saqlashda xato:", error);

      // User-friendly error message
      if (error.response && error.response.status === 404) {
        toast.error("❌ Xodim topilmadi!");
      } else if (error.response && error.response.status >= 500) {
        toast.error("❌ Server xatosi! Qayta urinib ko'ring.");
      } else {
        toast.error("❌ Ma'lumotlar saqlanmadi! Qayta urinib ko'ring.");
      }
      toast.error("Ma'lumotlarni yangilashda xato");
    }
  };

  // Filter water_usage data - only staff employees
  let filteredAndSortedwater_usage = water_usageData.filter((person) => {
    // Filter by search query (name)
    const matchesSearch =
      searchQuery === "" ||
      person.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.employeeNo?.toString().includes(searchQuery);

    // Filter by status (calculateLateInfo orqali - status maydoniga bog'liq emas)
    let matchesStatus = selectedStatus === "";
    if (!matchesStatus) {
      if (selectedStatus === "late") {
        matchesStatus = !!person.checkIn && calculateLateInfo(person.checkIn).isLate;
      } else if (selectedStatus === "present") {
        matchesStatus = !!person.checkIn && !calculateLateInfo(person.checkIn).isLate;
      } else if (selectedStatus === "early") {
        matchesStatus = !!person.checkOut && calculateEarlyLeaveInfo(person.checkOut).isEarly;
      } else if (selectedStatus === "absent") {
        matchesStatus = !person.checkIn;
      }
    }

    return matchesSearch && matchesStatus;
  });

  // Sort the filtered data
  filteredAndSortedwater_usage.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name?.localeCompare(b.name || "") || 0;
        break;
      case "role":
        const roleA = a.role || "";
        const roleB = b.role || "";
        comparison = roleA.localeCompare(roleB);
        break;
      case "class":
        const classA = a.class || "";
        const classB = b.class || "";
        comparison = classA.localeCompare(classB);
        break;
      case "status":
        const statusA = a.status || "";
        const statusB = b.status || "";
        comparison = statusA.localeCompare(statusB);
        break;
      case "department":
        const deptA = a.staffType || a.department || "";
        const deptB = b.staffType || b.department || "";
        comparison = deptA.localeCompare(deptB);
        break;
      default:
        break;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });

  // ✅ DEDUPLICATION: Bir xil nomli xodimlarni birlashtirish (frontend display)
  const seenNames = new Set();
  const dedupedwater_usage = filteredAndSortedwater_usage.filter((emp) => {
    const normalizedName = emp.name?.trim().toLowerCase();
    if (!normalizedName || seenNames.has(normalizedName)) return false;
    seenNames.add(normalizedName);
    return true;
  });
  const filteredwater_usage = dedupedwater_usage;

  // Pagination logic
  const totalItems = filteredwater_usage.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedwater_usage = filteredwater_usage.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedDate]);

  // Faqat staff (hodim) bilan ishlash

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4" />;
      case "late":
        return <AlertCircle className="w-4 h-4" />;
      case "absent":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "present":
        return "Keldi";
      case "late":
        return "Kech keldi";
      case "early":
        return "Erta ketdi";
      case "absent":
        return "Kelmadi";
      default:
        return "Noma'lum";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-green-50 text-green-700";
      case "late":
        return "bg-orange-50 text-orange-700";
      case "absent":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  // Statistics based on FILTERED water_usage
  const totalEmployeesCount = filteredwater_usage.length;
  // Kechikish to'g'ridan-to'g'ri calculateLateInfo orqali hisoblanadi (status maydoniga bog'liq emas)
  const lateEmployeesCount = filteredwater_usage.filter(
    (s) => s.checkIn && calculateLateInfo(s.checkIn).isLate
  ).length;
  const presentEmployeesCount = filteredwater_usage.filter(
    (s) => s.checkIn && !calculateLateInfo(s.checkIn).isLate
  ).length;
  const absentEmployeesCount = filteredwater_usage.filter(
    (s) => !s.checkIn
  ).length;
  const earlyEmployeesCount = filteredwater_usage.filter(
    (s) => s.checkOut && calculateEarlyLeaveInfo(s.checkOut).isEarly
  ).length;

  // Calculate percentage
  const water_usagePercentage =
    totalEmployeesCount > 0
      ? Math.round(((presentEmployeesCount + lateEmployeesCount) / totalEmployeesCount) * 100)
      : 0;

  // 📊 Excel hisobotini yaratish
  const generateExcelReport = async (reportType, data, filename) => {
    try {
      // Ma'lumotlarni tayyorlash - faqat staff uchun
      const excelData = data.map((record) => {
        const lateInfo = calculateLateInfo(record.checkIn);
        return {
          "Xodim Ismi": record.name || "Noma'lum",
          "Bo'lim": record.department || "IT",
          "Kelgan vaqti": record.checkIn || "Kelmagan",
          "Ketgan vaqti": record.checkOut || "Ketmagan",
          Status: lateInfo.isLate
            ? "Kech keldi"
            : calculateEarlyLeaveInfo(record.checkOut).isEarly
              ? "Erta ketdi"
              : record.status === "present"
                ? "Keldi"
                : "Kelmadi",
          Sana: selectedDate,
        };
      });

      // Создание workbook и worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Ustun kengliklarini sozlash
      const wscols = [
        { wch: 28 }, // Xodim Ismi
        { wch: 12 }, // Bo'lim
        { wch: 14 }, // Kelgan vaqti
        { wch: 14 }, // Ketgan vaqti
        { wch: 12 }, // Status
        { wch: 18 }, // Kechikish (text)
        { wch: 16 }, // Kechikish (minut)
        { wch: 12 }, // Sana
      ];
      ws["!cols"] = wscols;

      // Добавляем worksheet в workbook
      XLSX.utils.book_append_sheet(wb, ws, reportType);

      // Генерируем Excel файл
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Создаем download link
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Также отправляем на сервер для сохранения на C: диске
      await saveReportToServer(filename, excelBuffer);

      toast.success(`📊 ${reportType} отчет сохранен: ${filename}`);
    } catch (error) {
      console.error("Ошибка создания Excel отчета:", error);
      toast.error("Ошибка при создании отчета");
    }
  };

  // 💾 Сохранение отчета на сервере (C:/hisobot/)
  const saveReportToServer = async (filename, excelBuffer) => {
    try {
      const formData = new FormData();
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      formData.append("excelFile", blob, filename);
      formData.append("reportDate", selectedDate);

      await axios.post(`${API_URL}/api/reports/save-excel`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error("Ошибка сохранения на сервере:", error);
    }
  };

  // 🕰️ Автоматический экспорт в 19:00
  useEffect(() => {
    const scheduleAutoExport = () => {
      const now = new Date();
      const exportTime = new Date();
      exportTime.setHours(19, 0, 0, 0); // 19:00:00

      // Если время уже прошло, планируем на следующий день
      if (now > exportTime) {
        exportTime.setDate(exportTime.getDate() + 1);
      }

      const timeUntilExport = exportTime.getTime() - now.getTime();
      console.log(
        `⏰ Автоэкспорт запланирован через ${Math.round(
          timeUntilExport / 1000 / 60,
        )} минут`,
      );

      setTimeout(async () => {
        try {
          // Получаем актуальные данные за сегодня
          const currentDate = new Date().toISOString().split("T")[0];
          const allEmployeesResponse = await axios.get(
            `${API_URL}/api/all-staff`,
          );
          const water_usageResponse = await axios.get(
            `${API_URL}/api/water_usage?date=${currentDate}`,
          );

          const employees = allEmployeesResponse.data.employees || [];
          const water_usageRecords = water_usageResponse.data.records || [];

          // Genuinely group by roles
          const ishchilar = employees.filter((emp) => emp.role === "ishchi");
          const mutaxassislar = employees.filter((emp) => emp.role === "mutaxassis");
          const staff = employees.filter((emp) => emp.role === "staff");

          // Формируем данные с посещаемостью
          const processGroup = (group) => {
            return group.map((emp) => {
              const water_usage = water_usageRecords.find(
                (att) => att.hikvisionEmployeeId === emp.hikvisionEmployeeId,
              );
              return {
                ...emp,
                checkIn: water_usage?.firstCheckIn || null,
                checkOut: water_usage?.lastCheckOut || null,
                status: water_usage ? "present" : "absent",
                lateMinutes: 0, // можно добавить логику подсчета опозданий
              };
            });
          };

          const ishchiData = processGroup(ishchilar);
          const mutaxassisData = processGroup(mutaxassislar);
          const staffData = processGroup(staff);

          // Генерируем отчеты
          if (ishchiData.length > 0) {
            await generateExcelReport(
              "Ishchilar",
              ishchiData,
              `Ishchilar_Hisoboti_${currentDate}.xlsx`,
            );
          }

          if (mutaxassisData.length > 0) {
            await generateExcelReport(
              "Mutaxassislar",
              mutaxassisData,
              `Mutaxassislar_Hisoboti_${currentDate}.xlsx`,
            );
          }

          if (staffData.length > 0) {
            await generateExcelReport(
              "Xodimlar",
              staffData,
              `Xodimlar_Hisoboti_${currentDate}.xlsx`,
            );
          }

          toast.success("🎉 Avtomatik hisobot yaratildi!");

          // Планируем следующий экспорт
          scheduleAutoExport();
        } catch (error) {
          console.error("Ошибка автоэкспорта:", error);
          toast.error("Ошибка автоматического экспорта");
        }
      }, timeUntilExport);
    };

    scheduleAutoExport();
  }, []); // Запускаем один раз при загрузке компонента

  // 📤 Ручной экспорт по кнопке
  const handleManualExport = async () => {
    try {
      // Группируем текущие данные по ролям
      const ishchilar = filteredAndSortedwater_usage.filter(
        (emp) => emp.role === "ishchi",
      );
      const mutaxassislar = filteredAndSortedwater_usage.filter(
        (emp) => emp.role === "mutaxassis",
      );
      const staff = filteredAndSortedwater_usage.filter((emp) => emp.role === "staff");

      const currentDate = new Date().toISOString().split("T")[0];

      if (ishchilar.length > 0) {
        await generateExcelReport(
          "Ishchilar",
          ishchilar,
          `Ishchilar_Manual_${currentDate}.xlsx`,
        );
      }

      if (mutaxassislar.length > 0) {
        await generateExcelReport(
          "Mutaxassislar",
          mutaxassislar,
          `Mutaxassislar_Manual_${currentDate}.xlsx`,
        );
      }

      if (staff.length > 0) {
        await generateExcelReport(
          "Xodimlar",
          staff,
          `Xodimlar_Manual_${currentDate}.xlsx`,
        );
      }

      toast.success("📊 Hisobot yaratildi!");
    } catch (error) {
      console.error("Ошибка ручного экспорта:", error);
      toast.error("Ошибка ручного экспорта");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 md:px-6 py-4 md:py-6 transition-colors duration-300">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:items-center sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight transition-colors">Davomat</h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 mt-1">
              Xodimlar davomat qaydlarini real-vaqtda kuzatish
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleManualExport}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 dark:bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 dark:hover:bg-emerald-500 transition-colors shadow-sm shadow-emerald-900/10 dark:shadow-none"
            >
              <FileText className="w-4 h-4" />
              <span>Excel Export</span>
            </button>
          </div>
        </div>





        {/* Stats Cards - Dashboard style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {/* Jami */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors">
                <Users className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 transition-colors">
                100%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{totalEmployeesCount}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Jami</p>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 transition-colors">
              <span className="text-xs text-gray-500 dark:text-slate-500">Ro'yxat:</span>
              <span className="text-sm font-semibold text-gray-600 dark:text-slate-400">
                {totalEmployeesCount} ta
              </span>
            </div>
          </div>

          {/* Keldi */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg transition-colors">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 transition-colors">
                {totalEmployeesCount > 0
                  ? Math.round((presentEmployeesCount / totalEmployeesCount) * 100)
                  : 0}
                %
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
              {presentEmployeesCount}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Keldi</p>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 transition-colors">
              <span className="text-xs text-gray-500 dark:text-slate-500">Hozir:</span>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {presentEmployeesCount} ta
              </span>
            </div>
          </div>

          {/* Kech */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg transition-colors">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 transition-colors">
                {totalEmployeesCount > 0
                  ? Math.round((lateEmployeesCount / totalEmployeesCount) * 100)
                  : 0}
                %
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{lateEmployeesCount}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Kech</p>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 transition-colors">
              <span className="text-xs text-gray-500 dark:text-slate-500">Kechikkan:</span>
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {lateEmployeesCount} ta
              </span>
            </div>
          </div>

          {/* Yo'q */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg transition-colors">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-400 transition-colors">
                {totalEmployeesCount > 0
                  ? Math.round((absentEmployeesCount / totalEmployeesCount) * 100)
                  : 0}
                %
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{absentEmployeesCount}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Yo'q</p>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 transition-colors">
              <span className="text-xs text-gray-500 dark:text-slate-500">Kelmagan:</span>
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                {absentEmployeesCount} ta
              </span>
            </div>
          </div>

          {/* Erta ketgan */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg transition-colors">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 transition-colors">
                {totalEmployeesCount > 0
                  ? Math.round((earlyEmployeesCount / totalEmployeesCount) * 100)
                  : 0}
                %
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{earlyEmployeesCount}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Erta ketgan</p>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 transition-colors">
              <span className="text-xs text-gray-500 dark:text-slate-500">Vaqtliroq:</span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {earlyEmployeesCount} ta
              </span>
            </div>
          </div>

          {/* Davomat % */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors lg:col-span-1 xl:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg transition-colors">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${water_usagePercentage >= 90
                  ? "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                  : water_usagePercentage >= 70
                    ? "bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"
                    : "bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-400"
                  }`}
              >
                {water_usagePercentage >= 90
                  ? "Yaxshi"
                  : water_usagePercentage >= 70
                    ? "O'rtacha"
                    : "Past"}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
              {water_usagePercentage}%
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Davomat</p>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 transition-colors">
              <span className="text-xs text-gray-500 dark:text-slate-500">Foiz:</span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {water_usagePercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar - Optimized for mobile */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm transition-colors">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4.5 h-4.5 text-gray-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Xodimlarni qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 md:flex-none px-3 py-2.5 bg-white dark:bg-slate-900 text-sm border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              >
                <option value="">Barcha holatlar</option>
                <option value="present">Kelganlar</option>
                <option value="late">Kech qolganlar</option>
                <option value="early">Erta ketganlar</option>
                <option value="absent">Kelmaganlar</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 md:flex-none px-3 py-2.5 bg-white dark:bg-slate-900 text-sm border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              >
                <option value="name">Ism bo'yicha</option>
                <option value="status">Status bo'yicha</option>
                <option value="department">Bo'lim bo'yicha</option>
              </select>

              {/* Date Filter */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 md:flex-none px-3 py-2.5 bg-white dark:bg-slate-900 text-sm border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />

              {/* Reset Button */}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("");
                  setSortBy("name");
                  setSortOrder("asc");
                  setSelectedDate(new Date().toISOString().split("T")[0]);
                }}
                className="p-2.5 text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                title="Tozalash"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section - Responsive Table/Cards */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                  <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Xodim Ismi
                  </th>
                  <th className="text-center py-4 px-6 font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Bo'lim
                  </th>
                  <th className="text-center py-4 px-6 font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Kelgan
                  </th>
                  <th className="text-center py-4 px-6 font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Ketgan
                  </th>
                  <th className="text-center py-4 px-6 font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Status
                  </th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {paginatedwater_usage.map((employee) => {
                  const lateInfo = calculateLateInfo(employee.checkIn);
                  const earlyInfo = calculateEarlyLeaveInfo(employee.checkOut);
                  return (
                    <tr
                      key={employee.id}
                      className={`group transition-all duration-200 ${
                        lateInfo.isLate
                          ? "bg-amber-50/30 dark:bg-amber-900/10 hover:bg-amber-50/60 dark:hover:bg-amber-900/20"
                          : earlyInfo.isEarly
                          ? "bg-indigo-50/30 dark:bg-indigo-900/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20"
                          : "hover:bg-gray-50/80 dark:hover:bg-white/5"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"
                          >
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {employee.name}
                            </div>
                            {lateInfo.isLate && (
                              <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center mt-1 font-bold">
                                <Clock className="w-3 h-3 mr-1" />
                                {lateInfo.lateText} kech
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-6">
                        <span className="inline-flex px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-[11px] font-bold border border-blue-100 dark:border-blue-900/30">
                          {employee.department || "IT"}
                        </span>
                      </td>
                      <td className="text-center py-4 px-6">
                        <span className="text-sm font-bold text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/50 px-2 py-0.5 rounded border border-gray-100 dark:border-slate-800">
                          {employee.checkIn || "—:—"}
                        </span>
                      </td>
                      <td className="text-center py-4 px-6">
                        <span className="text-sm font-bold text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/50 px-2 py-0.5 rounded border border-gray-100 dark:border-slate-800">
                          {employee.checkOut || "—:—"}
                        </span>
                        {earlyInfo.isEarly && (
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-1">
                            {earlyInfo.earlyText} erta
                          </div>
                        )}
                      </td>
                      <td className="text-center py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            employee.status === "present"
                              ? lateInfo.isLate
                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                                : earlyInfo.isEarly
                                ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                                : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                              : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                          }`}
                        >
                          {employee.status === "present" ? (
                            lateInfo.isLate ? getStatusIcon("late") : earlyInfo.isEarly ? <Clock className="w-3.5 h-3.5" /> : getStatusIcon("present")
                          ) : getStatusIcon("absent")}
                          <span>
                            {employee.status === "present" 
                              ? lateInfo.isLate ? "Kech qoldi" : earlyInfo.isEarly ? "Erta ketdi" : "Kelgan"
                              : "Kelmagan"}
                          </span>
                        </span>
                      </td>
                      <td className="text-right py-4 px-6">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white rounded-lg transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Tahrirlash</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800">
            {paginatedwater_usage.map((employee) => {
              const lateInfo = calculateLateInfo(employee.checkIn);
              const earlyInfo = calculateEarlyLeaveInfo(employee.checkOut);
              return (
                <div key={employee.id} className="p-4 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"
                      >
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white transition-colors">{employee.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/30">
                             {employee.department || "IT"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditEmployee(employee)}
                      className="p-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Kelgan</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-slate-200">{employee.checkIn || "—"}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Ketgan</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-slate-200">{employee.checkOut || "—"}</p>
                      {earlyInfo.isEarly && (
                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{earlyInfo.earlyText} erta</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        employee.status === "present"
                          ? lateInfo.isLate
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                            : earlyInfo.isEarly
                            ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                            : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      {employee.status === "present" ? (
                        lateInfo.isLate ? getStatusIcon("late") : earlyInfo.isEarly ? <Clock className="w-3.5 h-3.5" /> : getStatusIcon("present")
                      ) : getStatusIcon("absent")}
                      <span>
                        {employee.status === "present" 
                          ? lateInfo.isLate ? "Kech qoldi" : earlyInfo.isEarly ? "Erta ketdi" : "Kelgan"
                          : "Kelmagan"}
                      </span>
                    </span>

                    {lateInfo.isLate && (
                      <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {lateInfo.lateText} kech
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-gray-200 dark:border-slate-800 transition-colors">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 dark:text-slate-400">Ko'rsatish:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 dark:border-slate-700 rounded-md px-2 py-1 text-sm bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-500 dark:text-slate-500">
                  {startIndex + 1}-{Math.min(endIndex, totalItems)} {" / "}
                  {totalItems} ta
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="hidden xs:block px-2 py-1 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ««
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ‹
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded-md transition-colors ${currentPage === pageNum
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                        : "border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="hidden xs:block px-2 py-1 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  »»
                </button>
              </div>
            </div>
          )}
        {/* Empty State */}
        {filteredwater_usage.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="w-14 h-14 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors">
              <Calendar className="w-8 h-8 text-gray-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors">
              Ma'lumot topilmadi
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs mx-auto transition-colors">
              Tanlangan sana uchun davomat ma'lumotlari mavjud emas yoki qidiruv natijasi bo'sh
            </p>
          </div>
        )}

        {/* Employee Edit Modal */}
        <EmployeeEditModal
          employee={selectedEmployee}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedEmployee(null);
          }}
          onSave={handleSaveEmployee}
        />
      </div>
    </div>
  );
};

export default WaterUsagePage;
