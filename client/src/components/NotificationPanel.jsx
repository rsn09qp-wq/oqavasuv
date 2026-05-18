import React from "react";
import {
  UserPlus,
  ShoppingCart,
  ArrowDownToLine,
  Mail,
  Activity,
} from "lucide-react";

const NotificationPanel = ({ activities }) => {
  const getIcon = (type) => {
    switch (type) {
      case "users":
        return <UserPlus className="w-5 h-5" />;
      case "orders":
        return <ShoppingCart className="w-5 h-5" />;
      case "withdraw":
        return <ArrowDownToLine className="w-5 h-5" />;
      case "messages":
        return <Mail className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "users":
        return "bg-emerald-500";
      case "orders":
        return "bg-blue-500";
      case "withdraw":
        return "bg-orange-500";
      case "messages":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Notifications
      </h3>
      <div className="space-y-4">
        {activities && activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div
                className={`${getIconColor(
                  activity.type,
                )} p-2 rounded-lg text-white flex-shrink-0`}
              >
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No notifications</p>
        )}
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Contacts of your managers
        </h4>
        <div className="space-y-2">
          {[
            { name: "Daniel Craig", online: false },
            { name: "Kate Morrison", online: true },
            { name: "Nataniel Donovan", online: true },
          ].map((manager, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {manager.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${
                      manager.online ? "bg-emerald-400" : "bg-gray-300"
                    } border-2 border-white rounded-full`}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {manager.name}
                </span>
              </div>
              <div className="flex space-x-1">
                <button className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                  <Mail className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;

