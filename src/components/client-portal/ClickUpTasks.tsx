import { useEffect, useState } from 'react';
import { CheckSquare, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { fetchClickUpTasks } from '../../services/clientPortalService';
import type { ClickUpTask } from '../../types/clientPortal';

function dueDateLabel(rawMs: string | null): string {
    if (!rawMs) return 'No due date';
    const ms = parseInt(rawMs, 10);
    if (isNaN(ms)) return 'No due date';
    return new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusDot({ color }: { color: string }) {
    return (
        <span
            className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full border border-white/10"
            style={{ backgroundColor: color || '#555' }}
        />
    );
}

function TaskRow({ task }: { task: ClickUpTask }) {
    return (
        <a
            href={task.url}
            target="_blank"
            rel="noreferrer"
            className="group flex items-start gap-3 rounded-[1.4rem] border border-white/10 bg-black/20 p-4 transition hover:border-white/16 hover:bg-white/[0.05]"
        >
            <StatusDot color={task.status.color} />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white group-hover:text-[#FFB08C]">{task.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
                    <span>{task.status.status}</span>
                    {task.priority ? <span style={{ color: task.priority.color }}>{task.priority.priority}</span> : null}
                    <span>{dueDateLabel(task.due_date)}</span>
                </div>
            </div>
            <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0 text-white/20 transition group-hover:text-white/50" />
        </a>
    );
}

export default function ClickUpTasks({ clickupListId }: { clickupListId: string | null }) {
    const [tasks, setTasks] = useState<ClickUpTask[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [configured, setConfigured] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open || !clickupListId) return;

        let active = true;
        setLoading(true);
        setError(null);

        fetchClickUpTasks()
            .then(({ tasks: fetched, configured: cfg }) => {
                if (!active) return;
                setTasks(fetched);
                setConfigured(cfg);
            })
            .catch(() => {
                if (active) setError('Could not load tasks right now.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [open, clickupListId]);

    return (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_30px_100px_rgba(0,0,0,0.3)]">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-3 p-6 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-full border border-white/10 bg-white/[0.06] p-2.5">
                        <CheckSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B]">ClickUp</p>
                        <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-white">Task updates</h2>
                    </div>
                </div>
                {open ? <ChevronUp className="h-5 w-5 text-white/40" /> : <ChevronDown className="h-5 w-5 text-white/40" />}
            </button>

            {open ? (
                <div className="border-t border-white/10 px-6 pb-6 pt-5">
                    {loading ? (
                        <p className="text-sm text-white/40">Loading tasks…</p>
                    ) : error ? (
                        <p className="text-sm text-[#FFD1BF]">{error}</p>
                    ) : !configured || tasks.length === 0 ? (
                        <p className="text-sm leading-7 text-white/40">
                            {configured ? 'No tasks found in this list.' : 'ClickUp is not connected to this workspace.'}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {tasks.slice(0, 20).map((task) => <TaskRow key={task.id} task={task} />)}
                        </div>
                    )}
                </div>
            ) : null}
        </section>
    );
}
