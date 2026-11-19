import { Progress } from '@/components/dashboard-ui/progress';

import type { Row } from '../api/resource';
import { ToneBadge } from '../ui';
import { STATUS, type Column } from './types';

export const humanize = (v: unknown): string => {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'number') return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (Array.isArray(v)) return v.join(', ');
  return String(v).replace(/_/g, ' ');
};

export function Cell<T extends Row>({ col, row }: { col: Column<T>; row: T }) {
  if (col.render) return <>{col.render(row)}</>;
  const v = row[col.key];
  switch (col.kind) {
    case 'status': {
      const s = String(v ?? 'unknown');
      return <ToneBadge tone={col.tones?.[s] ?? STATUS[s] ?? 'gray'}>{humanize(s)}</ToneBadge>;
    }
    case 'strong':
      return <span className="font-medium text-foreground">{humanize(v)}</span>;
    case 'mono':
      return <span className="font-mono text-[0.8rem]">{v === undefined || v === null ? '—' : String(v)}</span>;
    case 'muted':
      return <span className="text-muted-foreground">{humanize(v)}</span>;
    case 'number':
      return (
        <span className="tabular-nums">
          {humanize(v)}
          {col.unit && v !== null && v !== undefined ? <span className="text-muted-foreground"> {col.unit}</span> : null}
        </span>
      );
    case 'progress': {
      const n = Math.max(0, Math.min(100, Number(v) || 0));
      return (
        <span className="flex min-w-28 items-center gap-2">
          <Progress value={n} className="h-1.5" />
          <span className="w-9 text-right text-muted-foreground text-xs tabular-nums">{n}%</span>
        </span>
      );
    }
    case 'tags':
      return (
        <span className="flex flex-wrap gap-1">
          {(Array.isArray(v) ? v : String(v ?? '').split(',').filter(Boolean)).map((tag) => (
            <ToneBadge key={String(tag)} tone="gray" className="h-5 px-2 text-[11px]">
              {String(tag).trim()}
            </ToneBadge>
          ))}
        </span>
      );
    default:
      return <>{humanize(v)}</>;
  }
}

