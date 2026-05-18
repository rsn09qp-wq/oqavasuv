import React from "react";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionText = "Yangi qo'shish",
  className = "",
}) => {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      {Icon && (
        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
          <Icon className="w-full h-full" />
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || "Ma'lumotlar topilmadi"}
      </h3>

      {description && (
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      )}

      {action && (
        <button
          onClick={action}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

