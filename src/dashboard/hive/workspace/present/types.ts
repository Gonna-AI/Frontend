/**
 * How a list is drawn. Every view in the workspace is a list of HIVE objects, but a list of incidents wants to be
 * a board, a list of events wants to be a timeline and a list of signals wants to be live readings. A presenter
 * says which, and which fields play which part; the records, the search, the detail sheet and the actions are the
 * same for all of them. A view without a presenter is drawn as cards built from its columns.
 */

export interface Cards {
  kind: 'cards';
  /** The field shown as a small line under the title (defaults to the first plain text column). */
  sub?: string;
  /** Fields shown as label and value pairs. */
  meta?: string[];
  /** A field shown at the foot of the card, set apart (a due date, an expiry). */
  foot?: string;
  footLabel?: string;
}

/** Records in lanes by status, like a work board. */
export interface Board {
  kind: 'board';
  sub?: string;
  /** A second status shown as a badge on the card (a priority, a severity). */
  badge?: string;
  meta?: string[];
  /** Lane order; any other status follows after these. */
  lanes?: string[];
}

/** Records in time order, newest first, on a vertical line. */
export interface Timeline {
  kind: 'timeline';
  time: string;
  detail?: string[];
  badge?: string;
  /** A short mono label beside the time (an event type, an actor). */
  tag?: string;
}

/** Readings: a value first, with its limit, quality and age. */
export interface Tiles {
  kind: 'tiles';
  value: string;
  unit?: string;
  limit?: string;
  badge?: string;
  /** Fields shown at the foot of the tile. */
  foot?: string[];
  /** A 0 to 100 field drawn as a bar, with its label. */
  pct?: string;
  pctLabel?: string;
}

/** Use against a limit (a budget, a quota), or relative sizes when there is no limit. */
export interface Meters {
  kind: 'meters';
  label?: string;
  sub?: string;
  value: string;
  max?: string;
  pct?: string;
  unit?: string;
  foot?: string[];
  badge?: string;
}

/** Conditions and what they do: when this, then that. */
export interface Rules {
  kind: 'rules';
  when: string;
  then: string;
  meta?: string[];
  whenLabel?: string;
  thenLabel?: string;
}

/** Records grouped under the person they concern. */
export interface People {
  kind: 'people';
  who: string;
  items: string[];
  badge?: string;
}

/** Shifts drawn across a 24 hour day. */
export interface Shifts {
  kind: 'shifts';
  hours: string;
  meta?: string[];
}

/** An API reference: operations grouped by the resource they belong to. */
export interface Grouped {
  kind: 'grouped';
  by: string;
  head: string;
  sub?: string;
  badge?: string;
  meta?: string[];
}

export type Present = Cards | Board | Timeline | Tiles | Meters | Rules | People | Shifts | Grouped;
