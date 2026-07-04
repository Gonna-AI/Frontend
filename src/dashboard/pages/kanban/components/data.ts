import type { BoardState, Column, ColumnId, TaskOwnerProfile, TaskTeam } from "./types";

export const columns = [
  { id: "ideas", title: "Erkannt" },
  { id: "planned", title: "Geprüft" },
  { id: "building", title: "In Beschaffung" },
  { id: "qa", title: "In Beschaffung (Prüfung)" },
  { id: "shipped", title: "Erledigt" },
] as const satisfies readonly Column[];

export const columnIds = columns.map((column) => column.id);

// The board keeps 5 visual columns, but `pipeline_checklist_items.status` only has 3 states
// (open | in_progress | done). Each column maps to the DB status it writes when a card is
// dropped there; "planned" is the canonical column live in_progress items land back in after a
// refetch/Realtime tick (building/qa are treated as sub-stages of the same in_progress status).
export const columnIdToChecklistStatus: Record<ColumnId, "open" | "in_progress" | "done"> = {
  ideas: "open",
  planned: "in_progress",
  building: "in_progress",
  qa: "in_progress",
  shipped: "done",
};

// Where a freshly (re)fetched checklist item of a given DB status is placed on the board.
export const checklistStatusToColumnId: Record<"open" | "in_progress" | "done", ColumnId> = {
  open: "ideas",
  in_progress: "planned",
  done: "shipped",
};

export const tagTones: Record<TaskTeam, string> = {
  Backend: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  Data: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Design: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  Docs: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  "Finance Ops": "bg-teal-500/10 text-teal-700 dark:text-teal-300",
  Platform: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  Product: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  QA: "bg-red-500/10 text-red-700 dark:text-red-300",
  Security: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
};

const taskOwners = {
  arham: {
    name: "Markus Vogel (AL)",
    tone: "[&_[data-slot=avatar-fallback]]:bg-zinc-100 [&_[data-slot=avatar-fallback]]:text-zinc-700 after:border-zinc-200 dark:[&_[data-slot=avatar-fallback]]:bg-zinc-500/15 dark:[&_[data-slot=avatar-fallback]]:text-zinc-300 dark:after:border-zinc-500/20",
  },
  junaid: {
    name: "Sebastian Krüger (PTL)",
    tone: "[&_[data-slot=avatar-fallback]]:bg-lime-100 [&_[data-slot=avatar-fallback]]:text-lime-700 after:border-lime-200 dark:[&_[data-slot=avatar-fallback]]:bg-lime-500/15 dark:[&_[data-slot=avatar-fallback]]:text-lime-300 dark:after:border-lime-500/20",
  },
  maya: {
    name: "Franziska Wagner (Einkauf)",
    tone: "[&_[data-slot=avatar-fallback]]:bg-indigo-100 [&_[data-slot=avatar-fallback]]:text-indigo-700 after:border-indigo-200 dark:[&_[data-slot=avatar-fallback]]:bg-indigo-500/15 dark:[&_[data-slot=avatar-fallback]]:text-indigo-300 dark:after:border-indigo-500/20",
  },
  meera: {
    name: "Julia Hoffmann (PTL)",
    tone: "[&_[data-slot=avatar-fallback]]:bg-fuchsia-100 [&_[data-slot=avatar-fallback]]:text-fuchsia-700 after:border-fuchsia-200 dark:[&_[data-slot=avatar-fallback]]:bg-fuchsia-500/15 dark:[&_[data-slot=avatar-fallback]]:text-fuchsia-300 dark:after:border-fuchsia-500/20",
  },
  nisha: {
    name: "Katrin Neumann (AL)",
    tone: "[&_[data-slot=avatar-fallback]]:bg-violet-100 [&_[data-slot=avatar-fallback]]:text-violet-700 after:border-violet-200 dark:[&_[data-slot=avatar-fallback]]:bg-violet-500/15 dark:[&_[data-slot=avatar-fallback]]:text-violet-300 dark:after:border-violet-500/20",
  },
  rahul: {
    name: "Thomas Bauer (Einkauf)",
    tone: "[&_[data-slot=avatar-fallback]]:bg-pink-100 [&_[data-slot=avatar-fallback]]:text-pink-700 after:border-pink-200 dark:[&_[data-slot=avatar-fallback]]:bg-pink-500/15 dark:[&_[data-slot=avatar-fallback]]:text-pink-300 dark:after:border-pink-500/20",
  },
  sara: {
    name: "Nadine Fischer (PTL)",
    tone: "[&_[data-slot=avatar-fallback]]:bg-sky-100 [&_[data-slot=avatar-fallback]]:text-sky-700 after:border-sky-200 dark:[&_[data-slot=avatar-fallback]]:bg-sky-500/15 dark:[&_[data-slot=avatar-fallback]]:text-sky-300 dark:after:border-sky-500/20",
  },
} satisfies Record<string, TaskOwnerProfile>;

export const fallbackTaskOwners = taskOwners;

export const initialBoard: BoardState = {
  ideas: [
    {
      id: "sondermotor-tm75-bestellen",
      title: "Sondermotor TM-75 bestellen",
      description: "Lieferzeit 14 Wochen — Bestellung für Bergmann Maschinenbau (CNC-Paket 2026) auslösen.",
      priority: "High",
      dueDate: "KW 29",
      progress: 10,
      owner: taskOwners.rahul,
      team: "Product",
      insights: [
        { label: "Comments", count: 4 },
        { label: "Documents", count: 1 },
      ],
    },
    {
      id: "spannsystem-menge-bestaetigen",
      title: "Abweichung Spannsystem-Menge (4→5) mit Kunde bestätigen",
      description: "AI-Vergleich A-2026-0142 vs. B-88431 zeigt Mengenabweichung SP-200, +1.250 €.",
      priority: "Medium",
      dueDate: "KW 29",
      progress: 15,
      owner: taskOwners.arham,
      team: "Finance Ops",
      insights: [
        { label: "Comments", count: 3 },
      ],
    },
    {
      id: "weber-angebot-pruefen",
      title: "Angebot A-2026-0198 für Weber Präzisionstechnik gegenprüfen",
      description: "Erste automatische Abweichungsprüfung nach Bestelleingang anstoßen.",
      priority: "Medium",
      dueDate: "KW 30",
      progress: 5,
      owner: taskOwners.sara,
      team: "Product",
      insights: [{ label: "Comments", count: 2 }],
    },
    {
      id: "mk-anlagenbau-liefertermin",
      title: "MK Anlagenbau: Liefertermin-Verschiebung sichten",
      description: "Automatisch erkannte Terminänderung im Bestelltext gegen Angebot abgleichen.",
      priority: "Low",
      dueDate: "KW 30",
      progress: 0,
      owner: taskOwners.meera,
      team: "Platform",
      insights: [{ label: "Comments", count: 1 }],
    },
  ],
  planned: [
    {
      id: "reitstock-rs90-freigeben",
      title: "Ersatzartikel Reitstock RS-90 technisch freigeben",
      description: "RS-90 ersetzt RS-100 aus dem Angebot (-900 €). Technische Freigabe durch PTL erforderlich.",
      priority: "High",
      dueDate: "KW 30",
      progress: 20,
      owner: taskOwners.junaid,
      team: "Backend",
      insights: [
        { label: "Attachments", count: 2 },
        { label: "Comments", count: 6 },
        { label: "Documents", count: 1 },
      ],
    },
    {
      id: "steuerungsverkabelung-klaeren",
      title: "Fehlende Position Steuerungsverkabelung klären",
      description: "Steuerungsverkabelung fehlt vollständig in der Bestellung (-2.100 €). Rückfrage beim Kunden nötig.",
      priority: "High",
      dueDate: "KW 30",
      progress: 15,
      owner: taskOwners.nisha,
      team: "QA",
      insights: [
        { label: "Attachments", count: 1 },
        { label: "Comments", count: 5 },
      ],
    },
    {
      id: "weber-kickoff-vorbereiten",
      title: "KickOff-Termin für Weber Präzisionstechnik vorbereiten",
      description: "Terminvorschläge und Agenda für KickOff 1 (AL) zusammenstellen.",
      priority: "Medium",
      dueDate: "KW 30",
      progress: 10,
      owner: taskOwners.maya,
      team: "Product",
      insights: [
        { label: "Comments", count: 3 },
      ],
    },
  ],
  building: [
    {
      id: "zahlungskonditionen-freigeben",
      title: "Zahlungskonditionen-Änderung (60 Tage) intern freigeben",
      description: "Zahlungsziel im Bestelltext still auf 60 Tage netto geändert (Original: 30 Tage). Hohe Relevanz, niedrige Konfidenz.",
      priority: "High",
      dueDate: "KW 31",
      progress: 55,
      owner: taskOwners.arham,
      team: "Finance Ops",
      insights: [
        { label: "Attachments", count: 3 },
        { label: "Comments", count: 9 },
        { label: "Documents", count: 2 },
      ],
    },
    {
      id: "ab-entwurf-erstellen",
      title: "AB-Entwurf für B-88431 erstellen",
      description: "Auftragsbestätigung mit markierten Abweichungen (RS-90, fehlende Verkabelung, Zahlungsziel) vorbereiten.",
      priority: "High",
      dueDate: "KW 31",
      progress: 40,
      owner: taskOwners.meera,
      team: "Data",
      insights: [
        { label: "Attachments", count: 2 },
        { label: "Comments", count: 7 },
        { label: "Documents", count: 3 },
      ],
    },
    {
      id: "mk-anlagenbau-einkauf",
      title: "MK Anlagenbau: Ersatzteile beim Zulieferer anfragen",
      description: "Angefragte Mengenänderung an Zulieferer weiterleiten und Bestätigung einholen.",
      priority: "Medium",
      dueDate: "KW 31",
      progress: 30,
      owner: taskOwners.rahul,
      team: "Design",
      insights: [
        { label: "Comments", count: 4 },
        { label: "Documents", count: 1 },
      ],
    },
  ],
  qa: [
    {
      id: "abweichungsbericht-review",
      title: "Abweichungsbericht Bergmann Maschinenbau final prüfen",
      description: "Alle 5 Abweichungen (Menge, Ersatzartikel, fehlende Position, Termin, Zahlungsziel) gegenlesen.",
      priority: "High",
      dueDate: "KW 31",
      progress: 80,
      owner: taskOwners.nisha,
      team: "QA",
      insights: [
        { label: "Attachments", count: 4 },
        { label: "Comments", count: 10 },
      ],
    },
    {
      id: "weber-kickoff-brief-review",
      title: "KickOff-Brief für Weber Präzisionstechnik gegenlesen",
      description: "AL/PTL-Brief vor Versand fachlich freigeben.",
      priority: "Medium",
      dueDate: "KW 31",
      progress: 65,
      owner: taskOwners.junaid,
      team: "Finance Ops",
      insights: [
        { label: "Attachments", count: 2 },
        { label: "Comments", count: 5 },
        { label: "Documents", count: 2 },
      ],
    },
  ],
  shipped: [
    {
      id: "angebot-bestellung-abgleich",
      title: "Angebot vs. Bestellung automatisch abgeglichen",
      description: "AI-Vergleich A-2026-0142 vs. B-88431 abgeschlossen: 5 Abweichungen erkannt.",
      priority: "High",
      dueDate: "KW 28",
      progress: 100,
      owner: taskOwners.arham,
      team: "Backend",
      insights: [
        { label: "Comments", count: 6 },
        { label: "Documents", count: 3 },
      ],
    },
    {
      id: "zusammenfassung-generiert",
      title: "AI-Zusammenfassung für Bergmann Maschinenbau generiert",
      description: "Kurzfassung der Auftragslage inkl. Abweichungen für AL/PTL bereitgestellt.",
      priority: "Medium",
      dueDate: "KW 28",
      progress: 100,
      owner: taskOwners.rahul,
      team: "Finance Ops",
      insights: [
        { label: "Attachments", count: 2 },
        { label: "Comments", count: 4 },
      ],
    },
    {
      id: "mk-anlagenbau-checkliste",
      title: "MK Anlagenbau: Checkliste automatisch erzeugt",
      description: "Auto-generierte To-do-Liste aus Bestellvergleich an Projektteam übergeben.",
      priority: "Medium",
      dueDate: "KW 28",
      progress: 100,
      owner: taskOwners.meera,
      team: "Finance Ops",
      insights: [
        { label: "Comments", count: 5 },
        { label: "Documents", count: 2 },
      ],
    },
  ],
};
