import { createContext, forwardRef, useContext } from 'react';

import { Badge } from '@/components/dashboard-ui/badge';
import { Button } from '@/components/dashboard-ui/button';
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
 * set, so the Hive screens add the active look themselves and every tab row is built the same way:
 * an underlined strip (the familiar business-app tab bar) with the active tab marked in the brand colour.
 */
export const TAB_LIST = 'h-auto max-w-full justify-start gap-5 rounded-none border-b bg-transparent p-0 md:gap-7';
export const TAB_TRIGGER =
  'h-12 flex-none rounded-none border-0 border-b-[3px] border-transparent bg-transparent px-0.5 pt-1 text-[1rem] font-medium text-muted-foreground shadow-none after:hidden hover:text-foreground data-[state=active]:border-[var(--hd-orange,#ff4d00)] data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-[var(--hd-orange,#ff4d00)]';
/** The small segmented switch (a time range, a view): a pill, not a page-level tab. */
export const PILL_LIST = 'h-10 justify-start gap-1 bg-muted p-1';
export const PILL_TRIGGER = 'h-8 flex-none px-3.5 text-[0.9375rem] text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-input/40';

type ButtonProps = React.ComponentProps<typeof Button>;

/** The one primary action: brand orange, large enough to hit, readable at a glance. */
export function BrandButton({ className, ...props }: ButtonProps) {
  return <Button {...props} className={cn('h-11 gap-2 rounded-xl bg-[var(--hd-orange,#ff4d00)] px-5 text-[1rem] font-semibold text-[var(--hd-on-accent,#fff)] shadow-md hover:bg-[color-mix(in_srgb,var(--hd-orange,#ff4d00)_90%,#000)]', className)} />;
}

/** A quiet button for the ink header and banner. */
export const GhostOnInk = forwardRef<HTMLButtonElement, ButtonProps>(function GhostOnInk({ className, ...props }, ref) {
  return <Button ref={ref} variant="ghost" {...props} className={cn('rounded-xl border border-white/20 bg-white/5 text-white hover:bg-white/12 hover:text-white', className)} />;
});

/** A secondary button on the ink banner. */
export function InkButton({ className, ...props }: ButtonProps) {
  return <Button variant="outline" {...props} className={cn('h-11 gap-2 rounded-xl border-white/25 bg-white/10 px-5 text-[1rem] font-medium text-white hover:bg-white/18 hover:text-white', className)} />;
}

/**
 * The older Hive screens (.hd-* markup) bring their own unlayered resets for buttons, headings and paragraphs,
 * which would flatten the Tailwind-styled components if they shared a parent. So only those screens are wrapped:
 * the frame, Home and the module screens sit outside, and a screen that mixes both wraps just its old part.
 */
export const SurfaceCtx = createContext<{ className: string; style: React.CSSProperties } | null>(null);

export function Surface({ children, plain }: { children: React.ReactNode; plain?: boolean }) {
  const surface = useContext(SurfaceCtx);
  return surface ? (
    <div className={plain ? `${surface.className} is-plain` : surface.className} style={surface.style}>
      {children}
    </div>
  ) : (
    <>{children}</>
  );
}
