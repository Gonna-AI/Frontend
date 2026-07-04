import { Archive, CircleHelp, File, Inbox, Keyboard, type LucideIcon, Send, Star, Trash2 } from "lucide-react-dash";
import { siFigma, siGoogledocs, siGooglephotos } from "simple-icons";

import type { PipelineGeneratedDocRow } from "@/dashboard/lib/pipelineClient";

const kostencheckCopilot = {
  name: "Kostencheck Copilot",
  email: "copilot@clerktree.ai",
};

const clerkTreePipeline = {
  name: "ClerkTree Pipeline",
  email: "pipeline@clerktree.ai",
};

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const hoursAgo = (hours: number) => minutesAgo(hours * 60);
const daysAgo = (days: number) => hoursAgo(days * 24);

export type Recipient = {
  name: string;
  email: string;
};

export type Attachment = {
  id: string;
  name: string;
  size: string;
  icon: typeof siFigma;
};

export type Mail = {
  id: string;
  accountId: number;
  from: Recipient;
  to: Recipient[];
  cc?: Recipient[];
  subject: string;
  body: string;
  receivedAt: string;
  folder: "inbox" | "drafts" | "sent" | "archive" | "trash";
  isRead: boolean;
  isPinned: boolean;
  isPriority: boolean;
  labels: string[];
  attachments?: Attachment[];
  messageCount?: number;
};

export type MailNavItem = {
  id: string;
  title: string;
  label?: string;
  icon: LucideIcon;
  isActive: boolean;
};

type MailNavigation = {
  navMain: MailNavItem[];
  folders: MailNavItem[];
  navFooter: MailNavItem[];
};

export const mails: Mail[] = [
  {
    id: "6c84fb90-12c4-11e1-840d-7b25c5ee775a",
    accountId: 1,
    from: kostencheckCopilot,
    to: [{ name: "THD GmbH – Vertrieb", email: "vertrieb@thd-gmbh.de" }],
    cc: [clerkTreePipeline],
    subject: "Zusammenfassung – Bergmann Maschinenbau CNC-Paket 2026",
    body: "Die Bestellung B-88431 weicht in 5 Punkten vom Angebot A-2026-0142 ab. Größter Kostenimpact: fehlende Steuerungsverkabelung (-2.100 €) und Mengenänderung Spannsystem (+1.250 €). Zwei Abweichungen (Ersatzartikel Reitstock, Zahlungskonditionen) benötigen manuelle Prüfung.",
    receivedAt: minutesAgo(24),
    folder: "inbox",
    isRead: true,
    isPinned: true,
    isPriority: true,
    labels: ["kostencheck", "bergmann", "wichtig"],
    attachments: [
      {
        id: "abweichungsbericht-b-88431-pdf",
        name: "Abweichungsbericht-B-88431.pdf",
        size: "1.2 MB",
        icon: siGoogledocs,
      },
      {
        id: "angebot-a-2026-0142-pdf",
        name: "Angebot-A-2026-0142.pdf",
        size: "3.4 MB",
        icon: siGoogledocs,
      },
      {
        id: "bestellung-b-88431-png",
        name: "Bestellung-B-88431-Scan.png",
        size: "2.1 MB",
        icon: siGooglephotos,
      },
    ],
  },
  {
    id: "110e8400-e29b-11d4-a716-446655440000",
    accountId: 2,
    from: clerkTreePipeline,
    to: [{ name: "Auftragsleitung", email: "al@thd-gmbh.de" }],
    subject: "KickOff-Brief für AL/PTL",
    body: "Projekt: Bergmann Maschinenbau – CNC-Paket 2026. Kunde: Bergmann Maschinenbau GmbH. Auftragsleiter (AL): KickOff 1 in 5 Tagen — bitte Sondermotor TM-75 vorab an Einkauf melden (Lieferzeit 14 Wochen). Projektleiter Technik (PTL): KickOff 2 in 12 Tagen — Ersatzartikel Reitstock RS-90 vorab technisch prüfen.",
    receivedAt: hoursAgo(2),
    folder: "inbox",
    isRead: true,
    isPinned: true,
    isPriority: false,
    labels: ["kickoff", "bergmann"],
    attachments: [
      {
        id: "kickoff-checkliste-docx",
        name: "KickOff-Checkliste.docx",
        size: "0.8 MB",
        icon: siGoogledocs,
      },
    ],
    messageCount: 3,
  },
  {
    id: "3e7c3f6d-bdf5-46ae-8d90-171300f27ae2",
    accountId: 1,
    from: kostencheckCopilot,
    to: [{ name: "THD GmbH – Vertrieb", email: "vertrieb@thd-gmbh.de" }],
    subject: "Abweichungsbericht B-88431 vs. A-2026-0142",
    body: "1) Spannsystem SP-200: Menge 4→5 (+1.250 €). 2) Reitstock RS-100→RS-90 (-900 €, Freigabe nötig). 3) Steuerungsverkabelung fehlt (-2.100 €). 4) Liefertermin KW38→KW36. 5) Zahlungsziel 30→60 Tage (im Fließtext, niedrige Konfidenz — bitte prüfen).",
    receivedAt: daysAgo(1),
    folder: "inbox",
    isRead: true,
    isPinned: true,
    isPriority: false,
    labels: ["kostencheck", "bergmann"],
  },
  {
    id: "61c35085-72d7-42b4-8d62-738f700d4b92",
    accountId: 1,
    from: clerkTreePipeline,
    to: [{ name: "THD GmbH – Vertrieb", email: "vertrieb@thd-gmbh.de" }],
    subject: "Auftragsbestätigung (Entwurf) AB-88431",
    body: "Hiermit bestätigen wir den Auftrag B-88431 vorbehaltlich Klärung der markierten Abweichungen: Reitstock-Ersatzartikel RS-90, fehlende Steuerungsverkabelung, sowie geänderte Zahlungskonditionen (60 Tage netto).",
    receivedAt: daysAgo(2),
    folder: "inbox",
    isRead: false,
    isPinned: true,
    isPriority: true,
    labels: ["entwurf", "bergmann", "freigabe"],
    attachments: [
      {
        id: "ab-88431-entwurf-docx",
        name: "AB-88431-Entwurf.docx",
        size: "1.4 MB",
        icon: siGoogledocs,
      },
    ],
    messageCount: 2,
  },
  {
    id: "8f7b5db9-d935-4e42-8e05-1f1d0a3dfb97",
    accountId: 2,
    from: kostencheckCopilot,
    to: [{ name: "Weber Präzisionstechnik – Einkauf", email: "einkauf@weber-praezision.de" }],
    subject: "Zusammenfassung – Weber Präzisionstechnik Rundtisch-Nachrüstung 2026",
    body: "Die Bestellung W-55214 weicht in 2 Punkten vom Angebot A-2026-0087 ab. Mengenänderung bei Rundschalttisch RT-350 (+1 Stück, +3.400 €) und eine verkürzte Lieferzeit (KW29 statt KW33). Keine kritischen Abweichungen bei Preis oder Zahlungskonditionen festgestellt.",
    receivedAt: daysAgo(3),
    folder: "inbox",
    isRead: false,
    isPinned: false,
    isPriority: false,
    labels: ["kostencheck", "weber"],
  },
  {
    id: "1f0f2c02-e299-40de-9b1d-86ef9e42126b",
    accountId: 1,
    from: clerkTreePipeline,
    to: [{ name: "Auftragsleitung", email: "al@thd-gmbh.de" }],
    subject: "KickOff-Brief – MK Anlagenbau Steuerungsintegration 2026",
    body: "Projekt: MK Anlagenbau – Steuerungsintegration 2026. Kunde: MK Anlagenbau GmbH. Auftragsleiter (AL): KickOff 1 in 4 Tagen — Lieferantenbestätigung für SPS-Module noch ausstehend. Projektleiter Technik (PTL): KickOff 2 in 10 Tagen — Schaltschrankplanung vorab mit Kunde abstimmen.",
    receivedAt: daysAgo(5),
    folder: "inbox",
    isRead: true,
    isPinned: false,
    isPriority: false,
    labels: ["kickoff", "mk-anlagenbau"],
  },
  {
    id: "17c0a96d-4415-42b1-8b4f-764efab57f66",
    accountId: 2,
    from: kostencheckCopilot,
    to: [{ name: "Weber Präzisionstechnik – Einkauf", email: "einkauf@weber-praezision.de" }],
    cc: [clerkTreePipeline],
    subject: "Abweichungsbericht W-55214 vs. A-2026-0087",
    body: "1) Rundschalttisch RT-350: Menge 2→3 (+3.400 €). 2) Liefertermin KW33→KW29 (früher als geplant, Kapazitätsprüfung empfohlen). Keine weiteren Abweichungen in Preis, Zahlungsziel oder Positionstext gefunden.",
    receivedAt: daysAgo(8),
    folder: "inbox",
    isRead: false,
    isPinned: false,
    isPriority: false,
    labels: ["kostencheck", "weber"],
  },
  {
    id: "2f0130cb-39fc-44c4-bb3c-0a4337edaaab",
    accountId: 1,
    from: clerkTreePipeline,
    to: [{ name: "THD GmbH – Vertrieb", email: "vertrieb@thd-gmbh.de" }],
    subject: "Auftragsbestätigung (Entwurf) AB-55214",
    body: "Hiermit bestätigen wir den Auftrag W-55214 vorbehaltlich Klärung des vorgezogenen Liefertermins (KW29) und der Mengenänderung beim Rundschalttisch RT-350 (2→3 Stück).",
    receivedAt: daysAgo(12),
    folder: "inbox",
    isRead: true,
    isPinned: false,
    isPriority: false,
    labels: ["entwurf", "weber"],
  },
  {
    id: "de305d54-75b4-431b-adb2-eb6b9e546014",
    accountId: 2,
    from: kostencheckCopilot,
    to: [{ name: "MK Anlagenbau – Einkauf", email: "einkauf@mk-anlagenbau.de" }],
    subject: "Zusammenfassung – MK Anlagenbau Steuerungsintegration 2026",
    body: "Die Bestellung M-31207 stimmt in Menge und Preis vollständig mit dem Angebot A-2026-0203 überein. Einzige Abweichung: Zahlungsziel im Anschreiben auf 45 Tage netto geändert (Standard: 30 Tage) — bitte manuell bestätigen.",
    receivedAt: daysAgo(18),
    folder: "inbox",
    isRead: true,
    isPinned: false,
    isPriority: false,
    labels: ["kostencheck", "mk-anlagenbau"],
    attachments: [
      {
        id: "abweichungsbericht-m-31207-pdf",
        name: "Abweichungsbericht-M-31207.pdf",
        size: "0.9 MB",
        icon: siGoogledocs,
      },
    ],
  },
  {
    id: "7dd90c63-00f6-40f3-bd87-5060a24e8ee7",
    accountId: 1,
    from: clerkTreePipeline,
    to: [{ name: "Auftragsleitung", email: "al@thd-gmbh.de" }],
    subject: "KickOff-Brief – Hartmann Antriebstechnik Rundtisch-Retrofit 2026",
    body: "Projekt: Hartmann Antriebstechnik – Rundtisch-Retrofit 2026. Kunde: Hartmann Antriebstechnik GmbH. Auftragsleiter (AL): KickOff 1 in 6 Tagen — Vorprojekt 2024 als Referenz beigefügt. Projektleiter Technik (PTL): KickOff 2 in 14 Tagen — Steuerungsupgrade-Spezifikation final abstimmen.",
    receivedAt: daysAgo(24),
    folder: "inbox",
    isRead: false,
    isPinned: false,
    isPriority: false,
    labels: ["kickoff", "hartmann"],
  },
  {
    id: "99a88f78-3eb4-4d87-87b7-7b15a49a0a05",
    accountId: 2,
    from: kostencheckCopilot,
    to: [{ name: "MK Anlagenbau – Einkauf", email: "einkauf@mk-anlagenbau.de" }],
    subject: "Auftragsbestätigung (Entwurf) AB-31207",
    body: "Hiermit bestätigen wir den Auftrag M-31207 wie im Angebot A-2026-0203 spezifiziert, vorbehaltlich Bestätigung des geänderten Zahlungsziels (45 Tage netto statt 30 Tage).",
    receivedAt: daysAgo(31),
    folder: "inbox",
    isRead: false,
    isPinned: false,
    isPriority: false,
    labels: ["entwurf", "mk-anlagenbau"],
  },
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    accountId: 1,
    from: clerkTreePipeline,
    to: [{ name: "THD GmbH – Vertrieb", email: "vertrieb@thd-gmbh.de" }],
    subject: "Abweichungsbericht H-77012 vs. A-2026-0055 (Hartmann)",
    body: "Prüfung der Bestellung H-77012 gegen Angebot A-2026-0055 abgeschlossen. Keine Abweichungen in Menge, Preis oder Zahlungskonditionen gefunden — deckungsgleich mit dem Vorprojekt 2024. Auftrag kann ohne Rückfragen bestätigt werden.",
    receivedAt: daysAgo(45),
    folder: "inbox",
    isRead: true,
    isPinned: false,
    isPriority: false,
    labels: ["kostencheck", "hartmann"],
  },
  {
    id: "c1a0ecb4-2540-49c5-86f8-21e5ce79e4e6",
    accountId: 2,
    from: clerkTreePipeline,
    to: [{ name: "Auftragsleitung", email: "al@thd-gmbh.de" }],
    subject: "KickOff-Brief – Weber Präzisionstechnik Rundtisch-Nachrüstung 2026",
    body: "Projekt: Weber Präzisionstechnik – Rundtisch-Nachrüstung 2026. Kunde: Weber Präzisionstechnik GmbH. Auftragsleiter (AL): KickOff 1 in 3 Tagen — vorgezogener Liefertermin KW29 mit Fertigung abstimmen. Projektleiter Technik (PTL): KickOff 2 in 9 Tagen — zusätzliches Rundschalttisch-Modul einplanen.",
    receivedAt: daysAgo(62),
    folder: "inbox",
    isRead: false,
    isPinned: false,
    isPriority: false,
    labels: ["kickoff", "weber"],
  },
  {
    id: "ba54eefd-4097-4949-99f2-2a9ae4d1a836",
    accountId: 1,
    from: kostencheckCopilot,
    to: [{ name: "THD GmbH – Vertrieb", email: "vertrieb@thd-gmbh.de" }],
    subject: "Auftragsbestätigung (Entwurf) AB-77012",
    body: "Hiermit bestätigen wir den Auftrag H-77012 wie im Angebot A-2026-0055 spezifiziert. Keine offenen Punkte, Freigabe kann direkt erfolgen.",
    receivedAt: daysAgo(75),
    folder: "inbox",
    isRead: true,
    isPinned: false,
    isPriority: false,
    labels: ["entwurf", "hartmann"],
  },
];

export const mailNavigation: MailNavigation = {
  navMain: [
    {
      id: "inbox",
      title: "Inbox",
      label: "13",
      icon: Inbox,
      isActive: true,
    },
    {
      id: "priority",
      title: "Priority",
      label: "2",
      icon: Star,
      isActive: false,
    },
  ],
  folders: [
    {
      id: "drafts",
      title: "Drafts",
      label: "9",
      icon: File,
      isActive: false,
    },
    {
      id: "sent",
      title: "Sent",
      icon: Send,
      isActive: false,
    },
    {
      id: "archive",
      title: "Archive",
      icon: Archive,
      isActive: false,
    },
    {
      id: "trash",
      title: "Trash",
      icon: Trash2,
      isActive: false,
    },
  ],
  navFooter: [
    {
      id: "help-feedback",
      title: "Help & feedback",
      icon: CircleHelp,
      isActive: false,
    },
    {
      id: "keyboard-shortcuts",
      title: "Keyboard shortcuts",
      icon: Keyboard,
      isActive: false,
    },
  ],
};

export const accounts = [
  {
    id: 1,
    label: "Kostencheck Copilot",
    email: "copilot@clerktree.ai",
  },
  {
    id: 2,
    label: "ClerkTree Pipeline",
    email: "pipeline@clerktree.ai",
  },
];

/** Per-kind subject prefix and sender — kept in sync with the themed static seed above. */
const GENERATED_DOC_KIND_META: Record<
  PipelineGeneratedDocRow["kind"],
  { prefix: string; from: Recipient; accountId: number; labels: string[] }
> = {
  zusammenfassung: {
    prefix: "Zusammenfassung",
    from: kostencheckCopilot,
    accountId: 1,
    labels: ["kostencheck"],
  },
  kickoff_brief: {
    prefix: "KickOff-Brief",
    from: clerkTreePipeline,
    accountId: 1,
    labels: ["kickoff"],
  },
  deviation_report: {
    prefix: "Abweichungsbericht",
    from: clerkTreePipeline,
    accountId: 1,
    labels: ["kostencheck"],
  },
  ab_draft: {
    prefix: "Auftragsbestätigung (Entwurf)",
    from: kostencheckCopilot,
    accountId: 1,
    labels: ["entwurf"],
  },
};

/** Maps a live pipeline_generated_docs row onto the inbox's Mail shape. */
export function mapGeneratedDocToMail(doc: PipelineGeneratedDocRow): Mail {
  const meta = GENERATED_DOC_KIND_META[doc.kind];
  const subject = doc.title?.trim() ? doc.title : `${meta.prefix} – ${doc.id.slice(0, 8)}`;

  return {
    id: doc.id,
    accountId: meta.accountId,
    from: meta.from,
    to: [{ name: "THD GmbH – Vertrieb", email: "vertrieb@thd-gmbh.de" }],
    subject,
    body: doc.content ?? "",
    receivedAt: doc.created_at,
    folder: "inbox",
    isRead: false,
    isPinned: false,
    isPriority: doc.kind === "ab_draft",
    labels: meta.labels,
  };
}

/** Maps a list of live generated docs onto the inbox's Mail list, newest first. */
export function mapGeneratedDocsToMails(docs: PipelineGeneratedDocRow[]): Mail[] {
  return docs.map(mapGeneratedDocToMail);
}
