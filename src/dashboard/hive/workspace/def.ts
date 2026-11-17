import { newId, type ResourceDef, type Row } from '../api/resource';
import type { Column, Kpi } from './types';

/** A resource definition: object, collection path, owning module, list operation and placeholder rows. */
export function res<T extends Row>(object: string, path: string, owner: string, list: string, fixture: T[]): ResourceDef<T> {
  return { object, path, owner, list, get: list.replace(/_list$/, '_get'), fixture };
}

export const col = {
  title: (key: string, label: string): Column => ({ key, label, kind: 'strong' }),
  id: (key: string, label: string): Column => ({ key, label, kind: 'mono' }),
  status: (key: string, label = 'Status'): Column => ({ key, label, kind: 'status' }),
  text: (key: string, label: string, wide = false): Column => ({ key, label, wide }),
  muted: (key: string, label: string, wide = true): Column => ({ key, label, kind: 'muted', wide }),
  num: (key: string, label: string, unit?: string): Column => ({ key, label, kind: 'number', unit, align: 'end' }),
  pct: (key: string, label: string): Column => ({ key, label, kind: 'progress', wide: true }),
  tags: (key: string, label: string): Column => ({ key, label, kind: 'tags', wide: true }),
};

export const count = (label: string, pred?: (r: Row) => boolean, sub?: string, hot = false): Kpi => ({
  label,
  value: (rows) => (pred ? rows.filter(pred) : rows).length,
  sub,
  hot: hot ? (rows) => (pred ? rows.filter(pred) : rows).length > 0 : undefined,
});

export const is = (key: string, ...values: string[]) => (r: Row) => values.includes(String(r[key]));

export const sum = (label: string, key: string, unit = '', sub?: string): Kpi => ({
  label,
  value: (rows) => `${rows.reduce((n, r) => n + (Number(r[key]) || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}${unit ? ` ${unit}` : ''}`,
  sub,
});

export const avg = (label: string, key: string, unit = '', sub?: string): Kpi => ({
  label,
  value: (rows) => (rows.length ? `${(rows.reduce((n, r) => n + (Number(r[key]) || 0), 0) / rows.length).toLocaleString(undefined, { maximumFractionDigits: 1 })}${unit}` : '—'),
  sub,
});

export const make = (prefix: string, base: Record<string, unknown>) => ({ id: newId(prefix), ...base }) as Row;

export const today = () => new Date().toISOString().slice(0, 10);
export const now = () => new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
