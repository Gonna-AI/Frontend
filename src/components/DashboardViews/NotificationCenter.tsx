import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell, Check, CheckCheck, Trash2, Loader2, X,
  CreditCard, Users, Shield, Phone, Info, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { supabase } from '../../config/supabase';

interface NotificationCenterProps {
  isDark: boolean;
  className?: string;
}

interface NotificationEntry {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  info: <Info className="w-3.5 h-3.5" />,
  warning: <AlertTriangle className="w-3.5 h-3.5" />,
  success: <CheckCircle2 className="w-3.5 h-3.5" />,
  error: <X className="w-3.5 h-3.5" />,
};

const TYPE_COLORS: Record<string, string> = {
  info: 'text-[#FFB286] bg-[#FF8A5B]/12',
  warning: 'text-[#FF9E6C] bg-[#FF8A5B]/14',
  success: 'text-[#FFD1B8] bg-[#FF8A5B]/10',
  error: 'text-red-400 bg-red-500/12',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  billing: <CreditCard className="w-3 h-3" />,
  team: <Users className="w-3 h-3" />,
  security: <Shield className="w-3 h-3" />,
  calls: <Phone className="w-3 h-3" />,
  system: <Info className="w-3 h-3" />,
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function NotificationCenter({ isDark, className }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const apiCall = useCallback(async (path: string, options?: RequestInit) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) return null;
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-notifications/${path}`, {
        ...options,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options?.headers || {}) },
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      // Silently handle network errors — edge function may not be deployed
      return null;
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await apiCall('unread-count');
      if (data) setUnreadCount(data.count ?? 0);
    } catch { }
  }, [apiCall]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiCall('?limit=30');
      if (data) setNotifications(data.notifications || []);
    } catch (err) {
      console.error('[NotificationCenter] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Subscribe to new notifications via Realtime (replaces 30s polling)
  // User-scoped filter ensures each user only receives their own events —
  // critical at 1M-user scale to avoid O(N²) broadcast fan-out.
  useEffect(() => {
    fetchUnreadCount();

    let channel: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user?.id) return;

      channel = supabase
        .channel(`notifications_${session.user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            // Increment badge immediately
            setUnreadCount(prev => prev + 1);
            // If dropdown is open, prepend the new notification
            if (payload.new) {
              setNotifications(prev => [payload.new as NotificationEntry, ...prev]);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            setNotifications(prev => prev.filter(n => n.id !== (payload.old as { id: string }).id));
          }
        )
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchUnreadCount]);

  // Fetch full list when opened
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const updatePosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const isMobileViewport = window.innerWidth < 640;
    const width = Math.min(380, Math.floor(window.innerWidth * 0.92));
    const margin = 12;
    const maxHeight = Math.min(520, window.innerHeight - margin * 2);
    const left = isMobileViewport
      ? (window.innerWidth - width) / 2
      : Math.min(Math.max(rect.right - width, 8), window.innerWidth - width - 8);
    const top = Math.min(rect.bottom + margin, window.innerHeight - margin - maxHeight);
    setDropdownStyle({
      position: 'fixed',
      top,
      left,
      width,
      maxHeight,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onResize = () => updatePosition();
    const onScroll = () => updatePosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, updatePosition]);

  const markAllRead = async () => {
    try {
      await apiCall('mark-read', { method: 'POST', body: JSON.stringify({ ids: [] }) });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { }
  };

  const markRead = async (id: string) => {
    try {
      await apiCall('mark-read', { method: 'POST', body: JSON.stringify({ ids: [id] }) });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { }
  };

  const clearRead = async () => {
    try {
      await apiCall('', { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => !n.is_read));
    } catch { }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className={cn(
          "relative inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors backdrop-blur-sm",
          isDark
            ? "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            : "border-black/10 bg-black/5 text-black/60 hover:bg-black/10 hover:text-black"
        )}
      >
        <Bell className="h-3.5 w-3.5" />
        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#FF8A5B] text-[8px] font-bold text-white leading-none ring-2 shadow-[0_0_12px_rgba(255,138,91,0.5)]",
              isDark ? "ring-[#0A0A0A]" : "ring-white"
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className={cn(
            "rounded-2xl border shadow-2xl z-[500] flex flex-col overflow-hidden backdrop-blur-2xl",
            "relative [&>*]:relative [&>*]:z-10",
            "before:content-[''] before:absolute before:inset-0 before:pointer-events-none before:bg-[radial-gradient(circle_at_20%_0%,rgba(255,138,91,0.16),transparent_60%)]",
            "after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:bg-[url('/noise.webp')] after:bg-[length:30%] after:opacity-[0.08]",
            isDark ? "bg-[#0F0F12]/98 border-white/10 shadow-black/60" : "bg-white/98 border-gray-200 shadow-lg shadow-gray-200/50"
          )}
        >
          {/* Header */}
          <div className={cn("px-4 py-3 border-b flex items-center justify-between shrink-0", isDark ? "border-white/10" : "border-gray-100")}>
            <h3 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className={cn("p-1 rounded-md text-xs transition-colors flex items-center gap-1", isDark ? "text-white/40 hover:text-white hover:bg-white/5" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50")}
                  title="Mark all read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={clearRead}
                className={cn("p-1 rounded-md text-xs transition-colors", isDark ? "text-white/40 hover:text-white hover:bg-white/5" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50")}
                title="Clear read"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {loading ? (
              <div className="py-8 text-center">
                <Loader2 className={cn("w-5 h-5 animate-spin mx-auto", isDark ? "text-white/30" : "text-gray-400")} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className={cn("w-8 h-8 mx-auto mb-2", isDark ? "text-white/10" : "text-gray-200")} />
                <p className={cn("text-xs", isDark ? "text-white/30" : "text-gray-400")}>No notifications</p>
              </div>
            ) : (
              <div className={cn("divide-y", isDark ? "divide-white/5" : "divide-gray-50")}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => { if (!n.is_read) markRead(n.id); }}
                    className={cn(
                      "px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer",
                      !n.is_read && (isDark ? "bg-[#FF8A5B]/[0.06]" : "bg-orange-50/60"),
                      isDark ? "hover:bg-white/[0.04]" : "hover:bg-gray-50/60"
                    )}
                  >
                    <div className={cn("p-1.5 rounded-lg shrink-0 mt-0.5", TYPE_COLORS[n.type] || TYPE_COLORS.info)}>
                      {TYPE_ICONS[n.type] || TYPE_ICONS.info}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-xs font-semibold", isDark ? "text-white" : "text-gray-900")}>{n.title}</span>
                        {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-[#FF8A5B] shrink-0" />}
                      </div>
                      {n.message && (
                        <p className={cn("text-[11px] mt-0.5 line-clamp-2", isDark ? "text-white/40" : "text-gray-500")}>{n.message}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("text-[10px] flex items-center gap-1", isDark ? "text-white/25" : "text-gray-300")}>
                          {CATEGORY_ICONS[n.category] || CATEGORY_ICONS.system}
                          {n.category}
                        </span>
                        <span className={cn("text-[10px]", isDark ? "text-white/20" : "text-gray-300")}>{timeAgo(n.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
