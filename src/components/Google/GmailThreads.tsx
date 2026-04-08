import { useState, useEffect, useCallback } from 'react';
import { Mail, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useGoogleWorkspace } from '../../hooks/useGoogleWorkspace';

interface EmailThread {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

function formatDate(dateStr: string): string {
  try { return new Date(dateStr).toLocaleDateString(); } catch { return dateStr; }
}

export default function GmailThreads({
  contactEmail,
  isDark,
}: {
  contactEmail: string;
  isDark: boolean;
}) {
  const { connection, gFetch } = useGoogleWorkspace();
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchThreads = useCallback(async () => {
    if (!connection.connected || !contactEmail || !expanded) return;
    setLoading(true);
    try {
      const data = await gFetch(
        `google-gmail?email=${encodeURIComponent(contactEmail)}&maxResults=5`,
      ) as { threads: EmailThread[] };
      setThreads(data.threads ?? []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [connection.connected, contactEmail, expanded, gFetch]);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  if (!connection.connected || !contactEmail) return null;

  return (
    <div className={cn('mt-3 border-t pt-3', isDark ? 'border-white/5' : 'border-gray-100')}>
      <button
        onClick={() => setExpanded(e => !e)}
        className={cn(
          'flex items-center gap-2 text-xs font-medium transition-colors w-full',
          isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600',
        )}
      >
        <Mail className="w-3.5 h-3.5" />
        Recent Emails
        {expanded
          ? <ChevronUp className="w-3 h-3 ml-auto" />
          : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-white/30" />
              <span className={cn('text-xs', isDark ? 'text-white/30' : 'text-gray-400')}>Loading…</span>
            </div>
          ) : threads.length === 0 ? (
            <p className={cn('text-xs', isDark ? 'text-white/30' : 'text-gray-400')}>
              No recent emails with {contactEmail}.
            </p>
          ) : (
            threads.map(thread => (
              <div key={thread.id} className={cn(
                'p-2.5 rounded-lg border',
                isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-100',
              )}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className={cn('text-xs font-medium truncate', isDark ? 'text-white/80' : 'text-gray-800')}>
                    {thread.subject}
                  </p>
                  <span className={cn('text-[10px] shrink-0', isDark ? 'text-white/30' : 'text-gray-400')}>
                    {formatDate(thread.date)}
                  </span>
                </div>
                <p className={cn('text-[10px] truncate', isDark ? 'text-white/30' : 'text-gray-500')}>
                  {thread.from}
                </p>
                <p className={cn('text-[10px] mt-1 line-clamp-2', isDark ? 'text-white/40' : 'text-gray-500')}>
                  {thread.snippet}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
