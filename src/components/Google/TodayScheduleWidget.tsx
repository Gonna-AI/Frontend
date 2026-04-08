import { useState, useEffect, useCallback } from 'react';
import { Calendar, Video, Users, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
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

export default function TodayScheduleWidget({ isDark }: { isDark: boolean }) {
  const { connection, gFetch } = useGoogleWorkspace();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const fetchTodayEvents = useCallback(async () => {
    if (!connection.connected) return;
    setLoading(true);
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const data = await gFetch(
        `google-calendar?start=${start.toISOString()}&end=${end.toISOString()}&maxResults=10`,
      ) as { events: CalendarEvent[] };
      setEvents(data.events ?? []);
    } catch {
      // non-critical widget — fail silently
    } finally {
      setLoading(false);
    }
  }, [connection.connected, gFetch]);

  useEffect(() => { fetchTodayEvents(); }, [fetchTodayEvents]);

  if (!connection.connected) return null;

  return (
    <div className={cn(
      'rounded-xl border p-4 mb-6',
      isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-black/10',
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className={cn('w-4 h-4', isDark ? 'text-blue-400' : 'text-blue-500')} />
          <span className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
            Today's Schedule
          </span>
          {events.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {events.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className={cn('transition-colors', isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600')}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        loading ? (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white/40" />
            <span className={cn('text-xs', isDark ? 'text-white/40' : 'text-gray-400')}>Loading…</span>
          </div>
        ) : events.length === 0 ? (
          <p className={cn('text-xs py-2', isDark ? 'text-white/30' : 'text-gray-400')}>
            No events scheduled for today.
          </p>
        ) : (
          <div className="space-y-2">
            {events.map(event => (
              <div key={event.event_id} className={cn(
                'flex items-start gap-3 p-2.5 rounded-lg',
                isDark ? 'bg-white/[0.03]' : 'bg-gray-50',
              )}>
                <div className="text-right min-w-[60px] shrink-0">
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
                      <Users className={cn('w-3 h-3', isDark ? 'text-white/30' : 'text-gray-400')} />
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
        )
      )}
    </div>
  );
}
