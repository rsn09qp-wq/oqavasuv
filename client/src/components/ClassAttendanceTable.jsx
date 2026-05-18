import React from "react";
import { Users, TrendingUp } from "lucide-react";

const ClassAttendanceTable = ({ data: classStats = [] }) => {
  if (!classStats || classStats.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-900 mb-1">
            Ma'lumotlar topilmadi
          </p>
          <p className="text-sm text-gray-500">
            Hali sinflar bo'yicha suv istamoli ma'lumotlari yo'q
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Sinflar bo'yicha suv istamoli
        </h2>
        <TrendingUp className="w-5 h-5 text-green-500" />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                Sinf
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">
                Jami
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">
                Keldi
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">
                Kelmadi
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">
                Foiz
              </th>
            </tr>
          </thead>
          <tbody>
            {classStats.map((classItem, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-2">
                  <span className="font-medium text-gray-900">
                    {classItem.class}
                  </span>
                </td>
                <td className="text-center py-3 px-2 text-gray-600">
                  {classItem.total}
                </td>
                <td className="text-center py-3 px-2">
                  <span className="text-green-600 font-medium">
                    {classItem.present}
                  </span>
                </td>
                <td className="text-center py-3 px-2">
                  <span
                    className={
                      classItem.absent > 0
                        ? "text-red-600 font-medium"
                        : "text-gray-400"
                    }
                  >
                    {classItem.absent}
                  </span>
                </td>
                <td className="text-right py-3 px-2">
                  <div className="flex items-center justify-end space-x-2">
                    <div className="w-12 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          classItem.percentage >= 95
                            ? "bg-green-500"
                            : classItem.percentage >= 90
                            ? "bg-orange-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${classItem.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {classItem.percentage}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {classStats.map((classItem, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-lg">
                {classItem.class}
              </h3>
              <span className="text-sm font-medium text-gray-500">
                Jami: {classItem.total}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {classItem.present}
                </div>
                <div className="text-sm text-gray-500">Keldi</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    classItem.absent > 0 ? "text-red-600" : "text-gray-400"
                  }`}
                >
                  {classItem.absent}
                </div>
                <div className="text-sm text-gray-500">Kelmadi</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    classItem.percentage >= 95
                      ? "bg-green-500"
                      : classItem.percentage >= 90
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${classItem.percentage}%` }}
                ></div>
              </div>
              <span className="text-lg font-bold text-gray-700">
                {classItem.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassAttendanceTable;

