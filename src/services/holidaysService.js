/**
 * DEV-118: Managing Public Holidays
 * Service layer for holiday CRUD, leave integration, and recalculation logic.
 */

export const HOLIDAY_TYPE = {
  FULL_DAY: "FULL_DAY",
  HALF_DAY: "HALF_DAY",
};

export const ALL_LOCATIONS = "ALL_LOCATIONS";

export const LOCATION_OPTIONS = [
  { value: ALL_LOCATIONS, label: "All Locations" },
  { value: "HQ", label: "Headquarters" },
  { value: "BRANCH_A", label: "Branch A" },
  { value: "BRANCH_B", label: "Branch B" },
];

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Checks for a duplicate holiday: same date + same location (or ALL_LOCATIONS overlap).
 * @param {Object[]} holidays  - Existing holiday list
 * @param {Object}   candidate - Holiday being added/updated
 * @param {string}   [excludeId] - ID of the record being edited (skip self-match)
 * @returns {boolean}
 */
export function isDuplicateHoliday(holidays, candidate, excludeId = null) {
  return holidays.some((h) => {
    if (h.id === excludeId) return false;

    const sameDate = normalizeDate(h.date) === normalizeDate(candidate.date);
    if (!sameDate) return false;

    const locationOverlap =
      h.location === ALL_LOCATIONS ||
      candidate.location === ALL_LOCATIONS ||
      h.location === candidate.location;

    return locationOverlap;
  });
}

// ---------------------------------------------------------------------------
// Leave Integration
// ---------------------------------------------------------------------------

/**
 * Returns an array of dates (YYYY-MM-DD strings) within [startDate, endDate]
 * that are public holidays for the given location.
 * These days should be excluded from leave deductions.
 *
 * @param {Object[]} holidays
 * @param {string}   startDate  - YYYY-MM-DD
 * @param {string}   endDate    - YYYY-MM-DD
 * @param {string}   location   - employee's location key
 * @param {number}   [year]     - override year for recurring check (defaults to leave year)
 * @returns {{ date: string, type: string }[]}
 */
export function getHolidaysInRange(holidays, startDate, endDate, location) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return holidays
    .filter((h) => {
      const applies = h.location === ALL_LOCATIONS || h.location === location;
      if (!applies) return false;

      const holidayDate = resolveHolidayDate(h, start.getFullYear());
      return holidayDate >= start && holidayDate <= end;
    })
    .map((h) => ({
      date: normalizeDate(resolveHolidayDate(h, start.getFullYear())),
      type: h.type,
      name: h.name,
    }));
}

/**
 * Calculates effective leave days deducted from a leave request,
 * automatically excluding any public holidays in the range.
 *
 * @param {Object[]} holidays
 * @param {string}   startDate  - YYYY-MM-DD
 * @param {string}   endDate    - YYYY-MM-DD
 * @param {string}   location
 * @param {string[]} workingDays - e.g. ['Monday','Tuesday','Wednesday','Thursday','Friday']
 * @returns {{ totalDays: number, deductedDays: number, excludedHolidays: Object[] }}
 */
export function calculateLeaveDeduction(
  holidays,
  startDate,
  endDate,
  location,
  workingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
) {
  const overlappingHolidays = getHolidaysInRange(
    holidays,
    startDate,
    endDate,
    location,
  );
  const holidayDates = new Set(overlappingHolidays.map((h) => h.date));

  let totalDays = 0;
  let deductedDays = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dayName = DAY_NAMES[current.getDay()];
    const dateStr = normalizeDate(current);

    if (workingDays.includes(dayName)) {
      totalDays++;
      if (!holidayDates.has(dateStr)) {
        deductedDays++;
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return { totalDays, deductedDays, excludedHolidays: overlappingHolidays };
}

/**
 * Recalculates leave balance for all leave requests that overlap with a newly
 * added holiday. Returns updated leave requests with revised deducted days.
 *
 * @param {Object[]} leaveRequests
 * @param {Object[]} holidays
 * @param {Object}   newHoliday
 * @param {string}   employeeLocation
 * @returns {Object[]} updated leave requests
 */
export function recalculateLeaveBalances(
  leaveRequests,
  holidays,
  newHoliday,
  employeeLocation,
) {
  return leaveRequests.map((request) => {
    const locationMatch =
      newHoliday.location === ALL_LOCATIONS ||
      newHoliday.location === employeeLocation;

    if (!locationMatch) return request;

    const holidayDate = resolveHolidayDate(
      newHoliday,
      new Date(request.startDate).getFullYear(),
    );
    const holidayStr = normalizeDate(holidayDate);
    const requestStart = new Date(request.startDate);
    const requestEnd = new Date(request.endDate);

    if (holidayDate >= requestStart && holidayDate <= requestEnd) {
      const deduction = newHoliday.type === HOLIDAY_TYPE.HALF_DAY ? 0.5 : 1;

      return {
        ...request,
        deductedDays: Math.max(0, request.deductedDays - deduction),
        recalculatedAt: new Date().toISOString(),
        recalculationReason: `Holiday added: ${newHoliday.name} on ${holidayStr}`,
      };
    }

    return request;
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeDate(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split("T")[0];
}

/**
 * For recurring holidays, shift the stored date to the target year.
 */
function resolveHolidayDate(holiday, targetYear) {
  const base = new Date(holiday.date);
  if (holiday.recurring) {
    base.setFullYear(targetYear);
  }
  return base;
}
