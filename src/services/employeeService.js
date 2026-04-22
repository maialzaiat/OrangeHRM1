/**
 * DEV-18: Update an Employee
 * Service layer for employee record management.
 * Handles validation, org-chart update logic, and department/manager data.
 */

export const DEPARTMENTS = [
  { value: "ENGINEERING", label: "Engineering" },
  { value: "HR", label: "Human Resources" },
  { value: "FINANCE", label: "Finance" },
  { value: "SALES", label: "Sales" },
  { value: "MARKETING", label: "Marketing" },
  { value: "OPERATIONS", label: "Operations" },
];

export const JOB_TITLES = [
  { value: "SOFTWARE_ENGINEER", label: "Software Engineer" },
  { value: "SENIOR_SOFTWARE_ENGINEER", label: "Senior Software Engineer" },
  { value: "TEAM_LEAD", label: "Team Lead" },
  { value: "ENGINEERING_MANAGER", label: "Engineering Manager" },
  { value: "HR_SPECIALIST", label: "HR Specialist" },
  { value: "HR_MANAGER", label: "HR Manager" },
  { value: "FINANCIAL_ANALYST", label: "Financial Analyst" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "SALES_REPRESENTATIVE", label: "Sales Representative" },
  { value: "SALES_MANAGER", label: "Sales Manager" },
  { value: "MARKETING_SPECIALIST", label: "Marketing Specialist" },
  { value: "OPERATIONS_COORDINATOR", label: "Operations Coordinator" },
];

export const EMPLOYMENT_STATUS = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERN", label: "Intern" },
];

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validates the fields required to update an employee record.
 * @param {Object} data - Employee form data
 * @returns {Object} errors map; empty object means valid
 */
export function validateEmployeeUpdate(data) {
  const errors = {};

  if (!data.firstName || !data.firstName.trim()) {
    errors.firstName = "First name is required.";
  }
  if (!data.lastName || !data.lastName.trim()) {
    errors.lastName = "Last name is required.";
  }
  if (!data.jobTitle) {
    errors.jobTitle = "Job title is required.";
  }
  if (!data.department) {
    errors.department = "Department is required.";
  }
  if (!data.employmentStatus) {
    errors.employmentStatus = "Employment status is required.";
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "A valid email address is required.";
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Org-chart helpers
// ---------------------------------------------------------------------------

/**
 * Returns the list of employees eligible to be a manager for the given employee.
 * An employee cannot be their own manager.
 *
 * @param {Object[]} employees - Full employee list
 * @param {string}   employeeId - ID of the employee being edited
 * @returns {Object[]} Filtered list of manager candidates
 */
export function getManagerOptions(employees, employeeId) {
  return employees.filter((e) => e.id !== employeeId);
}

/**
 * Applies an updated record to the employee list and returns the new list.
 * Preserves all fields not explicitly overwritten.
 *
 * @param {Object[]} employees   - Current employee list
 * @param {string}   id          - Employee ID to update
 * @param {Object}   updatedData - Partial or full updated fields
 * @returns {Object[]} New employee list
 */
export function applyEmployeeUpdate(employees, id, updatedData) {
  return employees.map((emp) =>
    emp.id === id
      ? { ...emp, ...updatedData, updatedAt: new Date().toISOString() }
      : emp,
  );
}

// ---------------------------------------------------------------------------
// Label helpers
// ---------------------------------------------------------------------------

export function getDepartmentLabel(value) {
  return DEPARTMENTS.find((d) => d.value === value)?.label ?? value;
}

export function getJobTitleLabel(value) {
  return JOB_TITLES.find((j) => j.value === value)?.label ?? value;
}

export function getStatusLabel(value) {
  return EMPLOYMENT_STATUS.find((s) => s.value === value)?.label ?? value;
}
