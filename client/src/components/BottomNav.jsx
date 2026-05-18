import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, Bell } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: "dashboard", path: "/dashboard", icon: Home, label: "Dashboard" },
    {
      id: "water-usage",
      path: "/water-usage",
      icon: Calendar,
      label: "Davomat",
    },
    {
      id: "notifications",
      path: "/notifications",
      icon: Bell,
      label: "Bildirishnomalar",
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-gray-100 dark:border-slate-800 z-50 px-4 py-2 pb-safe transition-colors duration-300">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center gap-0.5 transition-all duration-300 ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-400 dark:text-slate-500"
              }`}
            >
              <div
                className={`p-1 transition-all duration-300 ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-400 dark:text-slate-500"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
              </div>
              <span className={`text-[9px] font-medium transition-all duration-300 ${isActive ? "opacity-100 font-bold" : "opacity-70"}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1.5 w-4 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
