import React, { useState, useEffect } from "react";
import { RefreshCw, Clock, User, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import { API_URL } from "../config";

const HikvisionAttendance = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filter, setFilter] = useState("today"); // today, week, all

  const API_BASE_URL = `${API_URL}/api`;

  // Fetch attendance records
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      let url = `${API_BASE_URL}/attendance/summary`;
      if (filter === "today") {
        url += `?date=${today}`;
      }

      const response = await axios.get(url);
      setEvents(response.data.records || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return timeString;
  };

  const getStatusColor = (record) => {
    if (record.checkInTime && record.checkOutTime) {
      return "bg-green-100 text-green-800";
    } else if (record.checkInTime) {
      return "bg-blue-100 text-blue-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const getStatusText = (record) => {
    if (record.checkInTime && record.checkOutTime) {
      return "Chiqdi";
    } else if (record.checkInTime) {
      return "Ichkarida";
    }
    return "Kelgan";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Face ID suv istamoli</h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time Hikvision qurilmasidan
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Bugun</option>
            <option value="week">Bu hafta</option>
            <option value="all">Hammasi</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-all"
            style={{ backgroundColor: "#004A77" }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Yangilash</span>
          </button>
        </div>
      </div>

      {/* Last update time */}
      {lastUpdate && (
        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
          <Clock className="w-3 h-3" />
          <span>
            Oxirgi yangilanish: {lastUpdate.toLocaleTimeString("uz-UZ")}
          </span>
        </div>
      )}

      {/* Events list */}
      {loading && events.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Yuklanmoqda...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Hozircha ma'lumot yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.slice(0, 30).map((event, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
            >
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{
                    background: "linear-gradient(to right, #004A77, #003A63)",
                  }}
                >
                  {event.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)}
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-semibold text-gray-900">{event.name}</h3>
                  <p className="text-sm text-gray-600">
                    {event.role === "teacher"
                      ? "O'qituvchi"
                      : event.role === "staff"
                      ? "Xodim"
                      : event.department}
                  </p>
                </div>
              </div>

              {/* Times */}
              <div className="flex items-center space-x-6">
                {/* Check-in */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Keldi</p>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-gray-900">
                      {formatTime(event.checkInTime)}
                    </span>
                  </div>
                </div>

                {/* Check-out */}
                {event.checkOutTime && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Ketdi</p>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-gray-900">
                        {formatTime(event.checkOutTime)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Status badge */}
                <div>
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      event
                    )}`}
                  >
                    {getStatusText(event)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info footer */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>ℹ️ Ma'lumot:</strong> Bu ro'yxat Hikvision Face ID
          qurilmasidan avtomatik yangilanadi. Har 30 soniyada avtomatik refresh
          bo'ladi.
        </p>
      </div>
    </div>
  );
};

export default HikvisionAttendance;

