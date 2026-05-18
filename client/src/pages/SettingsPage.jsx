import React, { useState } from "react";
import {
  Settings,
  Bell,
  Palette,
  Globe,
  Save,
  Check,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    schoolName: "Boborahim Mashrab xususiy oqavai",
    address: "Namangan viloyat, Chust tumani",
    phone: "+998 69 555 12 34",
    email: "info@boborahim-mashrab.uz",
    website: "www.boborahim-mashrab.uz",
    startTime: "08:00",
    endTime: "14:00",
    lateThreshold: "09:30",
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    monthlyReports: true,
    theme: "light",
    language: "uz",
    dateFormat: "dd/mm/yyyy",
    timeFormat: "24h",
  });

  const tabs = [
    { id: "general", name: "Umumiy", icon: Settings },
    { id: "schedule", name: "Jadval", icon: Globe },
    { id: "notifications", name: "Bildirishnomalar", icon: Bell },
    { id: "appearance", name: "Ko'rinish", icon: Palette },
    { id: "security", name: "Xavfsizlik", icon: Lock },
  ];

  const handleInputChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    // Simulate saving
    toast.success("Sozlamalar muvaffaqiyatli saqlandi!", {
      duration: 3000,
      position: "top-right",
    });
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white transition-colors">{label}</h4>
        <p className="text-sm text-gray-500 dark:text-slate-400 transition-colors">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className={`w-11 h-6 rounded-full transition-all duration-300 ${checked ? "bg-blue-600 shadow-sm shadow-blue-500/20" : "bg-gray-300 dark:bg-slate-700"
          }`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 transform ${checked ? "translate-x-5" : "translate-x-0.5"
            } mt-0.5`}></div>
        </div>
      </label>
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors">
          Oqava ma'lumotlari
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
              Oqava nomi
            </label>
            <input
              type="text"
              value={settings.schoolName}
              onChange={(e) => handleInputChange("schoolName", e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
              Telefon raqam
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
              Email manzil
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
              Veb-sayt
            </label>
            <input
              type="url"
              value={settings.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>
        </div>
        <div className="mt-5">
          <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
            Manzil
          </label>
          <textarea
            value={settings.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>
      </div>
    </div>
  );

  const renderScheduleSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dars jadvali
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Darslar boshlanish vaqti
            </label>
            <input
              type="time"
              value={settings.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Darslar tugash vaqti
            </label>
            <input
              type="time"
              value={settings.endTime}
              onChange={(e) => handleInputChange("endTime", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kech kelish chegarasi
            </label>
            <input
              type="time"
              value={settings.lateThreshold}
              onChange={(e) =>
                handleInputChange("lateThreshold", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Bildirishnomalar
        </h3>
        <div className="space-y-4">
          <ToggleSwitch
            checked={settings.emailNotifications}
            onChange={(value) => handleInputChange("emailNotifications", value)}
            label="Email bildirishnomalar"
            description="Muhim yangiliklar email orqali yuboriladi"
          />
          <ToggleSwitch
            checked={settings.smsNotifications}
            onChange={(value) => handleInputChange("smsNotifications", value)}
            label="SMS bildirishnomalar"
            description="Tezkor xabarlar SMS orqali yuboriladi"
          />
          <ToggleSwitch
            checked={settings.weeklyReports}
            onChange={(value) => handleInputChange("weeklyReports", value)}
            label="Haftalik hisobotlar"
            description="Avtomatik haftalik hisobotlar"
          />
          <ToggleSwitch
            checked={settings.monthlyReports}
            onChange={(value) => handleInputChange("monthlyReports", value)}
            label="Oylik hisobotlar"
            description="Avtomatik oylik hisobotlar"
          />
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors">
          Ko'rinish va til
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
              Mavzu
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleInputChange("theme", e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            >
              <option value="light">Yorug'</option>
              <option value="dark">Qorong'u</option>
              <option value="auto">Avtomatik</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Til
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleInputChange("language", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="uz">O'zbekcha</option>
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sana formati
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleInputChange("dateFormat", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vaqt formati
            </label>
            <select
              value={settings.timeFormat}
              onChange={(e) => handleInputChange("timeFormat", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">24 soat</option>
              <option value="12h">12 soat (AM/PM)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings();
      case "schedule":
        return renderScheduleSettings();
      case "notifications":
        return renderNotificationSettings();
      case "appearance":
        return renderAppearanceSettings();
      case "security":
        return renderSecuritySettings();
      default:
        return renderGeneralSettings();
    }
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validatsiya
    if (passwordData.newPassword.length < 6) {
      toast.error("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Yangi parollar mos kelmadi");
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("Yangi parol eski parol bilan bir xil bo'lmasligi kerak");
      return;
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE}/api/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("✅ Parol muvaffaqiyatli o'zgartirildi!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswords({ current: false, new: false, confirm: false });
      }
    } catch (error) {
      console.error("Change password error:", error);
      const errMsg = error.response?.data?.error || error.message || "Xatolik yuz berdi";
      toast.error(`❌ ${errMsg}`);
    } finally {
      setPasswordLoading(false);
    }
  };

  const PasswordInput = ({ field, label, placeholder }) => (
    <div>
      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPasswords[field] ? "text" : "password"}
          value={passwordData[`${field}Password`] ?? passwordData[field]}
          onChange={(e) =>
            setPasswordData((prev) => ({ ...prev, [`${field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword'}`]: e.target.value }))
          }
          placeholder={placeholder || "••••••••"}
          className="w-full px-4 py-2.5 pr-12 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
          required
          minLength={field !== 'current' ? 6 : undefined}
          disabled={passwordLoading}
        />
        <button
          type="button"
          onClick={() => setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          tabIndex={-1}
        >
          {showPasswords[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Parolni o'zgartirish</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">Xavfsizlik uchun parolni muntazam yangilang</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
          <PasswordInput field="current" label="Joriy parol" />
          <PasswordInput field="new" label="Yangi parol" placeholder="Kamida 6 ta belgi" />
          <PasswordInput field="confirm" label="Yangi parolni tasdiqlang" />

          {/* Parol kuchi ko'rsatkichi */}
          {passwordData.newPassword && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      passwordData.newPassword.length >= i * 3
                        ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-yellow-400' : i <= 3 ? 'bg-blue-400' : 'bg-green-500'
                        : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {passwordData.newPassword.length < 6
                  ? '⚠️ Juda qisqa'
                  : passwordData.newPassword.length < 9
                  ? '🔶 O\'rtacha'
                  : passwordData.newPassword.length < 12
                  ? '🔷 Yaxshi'
                  : '✅ Kuchli parol'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all font-bold text-sm shadow-sm shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {passwordLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saqlanmoqda...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Parolni yangilash
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="px-4 py-8 bg-gray-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Sozlamalar</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 transition-colors">
                Tizim sozlamalari va xavfsizligini boshqaring
              </p>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 dark:bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all shadow-sm shadow-indigo-500/20"
            >
              <Save className="w-4.5 h-4.5" />
              <span className="font-bold text-sm">Saqlash</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-72">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-2.5 shadow-sm transition-colors">
              <nav className="space-y-1.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-left transition-all duration-200 ${activeTab === tab.id
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                        }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                      <span className="font-bold text-sm">{tab.name}</span>
                      {activeTab === tab.id && (
                        <Check className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-8 shadow-sm transition-colors min-h-[500px]">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

