import { useState, useEffect, useCallback } from 'react';
import { Calendar, Video, Users, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useGoogleWorkspace } from '../../hooks/useGoogleWorkspace';

interface CalendarEvent {
  id: string;
  event_id: string;
  title: string;
  start_at: string;
  end_at: string;
  attendees: { email: string; displayName?: string }[];
  meet_link: string | null;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(); dayAfter.setDate(today.getDate() + 2);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, tomorrow)) return 'Tomorrow';
  if (sameDay(d, dayAfter)) return d.toLocaleDateString([], { weekday: 'long' });
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function TodayScheduleWidget({ isDark }: { isDark: boolean }) {
  const { connection, gFetch } = useGoogleWorkspace();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!connection.connected) return;
    setLoading(true);
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(end.getDate() + 3);
      end.setHours(23, 59, 59, 999);
      const data = await gFetch(
        `google-calendar?start=${start.toISOString()}&end=${end.toISOString()}&maxResults=20`,
      ) as { events: CalendarEvent[] };
      setEvents(data.events ?? []);
      setLastSynced(new Date());
    } catch {
      // non-critical widget — fail silently
    } finally {
      setLoading(false);
    }
  }, [connection.connected, gFetch]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  if (!connection.connected) return null;

  // Group events by calendar day
  const grouped = events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    const key = new Date(ev.start_at).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {});
  const days = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const totalCount = events.length;

  return (
    <div className={cn(
      'rounded-xl border mb-6',
      isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-black/10',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Google Calendar colour dot */}
          <div className="relative flex-shrink-0">
            <Calendar className={cn('w-4 h-4', isDark ? 'text-blue-400' : 'text-blue-500')} />
          </div>
          <span className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
            Upcoming Schedule
          </span>
          {totalCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 tabular-nums">
              {totalCount}
            </span>
          )}
          {/* Google Calendar badge */}
          <span className={cn(
            'hidden sm:flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border font-medium ml-1',
            isDark ? 'bg-white/[0.03] border-white/10 text-white/30' : 'bg-gray-50 border-gray-200 text-gray-400',
          )}>
            <svg viewBox="0 0 48 48" className="w-2.5 h-2.5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Google Calendar
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={fetchEvents}
            disabled={loading}
            title="Refresh"
            className={cn('p-1 rounded transition-colors', isDark ? 'text-white/20 hover:text-white/50' : 'text-gray-300 hover:text-gray-500')}
          >
            <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className={cn('transition-colors', isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600')}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-4 pb-4">
          {loading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white/40" />
              <span className={cn('text-xs', isDark ? 'text-white/40' : 'text-gray-400')}>Loading events…</span>
            </div>
          ) : days.length === 0 ? (
            <p className={cn('text-xs py-2', isDark ? 'text-white/30' : 'text-gray-400')}>
              No events in the next 3 days.
              {lastSynced && (
                <span className="ml-1 opacity-60">
                  Synced {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                </span>
              )}
            </p>
          ) : (
            <div className="space-y-4">
              {days.map(day => (
                <div key={day}>
                  {/* Day label */}
                  <div className={cn(
                    'text-[10px] font-semibold uppercase tracking-wider mb-1.5',
                    isDark ? 'text-white/30' : 'text-gray-400',
                  )}>
                    {dayLabel(grouped[day][0].start_at)}
                  </div>

                  <div className="space-y-1.5">
                    {grouped[day].map(event => (
                      <div key={event.event_id} className={cn(
                        'flex items-start gap-3 p-2.5 rounded-lg',
                        isDark ? 'bg-white/[0.03]' : 'bg-gray-50',
                      )}>
                        <div className="text-right min-w-[52px] shrink-0">
                          <div className={cn('text-xs font-medium', isDark ? 'text-white/70' : 'text-gray-700')}>
                            {formatTime(event.start_at)}
                          </div>
                          <div className={cn('text-[10px]', isDark ? 'text-white/30' : 'text-gray-400')}>
                            {formatTime(event.end_at)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-xs font-medium truncate', isDark ? 'text-white' : 'text-gray-900')}>
                            {event.title}
                          </p>
                          {event.attendees?.length > 0 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Users className={cn('w-3 h-3 shrink-0', isDark ? 'text-white/30' : 'text-gray-400')} />
                              <span className={cn('text-[10px]', isDark ? 'text-white/30' : 'text-gray-400')}>
                                {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                        {event.meet_link && (
                          <a
                            href={event.meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors shrink-0"
                          >
                            <Video className="w-3 h-3" />
                            Join
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {lastSynced && (
                <p className={cn('text-[10px] pt-1', isDark ? 'text-white/20' : 'text-gray-300')}>
                  Synced at {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
