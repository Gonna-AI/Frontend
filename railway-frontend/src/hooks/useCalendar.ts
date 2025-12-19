import { create } from 'zustand';
import { adminApi } from '../config/api';
import { useState, useEffect } from 'react';

interface CalendarState {
  selectedDates: Set<string>;
  addDate: (date: string) => void;
  removeDate: (date: string) => void;
  toggleDate: (date: string) => void;
  clearAllDates: () => void;
  isLoading: boolean;
  error: string | null;
  saveDates: (datesToSave: string[], datesToRemove: string[]) => void;
}

export const useCalendar = () => {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch busy dates on initial load
  useEffect(() => {
    const fetchBusyDates = async () => {
      setIsLoading(true);
      try {
        const response = await adminApi.getBusyDates();
        const busyDates = new Set(response.data.busy_dates);
        setSelectedDates(busyDates);
      } catch (err) {
        setError('Failed to fetch busy dates.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusyDates();
  }, []);

  // Function to toggle date selection
  const toggleDate = (dateStr: string) => {
    const newDates = new Set(selectedDates);
    if (newDates.has(dateStr)) {
      newDates.delete(dateStr);
    } else {
      newDates.add(dateStr);
    }
    setSelectedDates(newDates);
  };

  // Function to clear all selected dates
  const clearAllDates = () => {
    setSelectedDates(new Set());
  };

  // Function to save selected dates to the backend
  const saveDates = async (datesToAdd: string[], datesToRemove: string[]) => {
    setIsLoading(true);
    try {
      const savePromises = [];

      // Call markBusyDates only if there are dates to add
      if (datesToAdd.length > 0) {
        savePromises.push(adminApi.markBusyDates({ dates: datesToAdd }));
      }

      // Call unmarkBusyDates only if there are dates to remove
      if (datesToRemove.length > 0) {
        savePromises.push(adminApi.unmarkBusyDates({ dates: datesToRemove }));
      }

      // Wait for all API calls to complete
      await Promise.all(savePromises);

      // Update local state after successful API calls
      setSelectedDates((prevSelectedDates) => {
        const newSelectedDates = new Set(prevSelectedDates);
        datesToAdd.forEach((date) => newSelectedDates.add(date));
        datesToRemove.forEach((date) => newSelectedDates.delete(date));
        return newSelectedDates;
      });

      setError(null);
    } catch (err) {
      setError('Failed to save dates.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedDates,
    toggleDate,
    clearAllDates,
    isLoading,
    error,
    saveDates,
  };
};