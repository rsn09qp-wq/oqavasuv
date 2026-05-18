import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Search, User, LogOut, Menu, Key, Sun, Cloud, CloudRain, CloudSun, Wind, Clock, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import ChangePasswordModal from "./ChangePasswordModal";

const CleanHeader = ({ user, onToggleSidebar }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [weather, setWeather] = useState({ temp: 24, code: 0 });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Tashkent coordinates
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=41.2995&longitude=69.2401&current_weather=true");
        const data = await res.json();
        if (data && data.current_weather) {
          setWeather({ 
            temp: Math.round(data.current_weather.temperature), 
            code: data.current_weather.weathercode 
          });
        }
      } catch (e) {
        console.error("Weather fetch error", e);
      }
    };
    
    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 600000); // Har 10 daqiqada yangilash
    return () => clearInterval(weatherInterval);
  }, []);

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun className="w-5 h-5 text-amber-500" />;
    if (code >= 1 && code <= 3) return <CloudSun className="w-5 h-5 text-amber-400" />;
    if (code >= 45 && code <= 48) return <Cloud className="w-5 h-5 text-gray-400" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (code >= 71 && code <= 77) return <CloudRain className="w-5 h-5 text-slate-300" />;
    if (code >= 80 && code <= 82) return <CloudRain className="w-5 h-5 text-blue-500" />;
    return <Sun className="w-5 h-5 text-amber-500" />;
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  const getPageTitle = () => {
    const titles = {
      "/dashboard": "Dashboard",
      "/students": "istamolchilar",
      "/staff": "Hodimlar",
      "/attendance": "Davomat",
      "/classes": "Sinflar",
      "/notifications": "Bildirishnomalar",
      "/reports": "Hisobotlar",
      "/settings": "Sozlamalar",
    };
    return titles[location.pathname] || "Dashboard";
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 md:px-6 py-3 md:py-4 sticky top-0 z-30 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Menu & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white leading-tight truncate">
              {getPageTitle()}
            </h1>
            <p className="hidden xs:block text-[10px] md:text-sm text-gray-500 dark:text-slate-400 mt-0.5 truncate">
            {currentTime.toLocaleDateString("uz-UZ", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
            {" • "}
            {currentTime.toLocaleTimeString("uz-UZ", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
        {/* Clock & Weather (Minimalist) */}
        <div className="flex items-center gap-4 px-4 py-2 bg-gray-50/80 dark:bg-slate-800/80 rounded-2xl border border-gray-100/50 dark:border-slate-700/50 backdrop-blur-sm hidden md:flex">
          <div className="flex items-center gap-2 pr-4 border-r border-gray-200 dark:border-slate-700">
            <Clock className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400" />
            <span className="text-sm font-bold text-gray-800 dark:text-slate-200 tracking-tight">
              {currentTime.toLocaleTimeString("uz-UZ", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {getWeatherIcon(weather.code)}
            <span className="text-sm font-bold text-gray-800 dark:text-slate-200">
              {weather.temp > 0 ? `+${weather.temp}` : weather.temp}°C
            </span>
          </div>
        </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-indigo-100 dark:hover:border-slate-600"
            title={theme === 'light' ? 'Tungi rejim' : 'Kunduzgi rejim'}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-indigo-600" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
          </button>

          {/* User */}
          <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 border-l border-gray-200 dark:border-slate-800">
            <div 
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all cursor-pointer border border-transparent hover:border-indigo-100 dark:hover:border-slate-600 group"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-full flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none">
                <User className="w-4 h-4 md:w-5 md:h-5 text-white" aria-hidden="true" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-0.5">
                  {user?.username || "Admin"}
                </p>
                <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-md inline-block uppercase tracking-wider">
                  {user?.role || "Administrator"}
                </p>
              </div>
              <div className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 group-hover:bg-indigo-50 dark:group-hover:bg-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all ml-1" title="Parolni o'zgartirish">
                <Key className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </header>
  );
};

export default CleanHeader;

