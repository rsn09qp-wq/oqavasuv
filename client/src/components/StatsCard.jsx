import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatsCard = ({
  title,
  value,
  subtitle,
  color = "blue",
  icon,
  trend,
  trendValue,
}) => {
  const colorClasses = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-100",
      border: "border-blue-200",
      text: "text-blue-700",
      iconBg: "bg-gradient-to-r from-blue-500 to-indigo-600",
      accent: "bg-blue-500",
    },
    green: {
      bg: "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100",
      border: "border-emerald-200",
      text: "text-emerald-700",
      iconBg: "bg-gradient-to-r from-emerald-500 to-teal-600",
      accent: "bg-emerald-500",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100",
      border: "border-orange-200",
      text: "text-orange-700",
      iconBg: "bg-gradient-to-r from-orange-500 to-amber-600",
      accent: "bg-orange-500",
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 via-rose-50 to-pink-100",
      border: "border-red-200",
      text: "text-red-700",
      iconBg: "bg-gradient-to-r from-red-500 to-rose-600",
      accent: "bg-red-500",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100",
      border: "border-purple-200",
      text: "text-purple-700",
      iconBg: "bg-gradient-to-r from-purple-500 to-violet-600",
      accent: "bg-purple-500",
    },
  };

  const currentTheme = colorClasses[color];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 ${currentTheme.bg} ${currentTheme.border} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group`}
    >
      {/* Accent Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${currentTheme.accent}`}
      ></div>

      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-4xl font-bold text-gray-900 leading-none">
                {value}
              </p>
              {trend && trendValue && (
                <div
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    trend === "up"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {trend === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-2 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {icon && (
            <div
              className={`w-14 h-14 ${currentTheme.iconBg} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
              <div className="w-7 h-7">{icon}</div>
            </div>
          )}
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
    </div>
  );
};

export default StatsCard;

