/**
 * Placeholder content for the Hive screens whose API modules are not built yet.
 *
 * Every screen is described as data (tabs made of blocks) and drawn by modules.tsx, so all of them share
 * one layout, one responsive behaviour and both languages. Names come from the specification's reference
 * scenario (Musterwerk GmbH, CNC-07, Line 2, WO-2291). When a module ships, its tab gets a real fetch in
 * hiveApi.ts and this file loses that tab.
 *
 * Nothing here is a person's performance: counts and rates are by machine, line, site or agent.
 */

export type Txt = string | { en: string; de: string };
export const tx = (en: string, de: string): Txt => ({ en, de });

export type Tone = 'green' | 'red' | 'amber' | 'gray' | 'orange' | 'black';

export interface Cell {
  text: Txt;
  tone?: Tone;
  /** Draws the text as a status pill. */
  pill?: boolean;
  mono?: boolean;
}
export type CellValue = Txt | Cell;

export type Block =
  | { kind: 'kpis'; items: { label: Txt; value: Txt; delta?: string; up?: boolean; hot?: boolean; sub?: Txt }[] }
  | { kind: 'table'; title: Txt; sub?: Txt; cols: { label: Txt; align?: 'end' }[]; rows: CellValue[][]; filterCol?: number; searchable?: boolean }
  | { kind: 'bars'; title: Txt; sub?: Txt; unit?: string; rows: { label: Txt; value: number; hot?: boolean }[]; max?: number }
  | { kind: 'steps'; title: Txt; sub?: Txt; items: { title: Txt; text: Txt; tone?: Tone; tag?: Txt }[] }
  | { kind: 'cards'; title: Txt; sub?: Txt; items: { title: Txt; text: Txt; tag?: Txt; tone?: Tone; meta?: Txt }[] }
  | { kind: 'code'; title: Txt; sub?: Txt; code: string }
  | { kind: 'note'; text: Txt };

export interface Tab {
  id: string;
  title: Txt;
  blocks: Block[];
}
export interface ModuleDef {
  tabs: Tab[];
}

const g = (text: Txt): Cell => ({ text, tone: 'green', pill: true });
const a = (text: Txt): Cell => ({ text, tone: 'amber', pill: true });
const r = (text: Txt): Cell => ({ text, tone: 'red', pill: true });
const o = (text: Txt): Cell => ({ text, tone: 'orange', pill: true });
const n = (text: Txt): Cell => ({ text, tone: 'gray', pill: true });
const m = (text: string): Cell => ({ text, mono: true });

export const MODULES: Record<string, ModuleDef> = {
  /* ------------------------------------------------------------------ production */
  production: {
    tabs: [
      {
        id: 'overview',
        title: tx('Overview', 'Überblick'),
        blocks: [
          {
            kind: 'kpis',
            items: [
              { label: tx('OEE, plant', 'OEE, Werk'), value: '78.4 %', delta: '1.9 %', up: true, hot: true, sub: tx('last 7 days', 'letzte 7 Tage') },
              { label: tx('Availability', 'Verfügbarkeit'), value: '94.8 %', delta: '2 %', up: true },
              { label: tx('Performance', 'Leistung'), value: '88.1 %', delta: '0.6 %', up: false },
              { label: tx('Quality rate', 'Gutteilquote'), value: '98.2 %', delta: '0.3 %', up: true },
            ],
          },
          {
            kind: 'bars',
            title: tx('OEE by line', 'OEE je Linie'),
            sub: tx('Computed over the last 7 days, 12 minutes ago', 'Berechnet über die letzten 7 Tage, vor 12 Minuten'),
            unit: '%',
            max: 100,
            rows: [
              { label: tx('Line 1 · Forming', 'Linie 1 · Umformen'), value: 84.1 },
              { label: tx('Line 2 · Machining', 'Linie 2 · Zerspanung'), value: 71.2, hot: true },
              { label: tx('Line 3 · Assembly', 'Linie 3 · Montage'), value: 79.6 },
              { label: tx('Utilities', 'Medien'), value: 92.6 },
            ],
          },
          {
            kind: 'table',
            title: tx('Why Line 2 dropped', 'Warum Linie 2 gefallen ist'),
            sub: tx('Loss categories for the last 7 days, largest first', 'Verlustarten der letzten 7 Tage, größte zuerst'),
            cols: [{ label: tx('Loss', 'Verlust') }, { label: tx('Machine', 'Maschine') }, { label: tx('Share of loss', 'Anteil'), align: 'end' }, { label: tx('Evidence', 'Beleg') }],
            rows: [
              [tx('Unplanned stop: spindle temperature', 'Ungeplanter Stillstand: Spindeltemperatur'), m('CNC-07'), '46 %', o(tx('Finding FND_0031', 'Befund FND_0031'))],
              [tx('Setup and changeover', 'Rüsten und Umstellen'), m('CNC-08'), '24 %', n(tx('Measured', 'Gemessen'))],
              [tx('Minor stops', 'Kleinstörungen'), m('CNC-08'), '17 %', n(tx('Measured', 'Gemessen'))],
              [tx('Reduced speed', 'Reduzierte Geschwindigkeit'), m('CNC-07'), '13 %', a(tx('Estimated', 'Geschätzt'))],
            ],
          },
        ],
      },
      {
        id: 'orders',
        title: tx('Orders', 'Aufträge'),
        blocks: [
          {
            kind: 'table',
            title: tx('Production orders', 'Fertigungsaufträge'),
            sub: tx('Read from the ERP; Hive does not change them', 'Aus dem ERP gelesen; Hive ändert sie nicht'),
            searchable: true,
            filterCol: 4,
            cols: [{ label: tx('Order', 'Auftrag') }, { label: tx('Product', 'Produkt') }, { label: tx('Line', 'Linie') }, { label: tx('Progress', 'Fortschritt'), align: 'end' }, { label: tx('State', 'Status') }, { label: tx('Due', 'Fällig') }],
            rows: [
              [m('PRO-5531'), tx('Shaft housing GH-40', 'Wellengehäuse GH-40'), tx('Line 2', 'Linie 2'), '1,240 / 2,000', g(tx('Running', 'Läuft')), '18 Nov'],
              [m('PRO-5532'), tx('Bearing seat BS-12', 'Lagersitz BS-12'), tx('Line 2', 'Linie 2'), '0 / 800', n(tx('Planned', 'Geplant')), '19 Nov'],
              [m('PRO-5527'), tx('Pressed bracket PB-07', 'Pressteil PB-07'), tx('Line 1', 'Linie 1'), '5,900 / 6,000', g(tx('Running', 'Läuft')), '17 Nov'],
              [m('PRO-5519'), tx('Gearbox cover GC-22', 'Getriebedeckel GC-22'), tx('Line 3', 'Linie 3'), '430 / 430', n(tx('Done', 'Fertig')), '14 Nov'],
              [m('PRO-5514'), tx('Shaft housing GH-40', 'Wellengehäuse GH-40'), tx('Line 2', 'Linie 2'), '620 / 1,500', r(tx('Delayed', 'Verzögert')), '16 Nov'],
            ],
          },
        ],
      },
      {
        id: 'schedule',
        title: tx('Schedule', 'Plan'),
        blocks: [
          {
            kind: 'cards',
            title: tx('This week', 'Diese Woche'),
            sub: tx('Production and planned maintenance windows share one calendar', 'Produktion und geplante Instandhaltung teilen sich einen Kalender'),
            items: [
              { title: tx('Mon · Line 2 runs PRO-5531', 'Mo · Linie 2 fährt PRO-5531'), text: tx('Two shifts, 06:00 to 22:00', 'Zwei Schichten, 06:00 bis 22:00'), tag: tx('Production', 'Produktion'), tone: 'green' },
              { title: tx('Wed · CNC-07 spindle bearing', 'Mi · CNC-07 Spindellager'), text: tx('Window 13:00 to 17:00 for WO-2291; planned stop already booked', 'Fenster 13:00 bis 17:00 für WO-2291; geplanter Stillstand bereits gebucht'), tag: tx('Maintenance', 'Instandhaltung'), tone: 'orange' },
              { title: tx('Thu · Press 03 filter change', 'Do · Presse 03 Filterwechsel'), text: tx('30 minutes between orders, no loss of output', '30 Minuten zwischen Aufträgen, kein Ausbringungsverlust'), tag: tx('Maintenance', 'Instandhaltung'), tone: 'orange' },
              { title: tx('Fri · Line 3 changeover', 'Fr · Linie 3 Umrüsten'), text: tx('Gearbox cover GC-22 to GC-24', 'Getriebedeckel GC-22 auf GC-24'), tag: tx('Setup', 'Rüsten'), tone: 'amber' },
            ],
          },
        ],
      },
      {
        id: 'handover',
        title: tx('Shift handover', 'Schichtübergabe'),
        blocks: [
          {
            kind: 'cards',
            title: tx('Handover from shift A to shift B', 'Übergabe von Schicht A an Schicht B'),
            sub: tx('Notes are about machines and work, never about people', 'Notizen betreffen Maschinen und Arbeit, nie Personen'),
            items: [
              { title: tx('CNC-07 runs at reduced speed', 'CNC-07 läuft mit reduzierter Geschwindigkeit'), text: tx('Spindle temperature alarm acknowledged at 09:30; WO-2291 drafted, waiting for approval.', 'Spindeltemperatur-Alarm um 09:30 quittiert; WO-2291 im Entwurf, wartet auf Freigabe.'), tag: tx('Open', 'Offen'), tone: 'red', meta: m('CNC-07').text },
              { title: tx('Gateway Halle 2 buffering', 'Gateway Halle 2 puffert'), text: tx('Link lost at 11:30, no data lost; the edge buffer is at 26 %.', 'Verbindung um 11:30 verloren, keine Daten verloren; Edge-Puffer bei 26 %.'), tag: tx('Watch', 'Beobachten'), tone: 'amber', meta: tx('Halle 2', 'Halle 2') },
              { title: tx('Press 03 lubricated', 'Presse 03 geschmiert'), text: tx('Routine finished and signed off; next due in 14 days.', 'Routine beendet und abgezeichnet; nächste Fälligkeit in 14 Tagen.'), tag: tx('Done', 'Erledigt'), tone: 'green', meta: m('Press 03').text },
            ],
          },
        ],
      },
      {
        id: 'energy',
        title: tx('Energy', 'Energie'),
        blocks: [
          {
            kind: 'bars',
            title: tx('Energy by line', 'Energie je Linie'),
            sub: tx('kWh per good part, last 7 days', 'kWh je Gutteil, letzte 7 Tage'),
            unit: 'kWh',
            rows: [
              { label: tx('Line 1 · Forming', 'Linie 1 · Umformen'), value: 2.4 },
              { label: tx('Line 2 · Machining', 'Linie 2 · Zerspanung'), value: 3.9, hot: true },
              { label: tx('Line 3 · Assembly', 'Linie 3 · Montage'), value: 1.1 },
              { label: tx('Compressed air', 'Druckluft'), value: 1.7 },
            ],
          },
          { kind: 'note', text: tx('Compressor K-2 ran unloaded for 41 hours this week: about 310 kWh that produced no air.', 'Kompressor K-2 lief diese Woche 41 Stunden im Leerlauf: rund 310 kWh ohne Druckluft.') },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ quality */
  quality: {
    tabs: [
      {
        id: 'overview',
        title: tx('Overview', 'Überblick'),
        blocks: [
          {
            kind: 'kpis',
            items: [
              { label: tx('Scrap rate', 'Ausschussquote'), value: '1.8 %', delta: '0.3 %', up: false, hot: true, sub: tx('last 7 days', 'letzte 7 Tage') },
              { label: tx('First pass yield', 'Erstausbeute'), value: '97.4 %', delta: '0.2 %', up: true },
              { label: tx('Open deviations', 'Offene Abweichungen'), value: '3' },
              { label: tx('Inspections today', 'Prüfungen heute'), value: '46' },
            ],
          },
          {
            kind: 'bars',
            title: tx('Scrap by cause', 'Ausschuss nach Ursache'),
            unit: '%',
            rows: [
              { label: tx('Dimension out of tolerance', 'Maß außerhalb Toleranz'), value: 42, hot: true },
              { label: tx('Surface defect', 'Oberflächenfehler'), value: 27 },
              { label: tx('Burr', 'Grat'), value: 18 },
              { label: tx('Other', 'Sonstiges'), value: 13 },
            ],
          },
        ],
      },
      {
        id: 'inspections',
        title: tx('Inspections', 'Prüfungen'),
        blocks: [
          {
            kind: 'table',
            title: tx('Inspection plans and results', 'Prüfpläne und Ergebnisse'),
            searchable: true,
            filterCol: 3,
            cols: [{ label: tx('Plan', 'Plan') }, { label: tx('Product', 'Produkt') }, { label: tx('Sample', 'Stichprobe'), align: 'end' }, { label: tx('Result', 'Ergebnis') }, { label: tx('Last run', 'Letzter Lauf') }],
            rows: [
              [m('INS-014'), tx('Shaft housing GH-40', 'Wellengehäuse GH-40'), '5 / 100', g(tx('Passed', 'Bestanden')), tx('Today 10:12', 'Heute 10:12')],
              [m('INS-009'), tx('Bearing seat BS-12', 'Lagersitz BS-12'), '3 / 50', a(tx('Marginal', 'Grenzwertig')), tx('Today 08:40', 'Heute 08:40')],
              [m('INS-021'), tx('Pressed bracket PB-07', 'Pressteil PB-07'), '10 / 500', g(tx('Passed', 'Bestanden')), tx('Yesterday', 'Gestern')],
              [m('INS-017'), tx('Gearbox cover GC-22', 'Getriebedeckel GC-22'), '2 / 40', r(tx('Failed', 'Nicht bestanden')), tx('Yesterday', 'Gestern')],
            ],
          },
        ],
      },
      {
        id: 'deviations',
        title: tx('Deviations', 'Abweichungen'),
        blocks: [
          {
            kind: 'table',
            title: tx('Nonconformities', 'Nichtkonformitäten'),
            sub: tx('Each links to the machine, batch and process values behind it', 'Jede verweist auf Maschine, Charge und Prozesswerte dahinter'),
            filterCol: 3,
            cols: [{ label: tx('Deviation', 'Abweichung') }, { label: tx('Description', 'Beschreibung') }, { label: tx('Machine', 'Maschine') }, { label: tx('State', 'Status') }],
            rows: [
              [m('NCR-0117'), tx('Bore diameter above upper limit', 'Bohrungsdurchmesser über Obergrenze'), m('CNC-07'), o(tx('Investigating', 'In Untersuchung'))],
              [m('NCR-0116'), tx('Surface scratches on cover', 'Kratzer auf der Abdeckung'), m('Robot cell 1'), a(tx('Containment', 'Eingrenzung'))],
              [m('NCR-0112'), tx('Burr on pressed edge', 'Grat an der Pressenkante'), m('Press 03'), g(tx('Closed', 'Abgeschlossen'))],
            ],
          },
        ],
      },
      {
        id: 'trace',
        title: tx('Traceability', 'Rückverfolgung'),
        blocks: [
          {
            kind: 'steps',
            title: tx('Batch B-20261114-07, from material to customer', 'Charge B-20261114-07, vom Material zum Kunden'),
            sub: tx('Click-through in the finished screen; every step keeps its process values', 'Im fertigen Screen durchklickbar; jeder Schritt behält seine Prozesswerte'),
            items: [
              { title: tx('Material lot', 'Materialcharge'), text: tx('Steel bar, certificate 3.1, supplier Stahlwerk Süd', 'Stangenmaterial, Zeugnis 3.1, Lieferant Stahlwerk Süd'), tag: m('MAT-8842').text },
              { title: tx('Machining', 'Zerspanung'), text: tx('CNC-07, spindle load within limits, 1,240 parts', 'CNC-07, Spindellast innerhalb der Grenzen, 1.240 Teile'), tag: m('CNC-07').text },
              { title: tx('Inspection', 'Prüfung'), text: tx('Plan INS-014, 5 of 100 sampled, all in tolerance', 'Plan INS-014, 5 von 100 geprüft, alle in Toleranz'), tag: m('INS-014').text, tone: 'green' },
              { title: tx('Shipment', 'Versand'), text: tx('Delivery note DN-30871 to the customer', 'Lieferschein DN-30871 an den Kunden'), tag: m('DN-30871').text },
            ],
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ agents */
  agents: {
    tabs: [
      {
        id: 'registry',
        title: tx('Registry', 'Register'),
        blocks: [
          {
            kind: 'table',
            title: tx('Agents', 'Agenten'),
            sub: tx('Each agent has an owner, a permission set and an autonomy level', 'Jeder Agent hat einen Verantwortlichen, Berechtigungen und eine Autonomiestufe'),
            filterCol: 2,
            cols: [{ label: tx('Agent', 'Agent') }, { label: tx('Purpose', 'Aufgabe') }, { label: tx('Level', 'Stufe') }, { label: tx('Status', 'Status') }, { label: tx('Last run', 'Letzter Lauf') }],
            rows: [
              [tx('Signal agent', 'Signal-Agent'), tx('Reads signals and baselines', 'Liest Signale und Basislinien'), n('L1 · Suggest'), g(tx('Active', 'Aktiv')), tx('4 min ago', 'vor 4 Min.')],
              [tx('Manual agent', 'Handbuch-Agent'), tx('Finds the page that applies to this machine', 'Findet die passende Seite für diese Maschine'), n('L1 · Suggest'), g(tx('Active', 'Aktiv')), tx('11 min ago', 'vor 11 Min.')],
              [tx('Planner', 'Planer'), tx('Drafts work orders with evidence', 'Entwirft Arbeitsaufträge mit Belegen'), o('L2 · Draft'), g(tx('Active', 'Aktiv')), tx('26 min ago', 'vor 26 Min.')],
              [tx('Procurement agent', 'Beschaffungs-Agent'), tx('Drafts quote requests and compares replies', 'Entwirft Anfragen und vergleicht Antworten'), o('L2 · Draft'), a(tx('Paused', 'Pausiert')), tx('2 days ago', 'vor 2 Tagen')],
            ],
          },
        ],
      },
      {
        id: 'runs',
        title: tx('Runs', 'Läufe'),
        blocks: [
          {
            kind: 'table',
            title: tx('Recent runs', 'Letzte Läufe'),
            sub: tx('Every step, source and tool call is kept in the trace', 'Jeder Schritt, jede Quelle und jeder Werkzeugaufruf bleibt im Protokoll'),
            searchable: true,
            filterCol: 3,
            cols: [{ label: tx('Run', 'Lauf') }, { label: tx('Agent', 'Agent') }, { label: tx('Trigger', 'Auslöser') }, { label: tx('Outcome', 'Ergebnis') }, { label: tx('Sources', 'Quellen'), align: 'end' }],
            rows: [
              [m('RUN_5021'), tx('Planner', 'Planer'), tx('Alarm ALM_0412', 'Alarm ALM_0412'), o(tx('Draft WO-2291', 'Entwurf WO-2291')), '6'],
              [m('RUN_5020'), tx('Signal agent', 'Signal-Agent'), tx('Schedule', 'Zeitplan'), g(tx('Finding FND_0031', 'Befund FND_0031')), '3'],
              [m('RUN_5018'), tx('Manual agent', 'Handbuch-Agent'), tx('Question', 'Frage'), g(tx('Answered', 'Beantwortet')), '2'],
              [m('RUN_5012'), tx('Procurement agent', 'Beschaffungs-Agent'), tx('Stock below minimum', 'Bestand unter Minimum'), r(tx('Stopped: no variant match', 'Gestoppt: keine Variante passt')), '4'],
            ],
          },
        ],
      },
      {
        id: 'autonomy',
        title: tx('Autonomy', 'Autonomie'),
        blocks: [
          {
            kind: 'steps',
            title: tx('The autonomy ladder', 'Die Autonomieleiter'),
            sub: tx('An agent climbs one step at a time, and only after its evaluations pass', 'Ein Agent steigt Stufe für Stufe auf, und nur wenn seine Auswertungen bestehen'),
            items: [
              { title: tx('L0 · Observe', 'L0 · Beobachten'), text: tx('Reads and reports. Cannot propose anything.', 'Liest und berichtet. Kann nichts vorschlagen.'), tag: tx('Entry', 'Einstieg') },
              { title: tx('L1 · Suggest', 'L1 · Vorschlagen'), text: tx('Suggests in the assistant, with sources.', 'Schlägt im Assistenten vor, mit Quellen.'), tag: tx('Today', 'Heute'), tone: 'green' },
              { title: tx('L2 · Draft', 'L2 · Entwerfen'), text: tx('Prepares a work order or requisition in the owning module; a person approves.', 'Bereitet Arbeitsauftrag oder Bedarf im zuständigen Modul vor; eine Person gibt frei.'), tag: tx('Today', 'Heute'), tone: 'green' },
              { title: tx('L3 · Act with approval', 'L3 · Handeln mit Freigabe'), text: tx('Executes low-risk business-system actions after approval. Nothing reaches a machine.', 'Führt risikoarme Aktionen in Geschäftssystemen nach Freigabe aus. Nichts erreicht eine Maschine.'), tag: tx('Gated', 'Gesperrt'), tone: 'amber' },
            ],
          },
        ],
      },
      {
        id: 'evals',
        title: tx('Evaluations', 'Auswertungen'),
        blocks: [
          {
            kind: 'table',
            title: tx('Evaluation suites', 'Auswertungs-Suiten'),
            sub: tx('A release is blocked when its suite drops', 'Ein Release wird gestoppt, wenn seine Suite fällt'),
            cols: [{ label: tx('Suite', 'Suite') }, { label: tx('Cases', 'Fälle'), align: 'end' }, { label: tx('Pass rate', 'Erfolgsquote'), align: 'end' }, { label: tx('Gate', 'Schranke') }],
            rows: [
              [tx('Citations are real and applicable', 'Quellen sind echt und anwendbar'), '240', '98.8 %', g(tx('Passing', 'Bestanden'))],
              [tx('Variant binding (the right part number)', 'Variantenbindung (die richtige Teilenummer)'), '120', '96.7 %', g(tx('Passing', 'Bestanden'))],
              [tx('Refuses to write to a machine', 'Verweigert das Schreiben an eine Maschine'), '60', '100 %', g(tx('Passing', 'Bestanden'))],
            ],
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ automations */
  automations: {
    tabs: [
      {
        id: 'rules',
        title: tx('Rules', 'Regeln'),
        blocks: [
          {
            kind: 'table',
            title: tx('Rules', 'Regeln'),
            sub: tx('A rule watches a signal or event and raises an alarm, a notification or a draft', 'Eine Regel beobachtet ein Signal oder Ereignis und löst Alarm, Meldung oder Entwurf aus'),
            filterCol: 3,
            cols: [{ label: tx('Rule', 'Regel') }, { label: tx('When', 'Wenn') }, { label: tx('Then', 'Dann') }, { label: tx('State', 'Status') }],
            rows: [
              [tx('Spindle temperature high', 'Spindeltemperatur hoch'), tx('Spindle temperature above 72 °C for 5 min', 'Spindeltemperatur über 72 °C für 5 Min.'), tx('Critical alarm, notify the shift', 'Kritischer Alarm, Schicht benachrichtigen'), g(tx('On', 'An'))],
              [tx('Gateway link lost', 'Gateway-Verbindung verloren'), tx('No heartbeat for 60 s', 'Kein Heartbeat seit 60 s'), tx('High alarm, buffer locally', 'Hoher Alarm, lokal puffern'), g(tx('On', 'An'))],
              [tx('Stock below minimum', 'Bestand unter Minimum'), tx('Available quantity below minimum', 'Verfügbare Menge unter Minimum'), tx('Draft purchase requisition', 'Bedarf als Entwurf'), a(tx('Test mode', 'Testmodus'))],
              [tx('Compressor runs unloaded', 'Kompressor läuft im Leerlauf'), tx('Unloaded more than 30 min', 'Mehr als 30 Min. im Leerlauf'), tx('Notify energy lead', 'Energieverantwortliche informieren'), n(tx('Off', 'Aus'))],
            ],
          },
        ],
      },
      {
        id: 'workflows',
        title: tx('Workflows', 'Abläufe'),
        blocks: [
          {
            kind: 'steps',
            title: tx('Alarm to approved work order', 'Vom Alarm zum freigegebenen Arbeitsauftrag'),
            sub: tx('A durable workflow: it survives restarts and waits for people as long as it takes', 'Ein dauerhafter Ablauf: übersteht Neustarts und wartet auf Menschen, so lange es dauert'),
            items: [
              { title: tx('Alarm raised', 'Alarm ausgelöst'), text: tx('Rule fires and the alarm is created with its signal context.', 'Regel löst aus und der Alarm entsteht mit seinem Signalkontext.') },
              { title: tx('Evidence gathered', 'Belege gesammelt'), text: tx('Signals, manual passages and past repairs are collected and checked for applicability.', 'Signale, Handbuchstellen und frühere Reparaturen werden gesammelt und auf Anwendbarkeit geprüft.') },
              { title: tx('Draft prepared', 'Entwurf erstellt'), text: tx('The planner agent drafts the work order in the maintenance module.', 'Der Planer-Agent entwirft den Arbeitsauftrag im Instandhaltungsmodul.'), tone: 'orange' },
              { title: tx('Person approves', 'Person gibt frei'), text: tx('Approval request goes to the inbox. Nothing proceeds without it.', 'Die Freigabeanfrage geht in den Posteingang. Ohne sie geht nichts weiter.'), tone: 'green', tag: tx('Human', 'Mensch') },
            ],
          },
        ],
      },
      {
        id: 'commands',
        title: tx('Commands', 'Befehle'),
        blocks: [
          { kind: 'note', text: tx('Machine control is not enabled. Commands at tier T3 and T4 run against the simulator only until the external safety review is complete. Hive supervises and requests; control loops stay in the machine controller.', 'Maschinensteuerung ist nicht aktiviert. Befehle der Stufen T3 und T4 laufen nur im Simulator, bis die externe Sicherheitsprüfung abgeschlossen ist. Hive überwacht und fordert an; Regelkreise bleiben in der Maschinensteuerung.') },
          {
            kind: 'table',
            title: tx('Command catalog', 'Befehlskatalog'),
            filterCol: 1,
            cols: [{ label: tx('Command', 'Befehl') }, { label: tx('Tier', 'Stufe') }, { label: tx('Approval', 'Freigabe') }, { label: tx('Where it runs', 'Wo er läuft') }],
            rows: [
              [m('workorder.create'), n('T1'), tx('One person', 'Eine Person'), tx('Maintenance module', 'Instandhaltungsmodul')],
              [m('requisition.create'), n('T1'), tx('One person', 'Eine Person'), tx('Purchasing module', 'Einkaufsmodul')],
              [m('compressor.stop'), o('T3'), tx('Site manager and step-up', 'Standortleitung und Step-up'), a(tx('Simulator only', 'Nur Simulator'))],
              [m('line.stop'), r('T4'), tx('Two people and step-up', 'Zwei Personen und Step-up'), a(tx('Simulator only', 'Nur Simulator'))],
            ],
          },
        ],
      },
      {
        id: 'safety',
        title: tx('Safety', 'Sicherheit'),
        blocks: [
          {
            kind: 'kpis',
            items: [
              { label: tx('Kill switch', 'Notaus'), value: tx('Disengaged', 'Gelöst'), hot: false, sub: tx('Site Esslingen', 'Standort Esslingen') },
              { label: tx('Interlocks', 'Verriegelungen'), value: '12', sub: tx('all healthy', 'alle in Ordnung') },
              { label: tx('Write path', 'Schreibpfad'), value: tx('Off', 'Aus'), sub: tx('read-only', 'nur lesend') },
            ],
          },
          { kind: 'note', text: tx('Hive is not a safety system. The kill switch stops Hive from sending commands; it does not replace the plant’s emergency stop.', 'Hive ist kein Sicherheitssystem. Der Notaus stoppt das Senden von Befehlen durch Hive; er ersetzt nicht den Not-Halt der Anlage.') },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ compliance */
  compliance: {
    tabs: [
      {
        id: 'overview',
        title: tx('Overview', 'Überblick'),
        blocks: [
          {
            kind: 'kpis',
            items: [
              { label: tx('Data region', 'Datenregion'), value: 'EU', sub: tx('Frankfurt, dedicated cell', 'Frankfurt, dedizierte Zelle') },
              { label: tx('Retention', 'Aufbewahrung'), value: '13 mo', sub: tx('raw signals', 'Rohsignale') },
              { label: tx('People data', 'Personendaten'), value: tx('Off', 'Aus'), sub: tx('default, per works agreement', 'Standard, laut Betriebsvereinbarung') },
              { label: tx('Open items', 'Offene Punkte'), value: '2' },
            ],
          },
          { kind: 'note', text: tx('No screen in Hive ranks or measures individual people. Counts are by machine, line or site.', 'Kein Screen in Hive bewertet oder misst einzelne Personen. Zahlen beziehen sich auf Maschine, Linie oder Standort.') },
        ],
      },
      {
        id: 'data',
        title: tx('Data', 'Daten'),
        blocks: [
          {
            kind: 'table',
            title: tx('What we keep, why and for how long', 'Was wir speichern, warum und wie lange'),
            cols: [{ label: tx('Category', 'Kategorie') }, { label: tx('Purpose', 'Zweck') }, { label: tx('Basis', 'Grundlage') }, { label: tx('Kept', 'Aufbewahrung'), align: 'end' }],
            rows: [
              [tx('Machine signals', 'Maschinensignale'), tx('Condition and performance', 'Zustand und Leistung'), tx('Contract', 'Vertrag'), '13 mo'],
              [tx('Work orders', 'Arbeitsaufträge'), tx('Maintenance records', 'Instandhaltungsnachweise'), tx('Contract', 'Vertrag'), '10 y'],
              [tx('Audit log', 'Audit-Log'), tx('Accountability', 'Nachvollziehbarkeit'), tx('Legal duty', 'Rechtspflicht'), '7 y'],
              [tx('User accounts', 'Benutzerkonten'), tx('Sign-in and access', 'Anmeldung und Zugriff'), tx('Contract', 'Vertrag'), tx('While active', 'Solange aktiv')],
            ],
          },
        ],
      },
      {
        id: 'certificates',
        title: tx('Certificates', 'Zertifikate'),
        blocks: [
          {
            kind: 'table',
            title: tx('Standards and attestations', 'Normen und Nachweise'),
            sub: tx('Status is shown as it is, including what is not started', 'Der Stand wird gezeigt, wie er ist, auch was nicht begonnen ist'),
            cols: [{ label: tx('Standard', 'Norm') }, { label: tx('Scope', 'Geltungsbereich') }, { label: tx('Status', 'Status') }],
            rows: [
              ['ISO 27001', tx('Information security management', 'Informationssicherheits-Managementsystem'), n(tx('Planned', 'Geplant'))],
              ['TISAX', tx('Automotive supply chain', 'Automobil-Lieferkette'), n(tx('Planned', 'Geplant'))],
              ['IEC 62443', tx('Industrial control system security', 'Sicherheit industrieller Steuerungen'), a(tx('In preparation', 'In Vorbereitung'))],
              ['BSI C5', tx('Cloud services', 'Cloud-Dienste'), n(tx('Planned', 'Geplant'))],
            ],
          },
        ],
      },
      {
        id: 'audit',
        title: tx('Audit and export', 'Audit und Export'),
        blocks: [
          {
            kind: 'cards',
            title: tx('Evidence you can hand to an auditor', 'Nachweise für Prüfer'),
            items: [
              { title: tx('Audit log export', 'Audit-Log exportieren'), text: tx('Tamper-evident log of who did what and when, as an open format.', 'Manipulationssicheres Protokoll, wer wann was getan hat, in offenem Format.'), tag: 'JSONL' },
              { title: tx('Full data export', 'Vollständiger Datenexport'), text: tx('Everything Hive holds for your tenant, in open formats, at any time.', 'Alles, was Hive für Ihren Mandanten hält, jederzeit in offenen Formaten.'), tag: 'Parquet · CSV' },
              { title: tx('Subprocessors', 'Unterauftragsverarbeiter'), text: tx('The list of providers that touch your data, with their region.', 'Die Liste der Anbieter, die mit Ihren Daten in Berührung kommen, mit Region.'), tag: 'PDF' },
            ],
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ developer */
  developer: {
    tabs: [
      {
        id: 'quickstart',
        title: tx('Quickstart', 'Schnellstart'),
        blocks: [
          {
            kind: 'code',
            title: tx('Make your first call', 'Ihr erster Aufruf'),
            sub: tx('Only the health endpoint exists today; the rest of the API is shown here as placeholders', 'Heute gibt es nur den Health-Endpunkt; der Rest der API ist hier als Platzhalter dargestellt'),
            code: 'curl https://api.example.com/v1/health \\\n  -H "Accept: application/json" \\\n  -H "Hive-Version: 2026-11-01"\n\n# { "status": "ok" }',
          },
          {
            kind: 'cards',
            title: tx('How the API behaves', 'Wie sich die API verhält'),
            items: [
              { title: tx('Versioned', 'Versioniert'), text: tx('Send Hive-Version; changes are announced and old versions keep working.', 'Senden Sie Hive-Version; Änderungen werden angekündigt, alte Versionen laufen weiter.'), tag: 'API-VER' },
              { title: tx('Safe to retry', 'Wiederholbar'), text: tx('Writes take an Idempotency-Key, so a repeated request does one thing.', 'Schreibzugriffe nehmen einen Idempotency-Key, eine Wiederholung bewirkt nur einmal etwas.'), tag: 'API-IDEM' },
              { title: tx('Predictable errors', 'Vorhersehbare Fehler'), text: tx('Problems come as application/problem+json with a stable code.', 'Fehler kommen als application/problem+json mit stabilem Code.'), tag: 'API-ERR' },
            ],
          },
        ],
      },
      {
        id: 'webhooks',
        title: tx('Webhooks', 'Webhooks'),
        blocks: [
          {
            kind: 'table',
            title: tx('Endpoints', 'Endpunkte'),
            filterCol: 3,
            cols: [{ label: tx('Endpoint', 'Endpunkt') }, { label: tx('Events', 'Ereignisse') }, { label: tx('Last delivery', 'Letzte Zustellung') }, { label: tx('State', 'Status') }],
            rows: [
              [m('https://erp.example.com/hive'), m('workorder.approved'), tx('2 min ago', 'vor 2 Min.'), g(tx('Healthy', 'In Ordnung'))],
              [m('https://chat.example.com/hooks'), m('alarm.raised'), tx('41 min ago', 'vor 41 Min.'), g(tx('Healthy', 'In Ordnung'))],
              [m('https://old.example.com/in'), m('alarm.*'), tx('6 days ago', 'vor 6 Tagen'), r(tx('Failing', 'Fehlerhaft'))],
            ],
          },
        ],
      },
      {
        id: 'mcp',
        title: tx('MCP server', 'MCP-Server'),
        blocks: [
          { kind: 'note', text: tx('External AI agents use the same tools and the same permissions as people. A tool the signed-in user cannot use is not offered.', 'Externe KI-Agenten nutzen dieselben Werkzeuge und dieselben Berechtigungen wie Menschen. Ein Werkzeug, das der angemeldete Benutzer nicht nutzen darf, wird nicht angeboten.') },
          {
            kind: 'table',
            title: tx('Tools', 'Werkzeuge'),
            cols: [{ label: tx('Tool', 'Werkzeug') }, { label: tx('What it does', 'Was es tut') }, { label: tx('Access', 'Zugriff') }],
            rows: [
              [m('search_documents'), tx('Finds passages that apply to a machine', 'Findet Stellen, die für eine Maschine gelten'), g(tx('Read', 'Lesen'))],
              [m('get_machine_state'), tx('Current state with its age', 'Aktueller Zustand mit Alter'), g(tx('Read', 'Lesen'))],
              [m('draft_work_order'), tx('Prepares a draft for approval', 'Bereitet einen Entwurf zur Freigabe vor'), o(tx('Draft', 'Entwurf'))],
            ],
          },
        ],
      },
      {
        id: 'sandbox',
        title: tx('Sandbox', 'Sandbox'),
        blocks: [
          {
            kind: 'kpis',
            items: [
              { label: tx('Simulated plant', 'Simuliertes Werk'), value: 'Musterwerk', sub: tx('8 machines, 120 signals', '8 Maschinen, 120 Signale') },
              { label: tx('Scenario', 'Szenario'), value: 'CNC-07', sub: tx('spindle temperature rises', 'Spindeltemperatur steigt') },
              { label: tx('State', 'Status'), value: tx('Ready', 'Bereit') },
            ],
          },
          { kind: 'note', text: tx('The sandbox is a simulated plant with the same API. Use it to build and test an integration without touching real equipment.', 'Die Sandbox ist ein simuliertes Werk mit derselben API. Damit bauen und testen Sie eine Integration, ohne echte Anlagen zu berühren.') },
        ],
      },
    ],
  },
};
