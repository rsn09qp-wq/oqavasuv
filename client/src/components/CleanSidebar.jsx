import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, Bell, Droplets, X, LogOut } from "lucide-react";
import { toast } from "react-hot-toast";

const CleanSidebar = ({ isOpen, onClose, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-100 rounded-lg">
            <LogOut className="w-4 h-4 text-red-600" />
          </div>
          <p className="font-bold text-gray-900 text-sm">Tizimdan chiqmoqchimisiz?</p>
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onLogout();
            }}
            className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all shadow-sm"
          >
            Ha, chiqish
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-all"
          >
            Bekor qilish
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-center',
      className: 'border-2 border-red-50/50 shadow-2xl rounded-2xl',
    });
  };

  const menuItems = [
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
    <aside
      className={`
        fixed inset-y-0 left-0 z-[100] w-72 h-screen h-[100dvh] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-gray-200 dark:border-slate-800 flex flex-col overflow-hidden
        transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-none"}
      `}
    >
      {/* Logo & Close Button */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 dark:border-slate-700">
            <img src="/water.png" alt="O'zsuvta'minot" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">Davomat</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">Attendance System</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? "bg-[rgb(0,74,119)] dark:bg-indigo-600 text-white shadow-lg shadow-blue-900/20 dark:shadow-indigo-900/20"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }
                `}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800">
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
        >
          <div className="p-1.5 bg-red-100 dark:bg-red-900/40 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-all">
            <LogOut className="w-5 h-5" />
          </div>
          <span>Tizimdan chiqish</span>
        </button>
      </div>
    </aside>
  );
};

export default CleanSidebar;
