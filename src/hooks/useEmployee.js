import { useState, useCallback, useMemo } from "react";
import {
  validateEmployeeUpdate,
  applyEmployeeUpdate,
  getManagerOptions,
} from "../services/employeeService";

/**
 * DEV-18: Custom hook encapsulating employee state and update operations.
 *
 * @param {Object[]} initialEmployees - Seed data for the employee list
 */
export function useEmployee(initialEmployees = []) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // ---------------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------------

  /**
   * Validates and applies an employee record update.
   *
   * @param {string} id          - Employee ID
   * @param {Object} updatedData - Fields to update
   * @returns {boolean} true on success, false on validation failure
   */
  const updateEmployee = useCallback((id, updatedData) => {
    const errors = validateEmployeeUpdate(updatedData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors above before saving.");
      return false;
    }

    setEmployees((prev) => applyEmployeeUpdate(prev, id, updatedData));
    setFieldErrors({});
    setError(null);
    return true;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  // ---------------------------------------------------------------------------
  // Manager options (derived – exclude self)
  // ---------------------------------------------------------------------------

  const getManagerOptionsForEmployee = useCallback(
    (employeeId) => getManagerOptions(employees, employeeId),
    [employees],
  );

  // ---------------------------------------------------------------------------
  // Filtered view
  // ---------------------------------------------------------------------------

  const filteredEmployees = useMemo(() => {
    let result = employees;

    if (departmentFilter) {
      result = result.filter((e) => e.department === departmentFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.firstName.toLowerCase().includes(q) ||
          e.lastName.toLowerCase().includes(q) ||
          (e.email && e.email.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [employees, departmentFilter, searchQuery]);

  return {
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
  };
}
