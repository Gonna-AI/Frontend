/**
 * A group's overview: its screens as cards under the cluster they belong to. This is the "where do I go?"
 * page: every screen is one tap away, with a sentence saying what it is for.
 */
import { ArrowUpRight } from 'lucide-react-dash';

import { useT } from './i18n';
import { NAV, NAV_SECTIONS } from './nav';

const BASE = '/dashboard/hive';

export default function HubView({ id, go }: { id: string; go: (section: string) => void }) {
  const t = useT();
  const group = NAV_SECTIONS.find((s) => s.hub === id);
  if (!group) return null;
  return (
    <div className="flex flex-col gap-8">
      {group.parts.map((part) => (
        <section key={part.id} aria-labelledby={`hub-${part.id}`} className="grid gap-3">
          <header className="flex items-baseline justify-between gap-3">
            <h2 id={`hub-${part.id}`} className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              {t(part.title)}
            </h2>
            <span className="text-muted-foreground text-xs tabular-nums">{part.ids.length}</span>
          </header>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {part.ids.map((sid) => {
              const item = NAV[sid];
              const Icon = item.icon;
              return (
                <li key={sid} className="min-w-0">
                  <a
                    href={`${BASE}/${sid}`}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                      e.preventDefault();
                      go(sid);
                    }}
                    className="group flex h-full items-start gap-3 rounded-[var(--hx-r-card,14px)] border bg-card p-4 outline-none transition-colors hover:border-foreground/25 hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-[var(--hx-r-inner,10px)] border bg-muted text-foreground">
                      <Icon className="size-5" strokeWidth={1.8} />
                    </span>
                    <span className="grid min-w-0 flex-1 gap-1">
                      <span className="font-medium text-[0.9375rem] leading-tight">{t(item.title)}</span>
                      <span className="line-clamp-2 text-muted-foreground text-sm leading-snug">{t(item.about)}</span>
                    </span>
                    <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
