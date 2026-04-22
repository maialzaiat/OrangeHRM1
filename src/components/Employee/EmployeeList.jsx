import React from "react";
import {
  getDepartmentLabel,
  getJobTitleLabel,
  getStatusLabel,
} from "../../services/employeeService";

/**
 * DEV-18: Displays the employee list with edit action.
 *
 * @param {Object[]} employees - Filtered/visible employee records
 * @param {Object[]} allEmployees - Full employee list (for manager name lookup)
 * @param {Function} onEdit    - Called with an employee object when Edit is clicked
 */
export default function EmployeeList({ employees, allEmployees = [], onEdit }) {
  if (!employees.length) {
    return (
      <p className="empty-state">No employees match the current filters.</p>
    );
  }

  return (
    <table className="employee-table" aria-label="Employee Records">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Email</th>
          <th scope="col">Job Title</th>
          <th scope="col">Department</th>
          <th scope="col">Manager</th>
          <th scope="col">Status</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((emp) => (
          <EmployeeRow
            key={emp.id}
            employee={emp}
            allEmployees={allEmployees}
            onEdit={onEdit}
          />
        ))}
      </tbody>
    </table>
  );
}

function EmployeeRow({ employee, allEmployees, onEdit }) {
  const manager = allEmployees.find((e) => e.id === employee.managerId);
  const managerName = manager
    ? `${manager.firstName} ${manager.lastName}`
    : "—";

  return (
    <tr>
      <td>
        {employee.firstName} {employee.lastName}
      </td>
      <td>{employee.email || "—"}</td>
      <td>{getJobTitleLabel(employee.jobTitle)}</td>
      <td>{getDepartmentLabel(employee.department)}</td>
      <td>{managerName}</td>
      <td>
        <span
          className={`badge badge--${statusBadgeClass(employee.employmentStatus)}`}
        >
          {getStatusLabel(employee.employmentStatus)}
        </span>
      </td>
      <td className="actions">
        <button
          className="btn btn--sm btn--secondary"
          onClick={() => onEdit(employee)}
          aria-label={`Edit ${employee.firstName} ${employee.lastName}`}
        >
          Edit
        </button>
      </td>
    </tr>
  );
}

function statusBadgeClass(status) {
  switch (status) {
    case "FULL_TIME":
      return "success";
    case "PART_TIME":
      return "info";
    case "CONTRACT":
      return "warning";
    case "INTERN":
      return "neutral";
    default:
      return "neutral";
  }
}
