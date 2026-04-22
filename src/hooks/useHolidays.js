import { useState, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  isDuplicateHoliday,
  getHolidaysInRange,
  calculateLeaveDeduction,
  recalculateLeaveBalances,
  ALL_LOCATIONS,
} from "../services/holidaysService";

/**
 * DEV-118: Custom hook encapsulating all public holiday state and operations.
 */
export function useHolidays(initialHolidays = [], initialLeaveRequests = []) {
  const [holidays, setHolidays] = useState(initialHolidays);
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
  const [error, setError] = useState(null);
  const [locationFilter, setLocationFilter] = useState(ALL_LOCATIONS);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------

  const addHoliday = useCallback(
    (holidayData) => {
      if (isDuplicateHoliday(holidays, holidayData)) {
        setError("A holiday already exists for this date and location.");
        return false;
      }

      const newHoliday = {
        ...holidayData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      setHolidays((prev) => [...prev, newHoliday]);

      // Recalculate any existing leave requests that overlap this new holiday
      setLeaveRequests((prev) =>
        recalculateLeaveBalances(
          prev,
          [...holidays, newHoliday],
          newHoliday,
          holidayData.location,
        ),
      );

      setError(null);
      return true;
    },
    [holidays],
  );

  const updateHoliday = useCallback(
    (id, updatedData) => {
      if (isDuplicateHoliday(holidays, updatedData, id)) {
        setError("A holiday already exists for this date and location.");
        return false;
      }

      setHolidays((prev) =>
        prev.map((h) =>
          h.id === id
            ? { ...h, ...updatedData, updatedAt: new Date().toISOString() }
            : h,
        ),
      );
      setError(null);
      return true;
    },
    [holidays],
  );

  const deleteHoliday = useCallback((id) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  }, []);

  // ---------------------------------------------------------------------------
  // Leave Integration
  // ---------------------------------------------------------------------------

  const getHolidaysForLeave = useCallback(
    (startDate, endDate, location) =>
      getHolidaysInRange(holidays, startDate, endDate, location),
    [holidays],
  );

  const getLeaveDeduction = useCallback(
    (startDate, endDate, location, workingDays) =>
      calculateLeaveDeduction(
        holidays,
        startDate,
        endDate,
        location,
        workingDays,
      ),
    [holidays],
  );

  // ---------------------------------------------------------------------------
  // Filtered / derived data
  // ---------------------------------------------------------------------------

  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) => {
      const yearMatch =
        new Date(h.date).getFullYear() === selectedYear || h.recurring;
      const locationMatch =
        locationFilter === ALL_LOCATIONS ||
        h.location === ALL_LOCATIONS ||
        h.location === locationFilter;
      return yearMatch && locationMatch;
    });
  }, [holidays, locationFilter, selectedYear]);

  const calendarHolidays = useMemo(() => {
    return filteredHolidays.map((h) => {
      const d = new Date(h.date);
      if (h.recurring) d.setFullYear(selectedYear);
      return { ...h, resolvedDate: d.toISOString().split("T")[0] };
    });
  }, [filteredHolidays, selectedYear]);

  return {
    holidays,
    filteredHolidays,
    calendarHolidays,
    leaveRequests,
    error,
    locationFilter,
    setLocationFilter,
    selectedYear,
    setSelectedYear,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    getHolidaysForLeave,
    getLeaveDeduction,
    clearError: () => setError(null),
  };
}
