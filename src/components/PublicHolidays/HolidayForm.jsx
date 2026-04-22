import React, { useState, useEffect } from "react";
import {
  HOLIDAY_TYPE,
  ALL_LOCATIONS,
  LOCATION_OPTIONS,
} from "../../services/holidaysService";

const DEFAULT_FORM = {
  name: "",
  date: "",
  type: HOLIDAY_TYPE.FULL_DAY,
  recurring: false,
  location: ALL_LOCATIONS,
};

/**
 * DEV-118: Form for creating and editing a public holiday.
 * Covers: Holiday Creation, Recurring Holidays, Location Filtering.
 */
export default function HolidayForm({
  onSubmit,
  onCancel,
  initialData = null,
  error,
}) {
  const [form, setForm] = useState(
    initialData ? { ...DEFAULT_FORM, ...initialData } : DEFAULT_FORM,
  );
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setForm(initialData ? { ...DEFAULT_FORM, ...initialData } : DEFAULT_FORM);
    setValidationError("");
  }, [initialData]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function validate() {
    if (!form.name.trim()) return "Holiday name is required.";
    if (!form.date) return "Date is required.";
    return "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setValidationError(msg);
      return;
    }
    setValidationError("");
    onSubmit(form);
  }

  const displayError = validationError || error;

  return (
    <form
      onSubmit={handleSubmit}
      className="holiday-form"
      aria-label="Public Holiday Form"
    >
      <h3>{initialData ? "Edit Holiday" : "Add Public Holiday"}</h3>

      {displayError && (
        <div className="form-error" role="alert">
          {displayError}
        </div>
      )}

      {/* Holiday Name */}
      <div className="form-group">
        <label htmlFor="name">Holiday Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. New Year's Day"
          maxLength={100}
          required
        />
      </div>

      {/* Date */}
      <div className="form-group">
        <label htmlFor="date">Date *</label>
        <input
          id="date"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
        />
      </div>

      {/* Full Day / Half Day */}
      <div className="form-group">
        <label>Holiday Type *</label>
        <div
          className="radio-group"
          role="radiogroup"
          aria-label="Holiday type"
        >
          <label>
            <input
              type="radio"
              name="type"
              value={HOLIDAY_TYPE.FULL_DAY}
              checked={form.type === HOLIDAY_TYPE.FULL_DAY}
              onChange={handleChange}
            />
            Full Day
          </label>
          <label>
            <input
              type="radio"
              name="type"
              value={HOLIDAY_TYPE.HALF_DAY}
              checked={form.type === HOLIDAY_TYPE.HALF_DAY}
              onChange={handleChange}
            />
            Half Day
          </label>
        </div>
      </div>

      {/* Recurring */}
      <div className="form-group form-group--checkbox">
        <label htmlFor="recurring">
          <input
            id="recurring"
            name="recurring"
            type="checkbox"
            checked={form.recurring}
            onChange={handleChange}
          />
          Recurring Annual Holiday
        </label>
        {form.recurring && (
          <small className="hint">
            This holiday will automatically repeat every year.
          </small>
        )}
      </div>

      {/* Location */}
      <div className="form-group">
        <label htmlFor="location">Location</label>
        <select
          id="location"
          name="location"
          value={form.location}
          onChange={handleChange}
        >
          {LOCATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="submit" className="btn btn--primary">
          {initialData ? "Save Changes" : "Add Holiday"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
