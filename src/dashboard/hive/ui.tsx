import { createContext, useContext } from 'react';

import { Badge } from '@/components/dashboard-ui/badge';
import { cn } from '@/lib/utils';

export type BadgeTone = 'green' | 'red' | 'amber' | 'orange' | 'gray' | 'black';

const TONES: Record<BadgeTone, string> = {
  green: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  red: 'bg-destructive/10 text-destructive',
  amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  orange: 'bg-[color-mix(in_srgb,var(--hd-orange,#ff4d00)_14%,transparent)] text-[var(--hd-orange,#ff4d00)]',
  gray: 'bg-muted text-muted-foreground',
  black: 'bg-primary text-primary-foreground',
};

/** A status in one colour: the same badge everywhere, so a colour always means the same thing. */
export function ToneBadge({ tone = 'gray', className, children }: { tone?: BadgeTone; className?: string; children: React.ReactNode }) {
  return (
    <Badge variant="secondary" className={cn('h-6 px-2.5 font-medium', TONES[tone], className)}>
      {children}
    </Badge>
  );
}

/**
 * Tab classes for Radix state attributes. The shared Tabs primitive keys its look on attributes Radix does not
 * set, so the Hive screens add the active look themselves and every tab row is built the same way.
 */
export const TAB_LIST = 'h-9 max-w-full justify-start gap-1 bg-muted p-1';
export const TAB_TRIGGER = 'h-7 flex-none px-3 text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-input/40';

/**
 * The older Hive screens (.hd-* markup) bring their own unlayered resets for buttons, headings and paragraphs,
 * which would flatten the Tailwind-styled components if they shared a parent. So only those screens are wrapped:
 * the frame, Home and the module screens sit outside, and a screen that mixes both wraps just its old part.
 */
export const SurfaceCtx = createContext<{ className: string; style: React.CSSProperties } | null>(null);

export function Surface({ children }: { children: React.ReactNode }) {
  const surface = useContext(SurfaceCtx);
  return surface ? (
    <div className={surface.className} style={surface.style}>
      {children}
    </div>
  ) : (
    <>{children}</>
  );
}
