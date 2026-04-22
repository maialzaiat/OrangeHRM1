import React, { useState, useEffect } from "react";
import {
  DEPARTMENTS,
  JOB_TITLES,
  EMPLOYMENT_STATUS,
} from "../../services/employeeService";

const DEFAULT_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  jobTitle: "",
  department: "",
  managerId: "",
  employmentStatus: "FULL_TIME",
};

/**
 * DEV-18: Form for editing an employee's record.
 * Covers: job title, department, manager change, status, and contact info.
 *
 * @param {Object}   employee        - Current employee data to pre-populate
 * @param {Object[]} managerOptions  - Employees eligible to be a manager
 * @param {Object}   fieldErrors     - Per-field validation errors from the hook
 * @param {string}   error           - General error message
 * @param {Function} onSubmit        - Called with the updated form data
 * @param {Function} onCancel        - Called when user cancels the edit
 */
export default function EmployeeForm({
  employee,
  managerOptions = [],
  fieldErrors = {},
  error,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (employee) {
      setForm({ ...DEFAULT_FORM, ...employee });
    }
  }, [employee]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="employee-form"
      aria-label="Update Employee Form"
      noValidate
    >
      <h3>Update Employee Record</h3>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {/* Name row */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={form.firstName}
            onChange={handleChange}
            maxLength={100}
            required
            aria-invalid={!!fieldErrors.firstName}
            aria-describedby={
              fieldErrors.firstName ? "firstName-error" : undefined
            }
          />
          {fieldErrors.firstName && (
            <span id="firstName-error" className="field-error">
              {fieldErrors.firstName}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={form.lastName}
            onChange={handleChange}
            maxLength={100}
            required
            aria-invalid={!!fieldErrors.lastName}
            aria-describedby={
              fieldErrors.lastName ? "lastName-error" : undefined
            }
          />
          {fieldErrors.lastName && (
            <span id="lastName-error" className="field-error">
              {fieldErrors.lastName}
            </span>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          maxLength={254}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
        />
        {fieldErrors.email && (
          <span id="email-error" className="field-error">
            {fieldErrors.email}
          </span>
        )}
      </div>

      {/* Job Title */}
      <div className="form-group">
        <label htmlFor="jobTitle">Job Title *</label>
        <select
          id="jobTitle"
          name="jobTitle"
          value={form.jobTitle}
          onChange={handleChange}
          required
          aria-invalid={!!fieldErrors.jobTitle}
          aria-describedby={fieldErrors.jobTitle ? "jobTitle-error" : undefined}
        >
          <option value="">— Select job title —</option>
          {JOB_TITLES.map((jt) => (
            <option key={jt.value} value={jt.value}>
              {jt.label}
            </option>
          ))}
        </select>
        {fieldErrors.jobTitle && (
          <span id="jobTitle-error" className="field-error">
            {fieldErrors.jobTitle}
          </span>
        )}
      </div>

      {/* Department */}
      <div className="form-group">
        <label htmlFor="department">Department *</label>
        <select
          id="department"
          name="department"
          value={form.department}
          onChange={handleChange}
          required
          aria-invalid={!!fieldErrors.department}
          aria-describedby={
            fieldErrors.department ? "department-error" : undefined
          }
        >
          <option value="">— Select department —</option>
          {DEPARTMENTS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        {fieldErrors.department && (
          <span id="department-error" className="field-error">
            {fieldErrors.department}
          </span>
        )}
      </div>

      {/* Manager */}
      <div className="form-group">
        <label htmlFor="managerId">Manager</label>
        <select
          id="managerId"
          name="managerId"
          value={form.managerId}
          onChange={handleChange}
        >
          <option value="">— No manager —</option>
          {managerOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.firstName} {m.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Employment Status */}
      <div className="form-group">
        <label htmlFor="employmentStatus">Employment Status *</label>
        <select
          id="employmentStatus"
          name="employmentStatus"
          value={form.employmentStatus}
          onChange={handleChange}
          required
          aria-invalid={!!fieldErrors.employmentStatus}
          aria-describedby={
            fieldErrors.employmentStatus ? "employmentStatus-error" : undefined
          }
        >
          {EMPLOYMENT_STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {fieldErrors.employmentStatus && (
          <span id="employmentStatus-error" className="field-error">
            {fieldErrors.employmentStatus}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="submit" className="btn btn--primary">
          Save Changes
        </button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
