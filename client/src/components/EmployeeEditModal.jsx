import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const EmployeeEditModal = ({ employee, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        department: "",
        staffType: "",
    });

    useEffect(() => {
        if (employee) {
            setFormData({
                name: employee.name || "",
                phone: employee.phone || "",
                department: employee.department || "",
                staffType: employee.staffType || "",
            });
        }
    }, [employee]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave({ ...employee, ...formData });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Simple Header */}
                <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Xodimni tahrirlash
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ism-familiya
                        </label>
                        <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm">
                            {formData.name}
                        </div>
                    </div>

                    {/* Position */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lavozimi
                        </label>
                        <input
                            type="text"
                            value={formData.staffType}
                            onChange={(e) =>
                                setFormData({ ...formData, staffType: e.target.value })
                            }
                            placeholder="Muhandis, Buxgalter, Operator..."
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefon raqami
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                            placeholder="+998 90 123 45 67"
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-sm border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Saqlash
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeEditModal;
