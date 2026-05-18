import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import Header from "./components/CleanHeader";
import Sidebar from "./components/CleanSidebar";
import DashboardPage from "./pages/DashboardPage";
import AttendancePage from "./pages/WaterUsagePage";
import NotificationsPage from "./pages/NotificationsPage";
import LoginPage from "./pages/LoginPage";
import BottomNav from "./components/BottomNav";
import ErrorBoundary from "./components/ErrorBoundary";
import axios from "axios";
import "./App.css";

// Set up axios interceptor for JWT authentication
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle 401 Unauthorized globally
// change-password yoki login endpointlarida logout qilmaymiz
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthAction =
      url.includes("/change-password") ||
      url.includes("/login") ||
      url.includes("/register");

    if (error.response && error.response.status === 401 && !isAuthAction) {
      const code = error.response.data?.code;
      const message = error.response.data?.message;

      // Parol o'zgartirilgan — chiroyli xabar bilan chiqarish
      if (code === "PASSWORD_CHANGED") {
        toast.error("🔐 Parol o'zgartirildi. Qayta kiring.", {
          duration: 4000,
          position: "top-center",
        });
      } else {
        toast.error(message || "Sessiya tugadi. Qayta kiring.", {
          duration: 3000,
        });
      }

      setTimeout(() => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/";
      }, 1500);
    }
    return Promise.reject(error);
  },
);


function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Tizimdan chiqildi");
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#004A7733", borderTopColor: "#004A77" }}
          ></div>
          <span className="text-gray-600 dark:text-slate-400">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return (
      <ErrorBoundary>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </ErrorBoundary>
    );
  }

  // Show main app if authenticated
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden relative transition-colors duration-300">
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden transition-all duration-300 animate-in fade-in"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}

          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
          />

          <div className="flex-1 flex flex-col overflow-hidden w-full">
            <Header
              user={user}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/water-usage" element={<AttendancePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </main>
            <BottomNav />
          </div>
        </div>
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
