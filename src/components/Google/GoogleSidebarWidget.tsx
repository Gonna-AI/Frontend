import { useGoogleWorkspace } from '../../hooks/useGoogleWorkspace';
import { cn } from '../../utils/cn';

interface GoogleSidebarWidgetProps {
  /** Mirrors the shadcn Sidebar collapsed state ("collapsed" | "expanded") */
  state?: string;
  /** Navigate to settings / Connected Apps tab */
  onNavigateSettings?: () => void;
}

/** Google "G" SVG in brand colours — used as a small connection badge. */
function GoogleGIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn('flex-shrink-0', className)}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/**
 * Compact sidebar widget that shows Google Workspace connection status.
 *
 * - Collapsed sidebar: just the Google icon with a green connected dot.
 * - Expanded sidebar: icon + "Google Connected" label + account email.
 * - Not connected: renders nothing (no noise in the sidebar).
 */
export function GoogleSidebarWidget({ state = 'expanded', onNavigateSettings }: GoogleSidebarWidgetProps) {
  const { connection } = useGoogleWorkspace();

  if (!connection.connected) return null;

  const collapsed = state === 'collapsed';
  const email = connection.googleEmail ?? '';
  const shortEmail = email.length > 24 ? email.slice(0, 22) + '…' : email;

  return (
    <button
      onClick={onNavigateSettings}
      title={collapsed ? `Google: ${email}` : undefined}
      className={cn(
        'w-full flex items-center gap-2.5 rounded-lg transition-colors text-left',
        collapsed ? 'justify-center px-0 py-2' : 'px-2 py-2',
        'hover:bg-white/5 group',
      )}
    >
      {/* Icon with live status dot */}
      <div className="relative shrink-0">
        <GoogleGIcon className="w-5 h-5" />
        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-black" />
      </div>

      {/* Text — hidden when sidebar is collapsed */}
      {!collapsed && (
        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 leading-none mb-0.5">
            Google Connected
          </p>
          <p className="text-xs text-white/60 truncate font-medium leading-none">
            {shortEmail}
          </p>
        </div>
      )}
    </button>
  );
}
