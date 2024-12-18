import { create } from 'zustand';

interface CalendarState {
  selectedDates: Set<string>;
  addDate: (date: string) => void;
  removeDate: (date: string) => void;
  toggleDate: (date: string) => void;
}

export const useCalendar = create<CalendarState>((set) => ({
  selectedDates: new Set<string>(),
  addDate: (date) => set((state) => {
    const newDates = new Set(state.selectedDates);
    newDates.add(date);
    return { selectedDates: newDates };
  }),
  removeDate: (date) => set((state) => {
    const newDates = new Set(state.selectedDates);
    newDates.delete(date);
    return { selectedDates: newDates };
  }),
  toggleDate: (date) => set((state) => {
    const newDates = new Set(state.selectedDates);
    if (newDates.has(date)) {
      newDates.delete(date);
    } else {
      newDates.add(date);
    }
    return { selectedDates: newDates };
  }),
}));