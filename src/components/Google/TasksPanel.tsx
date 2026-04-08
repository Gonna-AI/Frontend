import { useState, useEffect, useCallback } from 'react';
import { CheckSquare, Square, Plus, Loader2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useGoogleWorkspace } from '../../hooks/useGoogleWorkspace';

interface Task {
  id: string;
  task_id: string;
  title: string;
  notes: string;
  completed: boolean;
  due_at: string | null;
}

export default function TasksPanel({
  historyId,
  isDark,
}: {
  historyId: string;
  isDark: boolean;
}) {
  const { connection, gFetch } = useGoogleWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!connection.connected || !expanded) return;
    setLoading(true);
    try {
      const data = await gFetch(`google-tasks?historyId=${historyId}`) as { tasks: Task[] };
      setTasks(data.tasks ?? []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [connection.connected, expanded, historyId, gFetch]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const data = await gFetch('google-tasks', {
        method: 'POST',
        body: JSON.stringify({ title: newTitle, notes: newNotes, linkedHistoryId: historyId }),
      }) as { task: Task };
      setTasks(prev => [data.task, ...prev]);
      setNewTitle('');
      setNewNotes('');
      setShowForm(false);
    } catch { /* silent */ } finally {
      setAdding(false);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      const data = await gFetch(`google-tasks?taskId=${task.task_id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: !task.completed }),
      }) as { task: Task };
      setTasks(prev => prev.map(t => t.task_id === task.task_id ? data.task : t));
    } catch { /* silent */ }
  };

  const deleteTask = async (task: Task) => {
    try {
      await gFetch(`google-tasks?taskId=${task.task_id}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.task_id !== task.task_id));
    } catch { /* silent */ }
  };

  if (!connection.connected) return null;

  return (
    <div className={cn('mt-3 border-t pt-3', isDark ? 'border-white/5' : 'border-gray-100')}>
      <button
        onClick={() => setExpanded(e => !e)}
        className={cn(
          'flex items-center gap-2 text-xs font-medium transition-colors',
          isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600',
        )}
      >
        <CheckSquare className="w-3.5 h-3.5" />
        Notes & Tasks {tasks.length > 0 && `(${tasks.length})`}
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {loading ? (
            <div className="flex items-center gap-1.5 py-1">
              <Loader2 className="w-3 h-3 animate-spin text-white/30" />
              <span className={cn('text-xs', isDark ? 'text-white/30' : 'text-gray-400')}>Loading…</span>
            </div>
          ) : (
            <>
              {tasks.map(task => (
                <div key={task.task_id} className="flex items-start gap-2 group">
                  <button onClick={() => toggleTask(task)} className="mt-0.5 shrink-0">
                    {task.completed
                      ? <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                      : <Square className={cn('w-3.5 h-3.5', isDark ? 'text-white/30' : 'text-gray-400')} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-xs',
                      task.completed && 'line-through opacity-50',
                      isDark ? 'text-white/70' : 'text-gray-700',
                    )}>{task.title}</p>
                    {task.notes && (
                      <p className={cn('text-[10px] mt-0.5', isDark ? 'text-white/30' : 'text-gray-400')}>
                        {task.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(task)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              ))}

              {showForm ? (
                <div className={cn(
                  'rounded-lg p-2 space-y-1.5 border',
                  isDark ? 'bg-white/[0.03] border-white/10' : 'bg-gray-50 border-gray-200',
                )}>
                  <input
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Note title…"
                    className={cn(
                      'w-full text-xs bg-transparent outline-none',
                      isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400',
                    )}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                  />
                  <input
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    placeholder="Details (optional)…"
                    className={cn(
                      'w-full text-xs bg-transparent outline-none',
                      isDark ? 'text-white/60 placeholder-white/20' : 'text-gray-600 placeholder-gray-300',
                    )}
                  />
                  <div className="flex gap-2 pt-0.5">
                    <button
                      onClick={addTask}
                      disabled={adding || !newTitle.trim()}
                      className="text-[10px] px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50"
                    >
                      {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                    </button>
                    <button
                      onClick={() => { setShowForm(false); setNewTitle(''); setNewNotes(''); }}
                      className={cn(
                        'text-[10px] px-2.5 py-1 rounded-md',
                        isDark ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600',
                      )}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className={cn(
                    'flex items-center gap-1.5 text-[11px] transition-colors',
                    isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600',
                  )}
                >
                  <Plus className="w-3 h-3" />
                  Add note
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
