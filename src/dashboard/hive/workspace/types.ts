import type { LucideIcon } from 'lucide-react-dash';

import type { ResourceDef, Row } from '../api/resource';
import type { BadgeTone } from '../ui';

/**
 * A workspace screen is data: which resources it shows and how. ResourceScreen draws every one the same way
 * (tabs, KPIs, a breakdown, a searchable table that becomes cards on a phone, a detail sheet with actions),
 * so the whole product reads as one system and a resource moves from placeholder to live without UI changes.
 */

export type ColKind = 'text' | 'strong' | 'mono' | 'status' | 'number' | 'progress' | 'tags' | 'muted';

export interface Column<T extends Row = Row> {
  key: string;
  label: string;
  kind?: ColKind;
  /** Colour of a status value; unknown values are grey. */
  tones?: Record<string, BadgeTone>;
  unit?: string;
  align?: 'end';
  /** Left out of the phone card. */
  wide?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface Kpi<T extends Row = Row> {
  label: string;
  value: (rows: T[]) => string | number;
  sub?: string | ((rows: T[]) => string);
  /** Draws the value in the accent colour when the function returns true (needs attention). */
  hot?: (rows: T[]) => boolean;
}

export interface Action<T extends Row = Row> {
  label: string;
  icon?: LucideIcon;
  /** The operationId the action calls once the API is attached. */
  operation: string;
  when?: (row: T) => boolean;
  /** The change it makes to the record. */
  apply: (row: T) => Partial<T>;
  done: string;
  danger?: boolean;
  /** Needs a person's explicit confirmation (approvals, commands, deletions). */
  confirm?: string;
}

export interface CreateField {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'textarea';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

export interface Create<T extends Row = Row> {
  label: string;
  operation: string;
  fields: CreateField[];
  make: (values: Record<string, string>) => T;
  done: string;
}

export interface View<T extends Row = Row> {
  id: string;
  title: string;
  resource: ResourceDef<T>;
  columns: Column<T>[];
  /** Field for the status filter chips. */
  statusKey?: string;
  kpis?: Kpi<T>[];
  /** A breakdown drawn above the table: rows counted (or a number summed) by a field. */
  breakdown?: { title: string; by: string; sum?: string; unit?: string; sub?: string };
  actions?: Action<T>[];
  create?: Create<T>;
  /** Extra detail fields beyond the columns (key → label). */
  detail?: { key: string; label: string; kind?: ColKind; tones?: Record<string, BadgeTone> }[];
  /** One plain sentence above the table: what this list is and what is special about it. */
  note?: string;
  /** Title field of a record (defaults to the first column). */
  titleKey?: string;
}

export interface Screen {
  id: string;
  title: string;
  about: string;
  icon: LucideIcon;
  keywords: string;
  /** HIVE modules behind the screen (catalog owners). */
  spec: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- views hold different row types
  views: View<any>[];
}

/** Common status colours, so a word always has the same colour. */
export const STATUS: Record<string, BadgeTone> = {
  active: 'green', ok: 'green', online: 'green', healthy: 'green', passed: 'green', completed: 'green', complete: 'green', done: 'green', approved: 'green', released: 'green', valid: 'green', enabled: 'green', resolved: 'green', closed: 'gray', published: 'green', running: 'green', connected: 'green', confirmed: 'green', current: 'green', compliant: 'green', paid: 'green', delivered: 'green', in_stock: 'green', live: 'green', accepted: 'green', synced: 'green', fulfilled: 'green',
  pending: 'amber', waiting: 'amber', open: 'orange', degraded: 'amber', draft: 'gray', scheduled: 'gray', planned: 'gray', in_progress: 'amber', review: 'amber', due: 'amber', expiring: 'amber', warning: 'amber', shadow: 'amber', staged: 'amber', buffering: 'amber', low: 'amber', partial: 'amber', investigating: 'amber', submitted: 'amber', sent: 'amber', proposed: 'amber', awaiting_approval: 'orange', acknowledged: 'amber', paused: 'gray', queued: 'gray', idle: 'gray', disabled: 'gray', retired: 'gray', archived: 'gray', revoked: 'gray', superseded: 'gray', cancelled: 'gray', expired: 'gray', inactive: 'gray', offline: 'red', unknown: 'gray',
  good: 'green', estimated: 'amber', stale: 'red', producing: 'green', setup: 'amber', down: 'red', ready: 'green', armed: 'green', normal: 'green', degraded_mode: 'amber', granted: 'green', denied: 'red', in_review: 'amber', blocked_by_policy: 'red', signed: 'green', unsigned: 'amber', trial: 'amber',
  failed: 'red', error: 'red', rejected: 'red', critical: 'red', overdue: 'red', blocked: 'red', breached: 'red', tripped: 'red', engaged: 'red', out_of_stock: 'red', non_compliant: 'red', high: 'orange', medium: 'amber', disputed: 'red', quarantined: 'red', mitigated: 'amber', exploitable: 'red', not_affected: 'green', fixed: 'green',
};
