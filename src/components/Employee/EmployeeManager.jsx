import React, { useState } from "react";
import { DEPARTMENTS } from "../../services/employeeService";
import { useEmployee } from "../../hooks/useEmployee";
import EmployeeForm from "./EmployeeForm";
import EmployeeList from "./EmployeeList";
import "./EmployeeManager.css";

/**
 * DEV-18: Main container for updating employee records.
 * Wires together the form, list, filtering, and org-chart data.
 *
 * @param {Object[]} initialEmployees - Seed list of employee records
 */
export default function EmployeeManager({ initialEmployees = [] }) {
  const {
    employees,
    filteredEmployees,
    error,
    fieldErrors,
    departmentFilter,
    setDepartmentFilter,
    searchQuery,
    setSearchQuery,
    updateEmployee,
    clearError,
    getManagerOptionsForEmployee,
  } = useEmployee(initialEmployees);

  const [editingEmployee, setEditingEmployee] = useState(null);

  function handleEdit(employee) {
    setEditingEmployee(employee);
    clearError();
  }

  function handleFormSubmit(formData) {
    const success = updateEmployee(editingEmployee.id, formData);
    if (success) {
      setEditingEmployee(null);
    }
  }

  function handleCancel() {
    setEditingEmployee(null);
    clearError();
  }

  return (
    <div className="em-container">
      {/* Header */}
      <header className="em-header">
        <h2>Employee Records</h2>
      </header>

      {/* Edit Form */}
      {editingEmployee && (
        <EmployeeForm
          employee={editingEmployee}
          managerOptions={getManagerOptionsForEmployee(editingEmployee.id)}
          fieldErrors={fieldErrors}
          error={error}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      )}

      {/* Filters */}
      {!editingEmployee && (
        <>
          <div className="em-filters">
            <input
              type="search"
              className="em-search"
              placeholder="Search by name or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search employees"
            />

            <select
              className="em-dept-filter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              aria-label="Filter by department"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <EmployeeList
            employees={filteredEmployees}
            allEmployees={employees}
            onEdit={handleEdit}
          />
        </>
      )}
    </div>
  );
}
