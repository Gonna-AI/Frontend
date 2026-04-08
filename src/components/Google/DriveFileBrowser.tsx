import { useState, useEffect, useCallback } from 'react';
import { Search, ExternalLink, Loader2, FileText, Image, Table2, File } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useGoogleWorkspace } from '../../hooks/useGoogleWorkspace';

interface DriveFile {
  file_id: string;
  name: string;
  mime_type: string;
  web_view_link: string;
  modified_at: string;
}

function mimeIcon(mime: string) {
  if (mime.includes('document')) return <FileText className="w-4 h-4 text-blue-400" />;
  if (mime.includes('spreadsheet')) return <Table2 className="w-4 h-4 text-emerald-400" />;
  if (mime.includes('presentation')) return <FileText className="w-4 h-4 text-orange-400" />;
  if (mime.startsWith('image/')) return <Image className="w-4 h-4 text-purple-400" />;
  return <File className="w-4 h-4 text-white/40" />;
}

function relativeDate(iso: string): string {
  try {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
  } catch {
    return '';
  }
}

export default function DriveFileBrowser({ isDark }: { isDark: boolean }) {
  const { connection, gFetch } = useGoogleWorkspace();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const fetchFiles = useCallback(async (q = '', pageToken = '') => {
    if (!connection.connected) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ query: q });
      if (pageToken) params.set('pageToken', pageToken);
      const data = await gFetch(`google-drive?${params}`) as {
        files: DriveFile[];
        nextPageToken: string | null;
      };
      setFiles(prev => pageToken ? [...prev, ...data.files] : data.files);
      setNextPageToken(data.nextPageToken ?? null);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [connection.connected, gFetch]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  if (!connection.connected) {
    return (
      <div className={cn('py-8 text-center text-sm', isDark ? 'text-white/30' : 'text-gray-400')}>
        Connect Google in Settings → Connected Apps to browse Drive files.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={e => { e.preventDefault(); setFiles([]); fetchFiles(query); }}
        className="flex gap-2"
      >
        <div className={cn(
          'flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm',
          isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-gray-200',
        )}>
          <Search className={cn('w-4 h-4 shrink-0', isDark ? 'text-white/30' : 'text-gray-400')} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Drive files…"
            className={cn(
              'flex-1 bg-transparent outline-none text-sm',
              isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400',
            )}
          />
        </div>
        <button
          type="submit"
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black text-white hover:bg-gray-800',
          )}
        >
          Search
        </button>
      </form>

      {loading && files.length === 0 ? (
        <div className="flex items-center gap-2 py-4">
          <Loader2 className="w-4 h-4 animate-spin text-white/40" />
          <span className={cn('text-sm', isDark ? 'text-white/40' : 'text-gray-400')}>Loading…</span>
        </div>
      ) : files.length === 0 ? (
        <p className={cn('py-4 text-sm text-center', isDark ? 'text-white/30' : 'text-gray-400')}>
          No files found.
        </p>
      ) : (
        <>
          <div className="space-y-1.5">
            {files.map(file => (
              <div key={file.file_id} className={cn(
                'flex items-center gap-3 p-3 rounded-xl border transition-colors group',
                isDark
                  ? 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'
                  : 'bg-white border-gray-100 hover:bg-gray-50',
              )}>
                {mimeIcon(file.mime_type)}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium truncate', isDark ? 'text-white/80' : 'text-gray-800')}>
                    {file.name}
                  </p>
                  <p className={cn('text-xs', isDark ? 'text-white/30' : 'text-gray-400')}>
                    {relativeDate(file.modified_at)}
                  </p>
                </div>
                <a
                  href={file.web_view_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg shrink-0',
                    isDark
                      ? 'bg-white/10 text-white/70 hover:bg-white/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </a>
              </div>
            ))}
          </div>
          {nextPageToken && (
            <button
              onClick={() => fetchFiles(query, nextPageToken)}
              disabled={loading}
              className={cn(
                'w-full py-2 text-sm rounded-xl border transition-colors disabled:opacity-50',
                isDark
                  ? 'border-white/10 text-white/50 hover:bg-white/5'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50',
              )}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
