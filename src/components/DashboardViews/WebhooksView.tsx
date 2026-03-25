import { useState, useEffect, useCallback } from 'react';
import {
  Webhook, Plus, Trash2, Send, Loader2, Check, X, Copy, Eye, EyeOff,
  ChevronDown, ChevronUp, AlertCircle, RefreshCw, Zap, Globe,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { supabase } from '../../config/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

interface WebhooksViewProps {
  isDark: boolean;
}

interface WebhookEntry {
  id: string;
  url: string;
  name: string;
  events: string[];
  secret: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DeliveryEntry {
  id: string;
  webhook_id: string;
  event: string;
  payload: Record<string, unknown>;
  status_code: number;
  response: string;
  success: boolean;
  attempted_at: string;
}

const EVENT_CATEGORIES: Record<string, { label: string; events: { value: string; label: string }[] }> = {
  calls: {
    label: 'Calls',
    events: [
      { value: 'call.started', label: 'Call Started' },
      { value: 'call.completed', label: 'Call Completed' },
      { value: 'call.failed', label: 'Call Failed' },
    ],
  },
  billing: {
    label: 'Billing',
    events: [
      { value: 'payment.success', label: 'Payment Success' },
      { value: 'payment.failed', label: 'Payment Failed' },
      { value: 'credit.low', label: 'Low Credits' },
      { value: 'credit.depleted', label: 'Credits Depleted' },
    ],
  },
  team: {
    label: 'Team',
    events: [
      { value: 'team.member_invited', label: 'Member Invited' },
      { value: 'team.member_removed', label: 'Member Removed' },
    ],
  },
  infrastructure: {
    label: 'Infrastructure',
    events: [
      { value: 'api_key.created', label: 'API Key Created' },
      { value: 'api_key.revoked', label: 'API Key Revoked' },
      { value: 'document.processed', label: 'Document Processed' },
      { value: 'document.failed', label: 'Document Failed' },
      { value: 'rescue.triggered', label: 'Rescue Triggered' },
      { value: 'rescue.completed', label: 'Rescue Completed' },
    ],
  },
};

export default function WebhooksView({ isDark }: WebhooksViewProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryEntry[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  // Create form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [createdSecret, setCreatedSecret] = useState('');

  const apiCall = useCallback(async (path: string, options?: RequestInit) => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) throw new Error('No session');
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-webhooks/${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options?.headers || {}) },
    });
    return res.json();
  }, []);

  const fetchWebhooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiCall('');
      setWebhooks(data.webhooks || []);
    } catch (err) {
      console.error('[WebhooksView] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => { fetchWebhooks(); }, [fetchWebhooks]);

  const fetchDeliveries = async (webhookId: string) => {
    setLoadingDeliveries(true);
    try {
      const data = await apiCall(`deliveries?webhook_id=${webhookId}`);
      setDeliveries(data.deliveries || []);
    } catch (err) {
      console.error('[WebhooksView] deliveries error:', err);
    } finally {
      setLoadingDeliveries(false);
    }
  };

  const handleCreate = async () => {
    if (!formName || !formUrl || formEvents.length === 0) return;
    setCreating(true);
    try {
      const data = await apiCall('', {
        method: 'POST',
        body: JSON.stringify({ name: formName, url: formUrl, events: formEvents }),
      });
      if (data.webhook) {
        setCreatedSecret(data.webhook.secret);
        setWebhooks(prev => [data.webhook, ...prev]);
        setFormName('');
        setFormUrl('');
        setFormEvents([]);
      }
    } catch (err) {
      console.error('[WebhooksView] create error:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiCall(`?id=${id}`, { method: 'DELETE' });
      setWebhooks(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      console.error('[WebhooksView] delete error:', err);
    }
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    setTestResult(null);
    try {
      const data = await apiCall('test', { method: 'POST', body: JSON.stringify({ id }) });
      setTestResult({ id, success: data.success, message: data.success ? `Status ${data.status_code}` : data.response?.substring(0, 100) || 'Failed' });
    } catch (err) {
      setTestResult({ id, success: false, message: 'Network error' });
    } finally {
      setTesting(null);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await apiCall('', { method: 'PUT', body: JSON.stringify({ id, is_active: !isActive }) });
      setWebhooks(prev => prev.map(w => w.id === id ? { ...w, is_active: !isActive } : w));
    } catch (err) {
      console.error('[WebhooksView] toggle error:', err);
    }
  };

  const toggleEvent = (event: string) => {
    setFormEvents(prev => prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className={cn("text-2xl font-bold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
            {t('webhooks.title') || 'Webhooks'}
          </h2>
          <p className={cn("text-sm mt-1", isDark ? "text-white/50" : "text-gray-500")}>
            {t('webhooks.subtitle') || 'Push real-time events to your applications'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchWebhooks}
            className={cn("p-2 rounded-lg border transition-colors", isDark ? "border-white/10 hover:bg-white/5 text-white/60" : "border-gray-200 hover:bg-gray-50 text-gray-500")}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setShowCreate(!showCreate); setCreatedSecret(''); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" /> Add Webhook
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className={cn("p-4 sm:p-6 rounded-2xl border space-y-4", isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10")}>
          <h3 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>New Webhook</h3>

          {createdSecret ? (
            <div className={cn("p-4 rounded-xl border border-emerald-500/20", isDark ? "bg-emerald-500/[0.05]" : "bg-emerald-50")}>
              <p className="text-sm text-emerald-500 font-medium mb-2">Webhook created! Save your signing secret:</p>
              <div className={cn("flex items-center gap-2 p-2 rounded-lg font-mono text-xs", isDark ? "bg-black/30" : "bg-white")}>
                <code className={cn("flex-1 break-all", isDark ? "text-white" : "text-gray-900")}>{createdSecret}</code>
                <button onClick={() => navigator.clipboard.writeText(createdSecret)} className="shrink-0 p-1 hover:bg-white/10 rounded">
                  <Copy className="w-3.5 h-3.5 text-emerald-500" />
                </button>
              </div>
              <p className={cn("text-xs mt-2", isDark ? "text-white/40" : "text-gray-500")}>This secret won't be shown again.</p>
              <button onClick={() => { setShowCreate(false); setCreatedSecret(''); }} className="mt-3 text-sm text-emerald-500 font-medium hover:text-emerald-400">Done</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={cn("block text-xs font-medium mb-1", isDark ? "text-white/60" : "text-gray-500")}>Name</label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Slack Notifications"
                    className={cn("w-full px-3 py-2 rounded-lg border text-sm", isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900")}
                  />
                </div>
                <div>
                  <label className={cn("block text-xs font-medium mb-1", isDark ? "text-white/60" : "text-gray-500")}>Endpoint URL</label>
                  <input
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://your-server.com/webhooks"
                    className={cn("w-full px-3 py-2 rounded-lg border text-sm", isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900")}
                  />
                </div>
              </div>

              {/* Event Selection */}
              <div>
                <label className={cn("block text-xs font-medium mb-2", isDark ? "text-white/60" : "text-gray-500")}>Events ({formEvents.length} selected)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(EVENT_CATEGORIES).map(([catKey, cat]) => (
                    <div key={catKey}>
                      <p className={cn("text-xs font-semibold mb-1.5", isDark ? "text-white/50" : "text-gray-500")}>{cat.label}</p>
                      <div className="space-y-1">
                        {cat.events.map((ev) => (
                          <button
                            key={ev.value}
                            onClick={() => toggleEvent(ev.value)}
                            className={cn(
                              "w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors",
                              formEvents.includes(ev.value)
                                ? isDark ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-purple-50 text-purple-700 border border-purple-200"
                                : isDark ? "hover:bg-white/5 text-white/60" : "hover:bg-gray-50 text-gray-600"
                            )}
                          >
                            {formEvents.includes(ev.value) && <Check className="w-3 h-3 inline mr-1" />}
                            {ev.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setShowCreate(false)} className={cn("px-4 py-2 rounded-lg text-sm", isDark ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-700")}>
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !formName || !formUrl || formEvents.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition-colors"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Create Webhook
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Webhooks List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className={cn("w-6 h-6 animate-spin", isDark ? "text-purple-400" : "text-purple-600")} />
        </div>
      ) : webhooks.length === 0 ? (
        <div className={cn("text-center py-20 rounded-2xl border", isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10")}>
          <Globe className={cn("w-10 h-10 mx-auto mb-3", isDark ? "text-white/20" : "text-gray-300")} />
          <p className={cn("text-sm font-medium", isDark ? "text-white/50" : "text-gray-500")}>No webhooks configured</p>
          <p className={cn("text-xs mt-1", isDark ? "text-white/30" : "text-gray-400")}>Create one to start receiving events</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div key={wh.id} className={cn("rounded-2xl border overflow-hidden", isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10")}>
              <div className="p-4 flex items-center gap-4">
                {/* Status */}
                <button
                  onClick={() => handleToggle(wh.id, wh.is_active)}
                  className={cn("w-2.5 h-2.5 rounded-full shrink-0 transition-colors", wh.is_active ? "bg-emerald-500" : "bg-gray-500")}
                  title={wh.is_active ? 'Active' : 'Inactive'}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>{wh.name}</span>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded-md", wh.is_active ? "bg-emerald-500/10 text-emerald-500" : isDark ? "bg-white/5 text-white/40" : "bg-gray-100 text-gray-400")}>
                      {wh.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className={cn("text-xs truncate mt-0.5", isDark ? "text-white/40" : "text-gray-400")}>{wh.url}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {wh.events.slice(0, 4).map(ev => (
                      <span key={ev} className={cn("text-xs px-1.5 py-0.5 rounded-md", isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-gray-500")}>{ev}</span>
                    ))}
                    {wh.events.length > 4 && (
                      <span className={cn("text-xs px-1.5 py-0.5 rounded-md", isDark ? "bg-white/5 text-white/30" : "bg-gray-100 text-gray-400")}>+{wh.events.length - 4}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleTest(wh.id)}
                    disabled={testing === wh.id}
                    className={cn("p-1.5 rounded-lg transition-colors", isDark ? "hover:bg-white/5 text-white/40 hover:text-white" : "hover:bg-gray-50 text-gray-400 hover:text-gray-600")}
                    title="Send test"
                  >
                    {testing === wh.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setExpandedId(expandedId === wh.id ? null : wh.id); if (expandedId !== wh.id) fetchDeliveries(wh.id); }}
                    className={cn("p-1.5 rounded-lg transition-colors", isDark ? "hover:bg-white/5 text-white/40 hover:text-white" : "hover:bg-gray-50 text-gray-400 hover:text-gray-600")}
                    title="Delivery log"
                  >
                    {expandedId === wh.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(wh.id)}
                    className={cn("p-1.5 rounded-lg transition-colors", isDark ? "hover:bg-red-500/10 text-white/40 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500")}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Test result */}
              {testResult && testResult.id === wh.id && (
                <div className={cn("px-4 pb-3", testResult.success ? "text-emerald-500" : "text-red-500")}>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    {testResult.success ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    Test {testResult.success ? 'succeeded' : 'failed'}: {testResult.message}
                  </div>
                </div>
              )}

              {/* Delivery Log */}
              {expandedId === wh.id && (
                <div className={cn("border-t", isDark ? "border-white/5" : "border-gray-100")}>
                  {loadingDeliveries ? (
                    <div className="p-4 text-center">
                      <Loader2 className={cn("w-4 h-4 animate-spin mx-auto", isDark ? "text-white/30" : "text-gray-400")} />
                    </div>
                  ) : deliveries.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className={cn("text-xs", isDark ? "text-white/30" : "text-gray-400")}>No deliveries yet</p>
                    </div>
                  ) : (
                    <div className={cn("divide-y max-h-[300px] overflow-y-auto", isDark ? "divide-white/5" : "divide-gray-100")}>
                      {deliveries.map(d => (
                        <div key={d.id} className="px-4 py-2.5 flex items-center gap-3 text-xs">
                          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", d.success ? "bg-emerald-500" : "bg-red-500")} />
                          <span className={cn("font-mono", isDark ? "text-white/60" : "text-gray-600")}>{d.event}</span>
                          <span className={cn(isDark ? "text-white/30" : "text-gray-400")}>
                            {d.status_code ? `HTTP ${d.status_code}` : 'Error'}
                          </span>
                          <span className={cn("ml-auto", isDark ? "text-white/20" : "text-gray-300")}>
                            {new Date(d.attempted_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
