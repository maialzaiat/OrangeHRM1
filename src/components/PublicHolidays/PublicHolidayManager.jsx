import React, { useState } from "react";
import { LOCATION_OPTIONS } from "../../services/holidaysService";
import { useHolidays } from "../../hooks/useHolidays";
import HolidayForm from "./HolidayForm";
import HolidayList from "./HolidayList";
import HolidayCalendar from "./HolidayCalendar";
import "./PublicHolidayManager.css";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

const TAB = { LIST: "list", CALENDAR: "calendar" };

/**
 * DEV-118: Main container for managing public holidays.
 * Wires together the form, list, calendar, and leave integration logic.
 */
export default function PublicHolidayManager({
  initialHolidays = [],
  initialLeaveRequests = [],
}) {
  const {
    filteredHolidays,
    calendarHolidays,
    error,
    locationFilter,
    setLocationFilter,
    selectedYear,
    setSelectedYear,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    clearError,
  } = useHolidays(initialHolidays, initialLeaveRequests);

  const [activeTab, setActiveTab] = useState(TAB.LIST);
  const [showForm, setShowForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);

  function handleFormSubmit(formData) {
    const success = editingHoliday
      ? updateHoliday(editingHoliday.id, formData)
      : addHoliday(formData);

    if (success) {
      setShowForm(false);
      setEditingHoliday(null);
    }
  }

  function handleEdit(holiday) {
    setEditingHoliday(holiday);
    setShowForm(true);
    clearError();
  }

  function handleCancel() {
    setShowForm(false);
    setEditingHoliday(null);
    clearError();
  }

  return (
    <div className="phm-container">
      {/* Header */}
      <header className="phm-header">
        <h2>Public Holiday Management</h2>
        {!showForm && (
          <button
            className="btn btn--primary"
            onClick={() => {
              setShowForm(true);
              setEditingHoliday(null);
              clearError();
            }}
          >
            + Add Holiday
          </button>
        )}
      </header>

      {/* Add / Edit Form */}
      {showForm && (
        <section className="phm-form-section" aria-label="Holiday form">
          <HolidayForm
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            initialData={editingHoliday}
            error={error}
          />
        </section>
      )}

      {/* Filters */}
      <div className="phm-filters">
        <div className="filter-group">
          <label htmlFor="year-filter">Year</label>
          <select
            id="year-filter"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="location-filter">Location</label>
          <select
            id="location-filter"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            {LOCATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <nav className="phm-tabs" role="tablist" aria-label="Holiday views">
        <button
          role="tab"
          aria-selected={activeTab === TAB.LIST}
          className={`tab-btn ${activeTab === TAB.LIST ? "tab-btn--active" : ""}`}
          onClick={() => setActiveTab(TAB.LIST)}
        >
          List View
        </button>
        <button
          role="tab"
          aria-selected={activeTab === TAB.CALENDAR}
          className={`tab-btn ${activeTab === TAB.CALENDAR ? "tab-btn--active" : ""}`}
          onClick={() => setActiveTab(TAB.CALENDAR)}
        >
          Calendar View
        </button>
      </nav>

      {/* Content */}
      <section className="phm-content">
        {activeTab === TAB.LIST ? (
          <HolidayList
            holidays={filteredHolidays}
            onEdit={handleEdit}
            onDelete={deleteHoliday}
          />
        ) : (
          <HolidayCalendar
            calendarHolidays={calendarHolidays}
            year={selectedYear}
          />
        )}
      </section>
    </div>
  );
}
