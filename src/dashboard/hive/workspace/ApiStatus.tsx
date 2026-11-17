import { ExternalLink, RefreshCcw } from 'lucide-react-dash';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/dashboard-ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/dashboard-ui/popover';
import { cn } from '@/lib/utils';

import { fetchHiveStatus, hasHiveCredentials, type HiveStatus } from '../api/client';
import { useT } from '../i18n';

/** Reads the public health of the HIVE API every minute while the page is visible. */
export function useHiveStatus(): [HiveStatus | null, () => void] {
  const [status, setStatus] = useState<HiveStatus | null>(null);
  const check = useCallback(() => {
    void fetchHiveStatus().then(setStatus);
  }, []);
  useEffect(() => {
    check();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') check();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [check]);
  return [status, check];
}

function Line({ label, ok, value }: { label: string; ok?: boolean; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        {ok !== undefined && <span className={cn('size-1.5 rounded-full', ok ? 'bg-emerald-500' : 'bg-red-500')} />}
        {label}
      </span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

export default function ApiStatus() {
  const t = useT();
  const [s, recheck] = useHiveStatus();
  const connected = hasHiveCredentials();
  const tone = !s ? 'bg-muted-foreground animate-pulse' : s.reachable && s.ready ? 'bg-emerald-500' : s.reachable ? 'bg-amber-500' : 'bg-red-500';
  const label = !s ? t('Checking API') : s.reachable ? (connected ? t('Live data') : t('API online · demo data')) : t('API offline · demo data');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="mr-1 hidden h-7 gap-1.5 rounded-full px-2.5 font-normal text-muted-foreground lg:inline-flex">
          <span className={cn('size-1.5 rounded-full', tone)} />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">{t('HIVE API')}</p>
          <Button variant="ghost" size="icon-xs" onClick={recheck} aria-label={t('Check again')}>
            <RefreshCcw />
          </Button>
        </div>
        <div className="mt-2 divide-y">
          <Line label={t('Reachable')} ok={s?.reachable} value={s ? (s.reachable ? `${s.latencyMs ?? '—'} ms` : t('No')) : '…'} />
          <Line label={t('Database ready')} ok={s?.ready} value={s ? (s.ready ? t('Yes') : t('No')) : '…'} />
          <Line label={t('API version')} value={s?.version ?? '—'} />
          <Line label={t('Public operations')} value={s?.operations ?? '—'} />
          <Line label={t('Tenant connected')} ok={connected} value={connected ? t('Yes') : t('Not yet')} />
        </div>
        <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
          {connected
            ? t('Screens read your tenant from the HIVE API. Screens whose module is not built yet still show demo data, marked Placeholder.')
            : t('The health and contract above are live. Screens show demo data from the reference plant, marked Placeholder, until this workspace is connected to your HIVE tenant.')}
        </p>
        <a className="mt-3 inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline" href="https://docs.hive.clerktree.com/reference" target="_blank" rel="noopener noreferrer">
          {t('API reference')}
          <ExternalLink className="size-3" />
        </a>
      </PopoverContent>
    </Popover>
  );
}
