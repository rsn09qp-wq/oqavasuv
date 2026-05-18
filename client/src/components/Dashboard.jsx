import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Dashboard() {
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [todayData, setTodayData] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30 seconds refresh
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch organization config
      const configRes = await axios.get(`${API_BASE}/api/organization/config`);
      setConfig(configRes.data);

      // Fetch attendance stats
      const statsRes = await axios.get(`${API_BASE}/api/attendance/stats`);
      setStats(statsRes.data);

      // Fetch today's data
      const todayRes = await axios.get(`${API_BASE}/api/attendance/today`);
      setTodayData(todayRes.data || []);

      // Fetch weekly data
      const weekRes = await axios.get(`${API_BASE}/api/attendance/weekly`);
      setWeekData(weekRes.data || []);

      setLoading(false);
    } catch (err) {
      console.error("Data fetch error:", err);
      setError("Ma'lumotlarni yuklab olishda xatolik");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start">
            <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Xatolik</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const entityLabel =
    config?.organizationType === "school"
      ? "istamolchilar"
      : config?.organizationType === "clinic"
        ? "Bemorlar"
        : "Xodimlar";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {config?.organizationName}
          </h1>
          <p className="text-gray-600">
            {config?.city} • {config?.leaderPosition}: {config?.leaderName}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Jami {entityLabel}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.totalPrimary || 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          {/* Present Today */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Bugun Kelganlar</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats?.presentToday || 0}
                </p>
                {stats?.totalPrimary > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {Math.round(
                      ((stats?.presentToday || 0) /
                        (stats?.totalPrimary || 1)) *
                        100,
                    )}
                    %
                  </p>
                )}
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          {/* Absent Today */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Bugun Kelmaganlar</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats?.absentToday || 0}
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>

          {/* Average Attendance */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">O'rtacha suv istamoli</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {stats?.averageAttendance || 0}%
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Haftalik suv istamoli Statistikasi
            </h2>
            {weekData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="present"
                    stroke="#10b981"
                    name="Kelganlar"
                  />
                  <Line
                    type="monotone"
                    dataKey="absent"
                    stroke="#ef4444"
                    name="Kelmaganlar"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Ma\'lumot yo\'q</p>
            )}
          </div>

          {/* Today Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Bugungi suv istamoli Taqsimoti
            </h2>
            {todayData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={todayData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Ma\'lumot yo\'q</p>
            )}
          </div>
        </div>

        {/* Departments Attendance */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Bo'limlar Bo'yicha suv istamoli
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Bo'lim
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Jami
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Kelganlar
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Kelmaganlar
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Foiz
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {config?.departments?.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-800 font-medium">
                      {dept}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-gray-600">
                      {Math.floor(Math.random() * 50)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-green-600 font-medium">
                      {Math.floor(Math.random() * 45)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-red-600 font-medium">
                      {Math.floor(Math.random() * 5)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-purple-600 font-medium">
                      {Math.floor(Math.random() * 30 + 70)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

