import { addDays, setHours, setMinutes } from "date-fns";

const today = new Date();
const d = (offsetDays: number) => addDays(today, offsetDays);
const dt = (offsetDays: number, hour: number, min = 0) => setMinutes(setHours(addDays(today, offsetDays), hour), min);

export const demoEvents = [
  // Bergmann Maschinenbau GmbH – CNC-Paket 2026 (AI-erkannte Meilensteine)
  { title: "AB-Ausstellungsfrist – Bergmann Maschinenbau", start: d(3), allDay: true },
  { title: "KickOff 1 (AL) – Bergmann Maschinenbau", start: dt(5, 9, 30), end: dt(5, 10, 30) },
  { title: "KickOff 2 (PTL) – Bergmann Maschinenbau", start: dt(12, 10), end: dt(12, 11) },
  { title: "Liefertermin (KW 36) – Bergmann Maschinenbau", start: d(34), allDay: true },

  // Weber Präzisionstechnik GmbH
  { title: "KickOff 1 (AL) – Weber Präzisionstechnik", start: dt(8, 11), end: dt(8, 12) },
  { title: "Angebotsprüfung fällig – Weber Präzisionstechnik", start: d(15), allDay: true },
  { title: "KickOff 2 (PTL) – Weber Präzisionstechnik", start: dt(19, 14), end: dt(19, 15) },

  // MK Anlagenbau GmbH
  { title: "AB-Ausstellungsfrist – MK Anlagenbau", start: d(9), allDay: true },
  { title: "Liefertermin (KW 40) – MK Anlagenbau", start: d(45), allDay: true },

  // Internal
  { groupId: "standup", title: "Team-Standup Kostencheck Copilot", start: dt(1, 10) },
  { groupId: "standup", title: "Team-Standup Kostencheck Copilot", start: dt(8, 10) },
  { title: "Monatliche Kapazitätsplanung", start: dt(2, 9, 30), end: dt(2, 10, 30) },
];
