import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { fetchHiveHealth, fetchHiveOverview, type HiveApiState } from './hiveApi';
import {
  placeholderOverview,
  type AlarmState,
  type ApprovalState,
  type AssistantMessage,
  type AssistantThread,
  type HiveApproval,
  type HiveOverview,
  type WorkOrderState,
} from './placeholder';

export type DetailRef = { kind: 'alarm' | 'workOrder' | 'document' | 'event' | 'part'; id: string } | null;

interface HiveStore {
  data: HiveOverview;
  apiState: HiveApiState;
  detail: DetailRef;
  openDetail: (d: DetailRef) => void;
  setAlarmState: (id: string, state: AlarmState) => void;
  setApprovalState: (id: string, state: ApprovalState, reason?: string) => void;
  setWorkOrderState: (id: string, state: WorkOrderState) => void;
  decideFinding: (id: string, status: 'Confirmed' | 'Rejected', reason?: string) => void;
  reservePart: (id: string) => void;
  decideRequisition: (id: string, state: 'Approved' | 'Rejected') => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNote: (machineId: string, text: string) => void;
  notes: Record<string, { text: string; at: string }[]>;
  newThread: (context: string) => string;
  sendMessage: (threadId: string, text: string) => void;
  runningThread: string | null;
  draftFromAnswer: (threadId: string) => void;
  mutate: (fn: (d: HiveOverview) => HiveOverview, message?: string) => void;
  toast: string | null;
  notify: (message: string) => void;
}

const Ctx = createContext<HiveStore | null>(null);

export function useHive(): HiveStore {
  const v = useContext(Ctx);
  if (!v) throw new Error('useHive must be used inside HiveStoreProvider');
  return v;
}

const LOCAL = '(placeholder, not saved)';

/** Canned assistant behaviour used until the assistant API exists. It never invents: unknown topics abstain. */
function answerFor(question: string): Pick<AssistantMessage, 'text' | 'citations' | 'abstained'> {
  const q = question.toLowerCase();
  if (/(part|stock|spare|bearing 6205)/.test(q)) {
    return {
      text: 'Bearing 6205-2RS: 1 on hand against a minimum of 2 (stock record synced 2 days ago). A purchase requisition for 2 pieces from Wälzlager Nord GmbH is waiting for approval.',
      citations: [{ label: 'Stock position 6205-2RS', locator: 'Lager A-12', applicability: 'applies' }],
    };
  }
  if (/(cnc-07|spindle|bearing|vibration|temperature|alarm)/.test(q)) {
    return {
      text: 'The spindle bearing temperature on CNC-07 is above its 80 °C limit (87.4 °C), and vibration on the drive-end bearing has trended up 18% over 24 hours. The manual recommends inspecting the bearing when both occur. I suggest a work order for a bearing inspection, which a person must approve.',
      citations: [
        { label: 'Spindle bearing temperature', locator: 'signal · last 3 min', applicability: 'applies' },
        { label: 'CNC-07 operating manual', locator: 'p. 118', applicability: 'applies' },
        { label: 'CNC-09 service note', locator: 'p. 2', applicability: 'does_not_apply', reason: 'other model variant' },
      ],
    };
  }
  return {
    text: 'I can’t answer that from the sources connected to this plant. I did not find signals, documents or records that support an answer, so I won’t guess. Try naming a machine, alarm or part.',
    abstained: true,
  };
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
  const [notes, setNotes] = useState<Record<string, { text: string; at: string }[]>>({});
  const [runningThread, setRunning] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const runTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let live = true;
    const ctrl = new AbortController();
    void fetchHiveOverview().then((o) => live && setData(o));
    void fetchHiveHealth(ctrl.signal).then((s) => live && setApiState(s));
    return () => {
      live = false;
      ctrl.abort();
      window.clearTimeout(timer.current);
      window.clearTimeout(runTimer.current);
    };
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const mutate = useCallback(
    (fn: (d: HiveOverview) => HiveOverview, message?: string) => {
      setData(fn);
      if (message) notify(`${message} ${LOCAL}`);
    },
    [notify],
  );

  const setAlarmState = useCallback(
    (id: string, state: AlarmState) =>
      mutate((d) => ({ ...d, alarms: d.alarms.map((a) => (a.id === id ? { ...a, state } : a)), machines: d.machines.map((m) => ({ ...m, openAlarms: d.alarms.filter((a) => a.machineId === m.id && (a.id === id ? state : a.state) === 'Open').length })) }), `${id} marked ${state.toLowerCase()}`),
    [mutate],
  );

  const setApprovalState = useCallback(
    (id: string, state: ApprovalState, reason?: string) =>
      mutate((d) => {
        const apr = d.approvals.find((a) => a.id === id);
        const next = { ...d, approvals: d.approvals.map((a: HiveApproval) => (a.id === id ? { ...a, state, rejectReason: reason } : a)) };
        // Approving a drafted work order moves the matching work order forward.
        if (apr && state === 'Approved' && apr.kind === 'work_order') {
          next.workOrders = d.workOrders.map((w) => (apr.title.toLowerCase().includes(w.title.toLowerCase()) && w.state === 'Draft' ? { ...w, state: 'Submitted' as const } : w));
        }
        return next;
      }, `${id} ${state.toLowerCase()}`),
    [mutate],
  );

  const setWorkOrderState = useCallback(
    (id: string, state: WorkOrderState) => mutate((d) => ({ ...d, workOrders: d.workOrders.map((w) => (w.id === id ? { ...w, state } : w)) }), `${id} set to ${state}`),
    [mutate],
  );

  const decideFinding = useCallback(
    (id: string, status: 'Confirmed' | 'Rejected', reason?: string) => mutate((d) => ({ ...d, findings: d.findings.map((f) => (f.id === id ? { ...f, status, reason } : f)) }), `${id} ${status.toLowerCase()}`),
    [mutate],
  );

  const reservePart = useCallback(
    (id: string) => mutate((d) => ({ ...d, parts: d.parts.map((p) => (p.id === id && p.onHand - p.reserved > 0 ? { ...p, reserved: p.reserved + 1 } : p)) }), `Reserved one ${id}`),
    [mutate],
  );

  const decideRequisition = useCallback(
    (id: string, state: 'Approved' | 'Rejected') => mutate((d) => ({ ...d, requisitions: d.requisitions.map((r) => (r.id === id ? { ...r, state } : r)) }), `${id} ${state.toLowerCase()}`),
    [mutate],
  );

  const markRead = useCallback((id: string) => setData((d) => ({ ...d, notifications: d.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })), []);
  const markAllRead = useCallback(() => setData((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) })), []);

  const addNote = useCallback(
    (machineId: string, text: string) => {
      setNotes((n) => ({ ...n, [machineId]: [{ text, at: 'just now' }, ...(n[machineId] ?? [])] }));
      notify(`Note added ${LOCAL}`);
    },
    [notify],
  );

  const newThread = useCallback((context: string) => {
    const id = `thr_${Date.now()}`;
    const t: AssistantThread = { id, title: 'New conversation', context, at: 'now', messages: [] };
    setData((d) => ({ ...d, threads: [t, ...d.threads] }));
    return id;
  }, []);

  const sendMessage = useCallback(
    (threadId: string, text: string) => {
      const userMsg: AssistantMessage = { id: `m_${Date.now()}`, from: 'user', text };
      setData((d) => ({ ...d, threads: d.threads.map((t) => (t.id === threadId ? { ...t, title: t.messages.length ? t.title : text.slice(0, 60), messages: [...t.messages, userMsg] } : t)) }));
      setRunning(threadId);
      window.clearTimeout(runTimer.current);
      runTimer.current = window.setTimeout(() => {
        const a = answerFor(text);
        setData((d) => ({ ...d, threads: d.threads.map((t) => (t.id === threadId ? { ...t, messages: [...t.messages, { id: `m_${Date.now()}`, from: 'assistant', ...a }] } : t)) }));
        setRunning(null);
      }, 1400);
    },
    [],
  );

  const draftFromAnswer = useCallback(
    (threadId: string) => {
      const t = data.threads.find((x) => x.id === threadId);
      if (!t) return;
      const id = `APR_${String(208 + data.approvals.length - 4).padStart(4, '0')}`;
      mutate(
        (d) => ({
          ...d,
          approvals: [
            { id, kind: 'work_order', title: `Create work order: ${t.context} follow-up`, machine: t.context, source: 'Assistant recommendation', tier: 'T1', state: 'Pending', requestedAt: 'just now', summary: 'Writes one work order to the maintenance system. Nothing is sent to the machine.', fields: [{ k: 'Priority', v: 'Medium' }, { k: 'Written to', v: 'Maintenance system' }], evidence: [] },
            ...d.approvals,
          ],
        }),
        `Draft ${id} sent to Inbox for a person to decide`,
      );
    },
    [data.threads, data.approvals.length, mutate],
  );

  const value = useMemo<HiveStore>(
    () => ({ data, apiState, detail, openDetail: setDetail, setAlarmState, setApprovalState, setWorkOrderState, decideFinding, reservePart, decideRequisition, markRead, markAllRead, addNote, notes, newThread, sendMessage, runningThread, draftFromAnswer, mutate, toast, notify }),
    [data, apiState, detail, setAlarmState, setApprovalState, setWorkOrderState, decideFinding, reservePart, decideRequisition, markRead, markAllRead, addNote, notes, newThread, sendMessage, runningThread, draftFromAnswer, mutate, toast, notify],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
