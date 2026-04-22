import React, { useMemo } from "react";
import { HOLIDAY_TYPE } from "../services/holidaysService";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * DEV-118: Calendar view — shows approved public holidays for the selected year.
 * Each month is rendered as a mini-calendar with holiday markers.
 */
export default function HolidayCalendar({ calendarHolidays, year }) {
  const holidayMap = useMemo(() => {
    const map = {};
    calendarHolidays.forEach((h) => {
      map[h.resolvedDate] = h;
    });
    return map;
  }, [calendarHolidays]);

  return (
    <div
      className="holiday-calendar"
      aria-label={`Holiday calendar for ${year}`}
    >
      <div className="calendar-legend">
        <span className="legend-item legend-item--full">Full Day Holiday</span>
        <span className="legend-item legend-item--half">Half Day Holiday</span>
      </div>
      <div className="calendar-grid">
        {MONTH_NAMES.map((monthName, monthIndex) => (
          <MonthView
            key={monthName}
            year={year}
            monthIndex={monthIndex}
            monthName={monthName}
            holidayMap={holidayMap}
          />
        ))}
      </div>
    </div>
  );
}

function MonthView({ year, monthIndex, monthName, holidayMap }) {
  const { weeks } = useMemo(
    () => buildMonthGrid(year, monthIndex),
    [year, monthIndex],
  );

  return (
    <div className="calendar-month" aria-label={`${monthName} ${year}`}>
      <h4 className="month-title">{monthName}</h4>
      <div className="month-grid">
        {DAY_NAMES.map((d) => (
          <div key={d} className="calendar-cell calendar-cell--header">
            {d}
          </div>
        ))}
        {weeks.flat().map((cell, idx) => {
          if (!cell) {
            return (
              <div
                key={`empty-${idx}`}
                className="calendar-cell calendar-cell--empty"
              />
            );
          }

          const dateStr = formatDate(year, monthIndex, cell);
          const holiday = holidayMap[dateStr];
          const isHalf = holiday?.type === HOLIDAY_TYPE.HALF_DAY;

          return (
            <div
              key={dateStr}
              className={[
                "calendar-cell",
                holiday
                  ? isHalf
                    ? "calendar-cell--half-holiday"
                    : "calendar-cell--holiday"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              title={
                holiday
                  ? `${holiday.name}${isHalf ? " (Half Day)" : ""}`
                  : undefined
              }
              aria-label={
                holiday
                  ? `${cell} ${monthName}: ${holiday.name}${isHalf ? " – Half Day" : ""}`
                  : `${cell} ${monthName}`
              }
            >
              {cell}
              {holiday && <span className="holiday-dot" aria-hidden="true" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(
      cells
        .slice(i, i + 7)
        .concat(Array(7).fill(null))
        .slice(0, 7),
    );
  }

  return { weeks };
}

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
