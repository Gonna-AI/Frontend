import { useState } from 'react';
import { Loader2, Link2Off, ExternalLink } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useGoogleWorkspace } from '../../hooks/useGoogleWorkspace';

const GoogleLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function ConnectedAppsCard({ isDark }: { isDark: boolean }) {
  const { connection, loading, reconnectRequired, connect, disconnect } = useGoogleWorkspace();
  const [disconnecting, setDisconnecting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    await connect(); // navigates away — state resets on return
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try { await disconnect(); } finally { setDisconnecting(false); }
  };

  return (
    <div className={cn(
      'rounded-xl border p-5 space-y-4',
      isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-black/10',
    )}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', isDark ? 'bg-white/5' : 'bg-gray-50')}>
          <GoogleLogo />
        </div>
        <div>
          <h3 className={cn('font-semibold text-sm', isDark ? 'text-white' : 'text-gray-900')}>
            Google Workspace
          </h3>
          <p className={cn('text-xs', isDark ? 'text-white/40' : 'text-gray-400')}>
            Calendar · Tasks · Gmail · Drive · Contacts
          </p>
        </div>
        {!loading && connection.connected && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            Connected
          </span>
        )}
      </div>

      {/* Reconnect warning */}
      {reconnectRequired && (
        <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          Your Google session expired. Please reconnect to restore access.
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking connection…
        </div>
      ) : connection.connected ? (
        <div className="space-y-3">
          {connection.googleEmail && (
            <p className={cn('text-sm', isDark ? 'text-white/70' : 'text-gray-700')}>
              {connection.googleEmail}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {['Calendar', 'Tasks (Notes)', 'Gmail (read)', 'Drive (read)', 'Contacts'].map(s => (
              <span key={s} className={cn(
                'text-[11px] px-2 py-0.5 rounded-full border',
                isDark
                  ? 'bg-white/5 border-white/10 text-white/50'
                  : 'bg-gray-50 border-gray-200 text-gray-500',
              )}>{s}</span>
            ))}
          </div>
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className={cn(
              'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50',
              isDark
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'bg-red-50 text-red-600 hover:bg-red-100',
            )}
          >
            {disconnecting
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <Link2Off className="w-3 h-3" />}
            Disconnect
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className={cn('text-xs leading-relaxed', isDark ? 'text-white/50' : 'text-gray-500')}>
            Connect your Google account to see your calendar in Monitor, attach notes to calls,
            browse Drive files in Documents, and view email history in Pre-Call Brief.
          </p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className={cn(
              'flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50',
              isDark
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-black text-white hover:bg-gray-800',
            )}
          >
            {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleLogo />}
            Connect Google Workspace
            {!connecting && <ExternalLink className="w-3 h-3 opacity-40" />}
          </button>
        </div>
      )}
    </div>
  );
}
