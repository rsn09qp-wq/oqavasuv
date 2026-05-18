import { useState, useEffect } from "react";
import {
  Briefcase,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Wifi,
  Database,
  Server,
} from "lucide-react";
import { API_URL } from "../config";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalStaff: 0,
    staffPresent: 0,
    lateCount: 0,
    dbStats: null,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const calculateLateInfo = (checkInTime) => {
    if (!checkInTime) return { isLate: false };
    const LATE_THRESHOLD_HOUR = 9;
    const LATE_THRESHOLD_MINUTE = 30;
    let hours, minutes;
    if (checkInTime.includes && checkInTime.includes("T")) {
      const date = new Date(checkInTime);
      if (isNaN(date.getTime())) return { isLate: false };
      hours = date.getHours();
      minutes = date.getMinutes();
    } else if (typeof checkInTime === "string") {
      const parts = checkInTime.split(":");
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    } else return { isLate: false };
    if (isNaN(hours) || isNaN(minutes)) return { isLate: false };
    const checkInMinutes = hours * 60 + minutes;
    const thresholdMinutes = LATE_THRESHOLD_HOUR * 60 + LATE_THRESHOLD_MINUTE;
    return { isLate: checkInMinutes > thresholdMinutes };
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch data from multiple endpoints
      const endpoints = [
        fetch(`${API_URL}/api/all-staff`).catch(e => ({ ok: false, error: e })),
        fetch(`${API_URL}/api/attendance`).catch(e => ({ ok: false, error: e })),
        fetch(`${API_URL}/api/system/db-stats`).catch(e => ({ ok: false, error: e })),
      ];

      const [employeesRes, attendanceRes, dbRes] = await Promise.all(endpoints);

      // Handle raw responses
      const employeesData = employeesRes.ok ? await employeesRes.json() : { employees: [] };
      const attendanceData = attendanceRes.ok ? await attendanceRes.json() : { records: [] };
      const dbStatsData = dbRes.ok ? await dbRes.json() : null;

      const employees =
        employeesData.employees || employeesData.data || employeesData || [];
      const attendance =
        attendanceData.records || attendanceData.data || attendanceData || [];

      const today = new Date().toISOString().split("T")[0];
      const todayAttendance = attendance.filter(
        (record) => record.date === today,
      );

      const rawStaff = employees.filter(
        (emp) => emp.role === "staff" || emp.role === null || emp.role === undefined,
      );

      // Deduplicate staff by name (matching WaterUsagePage logic)
      const seenStaffNames = new Set();
      const staff = rawStaff.filter((emp) => {
        const normalizedName = emp.name?.trim().toLowerCase();
        if (!normalizedName || seenStaffNames.has(normalizedName)) return false;
        seenStaffNames.add(normalizedName);
        return true;
      });

      const staffPresent = todayAttendance.filter((record) =>
        staff.some((s) => (s.hikvisionEmployeeId || s.employeeId)?.toString() === (record.hikvisionEmployeeId || record.employeeId)?.toString()),
      ).length;

      // Deduplicate today's attendance by employee ID to count unique latecomers
      const uniqueAttendance = [];
      const seenIds = new Set();
      todayAttendance.forEach(record => {
        const id = (record.hikvisionEmployeeId || record.employeeId)?.toString();
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          uniqueAttendance.push(record);
        }
      });

      const lateCount = uniqueAttendance.filter((record) => {
        const isStaff = staff.some((s) => (s.hikvisionEmployeeId || s.employeeId)?.toString() === (record.hikvisionEmployeeId || record.employeeId)?.toString());
        return isStaff && record.firstCheckIn && calculateLateInfo(record.firstCheckIn).isLate;
      }).length;

      setStats({
        totalStaff: staff.length,
        staffPresent,
        lateCount,
        dbStats: dbStatsData?.success ? dbStatsData.data : null,
      });

      const recentRecords = todayAttendance
        .slice(-10)
        .reverse()
        .map((record) => {
          const employee = employees.find(
            (emp) => emp.hikvisionEmployeeId === record.hikvisionEmployeeId,
          );
          return {
            id: record._id,
            name: employee?.name || record.name || "Unknown",
            role: employee?.role || record.role || "unknown",
            action: record.lastCheckOut ? "Chiqdi" : "Kirdi",
            time: record.lastCheckOut
              ? record.lastCheckOut
              : record.firstCheckIn,
            avatar:
              employee?.name?.substring(0, 2).toUpperCase() ||
              record.name?.substring(0, 2).toUpperCase() ||
              "?",
          };
        });

      setRecentActivity(recentRecords);
    } catch (error) {
      console.error("Dashboard ma'lumotlarini olishda xatolik:", error);
    }
  };

  const currentDate = new Date().toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentDay = new Date().toLocaleDateString("uz-UZ", {
    weekday: "long",
  });

  // Calculate percentages - ONLY for staff
  const totalPeople = stats.totalStaff;
  const totalPresent = stats.staffPresent;
  const attendancePercent =
    totalPeople > 0 ? Math.round((totalPresent / totalPeople) * 100) : 0;

  const getRoleLabel = (role) => {
    switch (role) {
      case "staff":
        return "Xodim";
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 md:px-6 py-4 md:py-6 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              {currentDay}, {currentDate}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Real-time
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-6">
        {/* Overall Attendance Card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                attendancePercent > 0
                  ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
              }`}
            >
              {attendancePercent}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{totalPresent}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Umumiy Davomat</p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
            <span className="text-xs text-gray-500 dark:text-slate-500">Jami:</span>
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              {totalPeople}
            </span>
          </div>
        </div>

        {/* Staff */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
              <Briefcase className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <span
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                stats.staffPresent > 0
                  ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
              }`}
            >
              {stats.totalStaff > 0
                ? Math.round((stats.staffPresent / stats.totalStaff) * 100)
                : 0}
              %{stats.staffPresent > 0 && <ArrowUpRight className="w-3 h-3" />}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.totalStaff}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Xodimlar</p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
            <span className="text-xs text-gray-500 dark:text-slate-500">Bugun:</span>
            <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
              {stats.staffPresent}
            </span>
          </div>
        </div>

        {/* Database Storage Card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            {stats.dbStats?.percentUsed ? (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                parseFloat(stats.dbStats.percentUsed) > 80 ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              }`}>
                {stats.dbStats.percentUsed}% band
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                {stats.dbStats?.objects || 0} ta ma'lumot
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            {stats.dbStats ? `${stats.dbStats.totalUsed} MB` : '...'}
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Ma'lumotlar bazasi</p>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 dark:text-slate-500">Ma'lumotlar:</span>
              <span className="font-medium text-gray-700 dark:text-slate-300">{stats.dbStats?.dataSize || 0} MB</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 dark:text-slate-500">Indekslar:</span>
              <span className="font-medium text-gray-700 dark:text-slate-300">{stats.dbStats?.indexSize || 0} MB</span>
            </div>
            {stats.dbStats?.fsTotalSize && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500 dark:text-slate-500">Jami limit:</span>
                <span className="font-medium text-gray-700 dark:text-slate-300">{stats.dbStats.fsTotalSize} MB</span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-slate-500">Holat:</span>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">Active</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
              <div 
                className={`h-full rounded-full ${parseFloat(stats.dbStats?.percentUsed || 0) > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${stats.dbStats?.percentUsed || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Kechikkanlar */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                stats.lateCount > 0
                  ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
              }`}
            >
              {stats.staffPresent > 0
                ? Math.round((stats.lateCount / stats.staffPresent) * 100)
                : 0}
              % ksh.
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.lateCount}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Kech qolganlar</p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
            <span className="text-xs text-gray-500 dark:text-slate-500">Bugun:</span>
            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              {stats.lateCount} ta
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white transition-colors">
                So'nggi Faollik
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-gray-500 dark:text-slate-400">Live</span>
            </div>
          </div>

          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-slate-800/50 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
            <div className="col-span-4">Ism</div>
            <div className="col-span-3">Lavozim</div>
            <div className="col-span-3 text-center">Status</div>
            <div className="col-span-2 text-right">Vaqt</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
            {recentActivity.length > 0 ? (
              <div className="flex flex-col">
                {recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={activity.id || index}>
                    {/* Desktop View */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors items-center">
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold bg-indigo-600 dark:bg-indigo-500 shrink-0 shadow-sm">
                          {activity.avatar}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate transition-colors">
                          {activity.name}
                        </span>
                      </div>
                      <div className="col-span-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <Briefcase className="w-3.5 h-3.5" />
                          {getRoleLabel(activity.role)}
                        </span>
                      </div>
                      <div className="col-span-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                            activity.action === "Kirdi"
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {activity.action === "Kirdi" ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {activity.action}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
                          {activity.time}
                        </span>
                      </div>
                    </div>

                    {/* Mobile View (Card) */}
                    <div className="sm:hidden p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold bg-indigo-600 shrink-0 shadow-sm">
                            {activity.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{activity.name}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{getRoleLabel(activity.role)}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                          {activity.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                            activity.action === "Kirdi"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {activity.action === "Kirdi" ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {activity.action}
                        </span>
                        <div className="text-[10px] text-gray-400 italic">
                          Bugun faollik
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Bugun hali faollik yo'q</p>
                <p className="text-xs mt-1">
                  Kirish/chiqish ma'lumotlari bu yerda ko'rinadi
                </p>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white transition-colors">
              Tizim Holati
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {/* Status Items */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Server className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Server
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">Faol</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Database className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Database
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">Faol</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Hikvision
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  Ulangan
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="px-4 pb-4">
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl border border-transparent dark:border-slate-800">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wide mb-3">
                Bugungi Statistika
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Umumiy davomat</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white transition-colors">
                    {attendancePercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Jami hodimlar</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-slate-200">
                    {totalPeople}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Hozir o'rin</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {totalPresent}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
