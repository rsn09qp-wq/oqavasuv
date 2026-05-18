import { API_URL } from "../config";

const API_BASE_URL = `${API_URL}/api`;

export const api = {
  // Health check
  health: () => fetch(`${API_BASE_URL}/health`).then((res) => res.json()),

  // Employees
  getEmployees: () =>
    fetch(`${API_BASE_URL}/employees`).then((res) => res.json()),
 
  addEmployee: (employeeData) =>
    fetch(`${API_BASE_URL}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData),
    }).then((res) => res.json()),
 
  checkInEmployee: (employeeId) =>
    fetch(`${API_BASE_URL}/employees/${employeeId}/checkin`, {
      method: "POST",
    }).then((res) => res.json()),
 
  checkOutEmployee: (employeeId) =>
    fetch(`${API_BASE_URL}/employees/${employeeId}/checkout`, {
      method: "POST",
    }).then((res) => res.json()),
 
  // Statistics
  getAttendanceStats: () =>
    fetch(`${API_BASE_URL}/attendance/stats`).then((res) => res.json()),
  getDepartmentStats: () =>
    fetch(`${API_BASE_URL}/departments/stats`).then((res) => res.json()),
  getWeeklyData: () =>
    fetch(`${API_BASE_URL}/attendance/weekly`).then((res) => res.json()),
};
