import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { fetchHiveHealth, fetchHiveOverview, type HiveApiState } from './hiveApi';
import {
  placeholderOverview,
  type AlarmState,
  type ApprovalState,
  type HiveOverview,
  type WorkOrderState,
} from './placeholder';

export type DetailRef =
  | { kind: 'asset' | 'alarm' | 'workOrder' | 'approval' | 'document' | 'event'; id: string }
  | null;

interface HiveStore {
  data: HiveOverview;
  apiState: HiveApiState;
  detail: DetailRef;
  openDetail: (d: DetailRef) => void;
  setAlarmState: (id: string, state: AlarmState) => void;
  setApprovalState: (id: string, state: ApprovalState) => void;
  setWorkOrderState: (id: string, state: WorkOrderState) => void;
  toast: string | null;
  notify: (message: string) => void;
}

const Ctx = createContext<HiveStore | null>(null);

export function useHive(): HiveStore {
  const v = useContext(Ctx);
  if (!v) throw new Error('useHive must be used inside HiveStoreProvider');
  return v;
}

/**
 * Holds the dashboard data and the local-only edits made on this page.
 * Nothing is sent anywhere: every action changes this page's copy of the placeholder data and
 * says so in a toast. When the write endpoints exist, each action calls the API instead.
 */
export function HiveStoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<HiveOverview>(placeholderOverview);
  const [apiState, setApiState] = useState<HiveApiState>('checking');
  const [detail, setDetail] = useState<DetailRef>(null);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let live = true;
    const ctrl = new AbortController();
    void fetchHiveOverview().then((o) => live && setData(o));
    void fetchHiveHealth(ctrl.signal).then((s) => live && setApiState(s));
    return () => {
      live = false;
      ctrl.abort();
      window.clearTimeout(timer.current);
    };
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const setAlarmState = useCallback(
    (id: string, state: AlarmState) => {
      setData((d) => ({ ...d, alarms: d.alarms.map((a) => (a.id === id ? { ...a, state } : a)) }));
      notify(`${id} marked ${state.toLowerCase()} (placeholder, not saved)`);
    },
    [notify],
  );
  const setApprovalState = useCallback(
    (id: string, state: ApprovalState) => {
      setData((d) => ({ ...d, approvals: d.approvals.map((a) => (a.id === id ? { ...a, state } : a)) }));
      notify(`${id} ${state.toLowerCase()} (placeholder, not saved)`);
    },
    [notify],
  );
  const setWorkOrderState = useCallback(
    (id: string, state: WorkOrderState) => {
      setData((d) => ({ ...d, workOrders: d.workOrders.map((w) => (w.id === id ? { ...w, state } : w)) }));
      notify(`${id} set to ${state} (placeholder, not saved)`);
    },
    [notify],
  );

  const value = useMemo<HiveStore>(
    () => ({ data, apiState, detail, openDetail: setDetail, setAlarmState, setApprovalState, setWorkOrderState, toast, notify }),
    [data, apiState, detail, setAlarmState, setApprovalState, setWorkOrderState, toast, notify],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
