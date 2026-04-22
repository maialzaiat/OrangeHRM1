import React from "react";
import { HOLIDAY_TYPE, LOCATION_OPTIONS } from "../../services/holidaysService";

const LOCATION_LABELS = Object.fromEntries(
  LOCATION_OPTIONS.map(({ value, label }) => [value, label]),
);

/**
 * DEV-118: Displays the list of public holidays with edit / delete actions.
 */
export default function HolidayList({ holidays, onEdit, onDelete }) {
  if (!holidays.length) {
    return (
      <p className="empty-state">
        No public holidays defined for the selected period.
      </p>
    );
  }

  return (
    <table className="holiday-table" aria-label="Public Holidays">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Date</th>
          <th scope="col">Type</th>
          <th scope="col">Recurring</th>
          <th scope="col">Location</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {holidays.map((holiday) => (
          <HolidayRow
            key={holiday.id}
            holiday={holiday}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  );
}

function HolidayRow({ holiday, onEdit, onDelete }) {
  const typeLabel =
    holiday.type === HOLIDAY_TYPE.HALF_DAY ? "Half Day" : "Full Day";
  const locationLabel = LOCATION_LABELS[holiday.location] ?? holiday.location;

  function handleDelete() {
    if (window.confirm(`Delete "${holiday.name}"? This cannot be undone.`)) {
      onDelete(holiday.id);
    }
  }

  return (
    <tr>
      <td>{holiday.name}</td>
      <td>{holiday.date}</td>
      <td>
        <span
          className={`badge badge--${holiday.type === HOLIDAY_TYPE.HALF_DAY ? "warning" : "info"}`}
        >
          {typeLabel}
        </span>
      </td>
      <td>{holiday.recurring ? "✓ Yes" : "—"}</td>
      <td>{locationLabel}</td>
      <td className="actions">
        <button
          className="btn btn--sm btn--secondary"
          onClick={() => onEdit(holiday)}
          aria-label={`Edit ${holiday.name}`}
        >
          Edit
        </button>
        <button
          className="btn btn--sm btn--danger"
          onClick={handleDelete}
          aria-label={`Delete ${holiday.name}`}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
