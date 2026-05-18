import React, { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../config";

const ROLES = [
  {
    value: "ishchi",
    label: "Ishchi",
  },
  {
    value: "mutaxassis",
    label: "Mutaxassis",
  },
  {
    value: "staff",
    label: "Shtatli xodim",
  },
];

const RoleSelectionModal = ({ employee, isOpen, onClose, onSave }) => {
  const [selectedRole, setSelectedRole] = useState(employee?.role || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error("❌ Iltimos rol tanlang!");
      return;
    }

    if (selectedRole === employee.role) {
      toast.error("⚠️ Bu rol allaqachon belgilangan!");
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        role: selectedRole,
        hikvisionEmployeeId: employee.hikvisionEmployeeId, // ✅ Include hikvisionEmployeeId
      };

      const response = await axios.put(`${API_URL}/api/employee/${employee._id}`, updateData);

      if (response.data) {
        const selectedRoleData = ROLES.find((r) => r.value === selectedRole);

        toast.success(
          `${employee.name} ${selectedRoleData.label} ro'yxatiga qo'shildi!`
        );

        onSave(response.data);
        onClose();
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error(
        "❌ Xatolik yuz berdi: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xs">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">
                Lavozim belgilash
              </h3>
              <p className="text-xs text-gray-500 mt-1">{employee?.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-2">
            {ROLES.map((role) => (
              <label
                key={role.value}
                className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 rounded"
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={selectedRole === role.value}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-3 h-3 mr-2 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{role.label}</span>
                </div>
                {employee.role === role.value && (
                  <span className="text-xs text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded text-center">
                    Joriy
                  </span>
                )}
              </label>
            ))}
          </div>

          {/* Footer */}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={!selectedRole || loading}
              className="flex-1 px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-300"
            >
              {loading ? "..." : "Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleSelectionModal;

