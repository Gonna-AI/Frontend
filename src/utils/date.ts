export function getDaysInMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  return { daysInMonth, firstDay };
}

// Add mock appointment data (replace with real data later)
export function getAppointmentsForDate(date: Date): number {
  // This is just for demo - replace with actual appointment counting logic
  const day = date.getDate();
  if (day % 7 === 0) return 6; // Red
  if (day % 5 === 0) return 4; // Yellow
  if (day % 3 === 0) return 2; // Green
  return 0;
}

export function getAppointmentColor(count: number): string {
  if (count >= 5) return 'bg-red-500';
  if (count >= 3) return 'bg-yellow-500';
  if (count >= 1) return 'bg-green-500';
  return '';
}