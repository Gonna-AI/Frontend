import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Wand2, Trash2, Loader2, AlertCircle, CheckCircle2, ArrowRight, BarChart2 } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface PlaybookTemplate {
  id: string;
  name: string;
  description: string;
  trigger_keywords: string[];
  recommended_actions: string[];
  success_indicators: string[];
  created_at: string;
  confidence_score: number;
}

function getPresetRange(preset: 'week' | 'month' | 'year') {
  const end = new Date();
  const start = new Date();
  if (preset === 'week') start.setDate(end.getDate() - 7);
  else if (preset === 'month') start.setMonth(end.getMonth() - 1);
  else start.setFullYear(end.getFullYear() - 1);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { start: fmt(start), end: fmt(end) };
}

export default function PlaybooksView({ isDark = true }: { isDark?: boolean }) {
  const { user } = useAuth();
  const [playbooks, setPlaybooks] = useState<PlaybookTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activePreset, setActivePreset] = useState<'week' | 'month' | 'year' | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [promotedIds, setPromotedIds] = useState<Set<string>>(new Set());
  const [callCount, setCallCount] = useState<number | null>(null);

  const playbooksBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/playbooks`;
  const rescueBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-rescue-playbooks/playbooks`;

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    };
  };

  const loadPlaybooks = async () => {
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(playbooksBase, { headers });
      const result = await res.json();
      if (res.ok && result.playbooks) setPlaybooks(result.playbooks);
    } catch (err) {
      setError('Failed to load playbooks');
    } finally {
      setIsLoading(false);
    }
  };

  const selectPreset = (preset: 'week' | 'month' | 'year') => {
    setActivePreset(preset);
    setDateRange(getPresetRange(preset));
  };

  const generatePlaybooks = async () => {
    if (!dateRange.start || !dateRange.end) {
      setError('Select a date range or a preset');
      return;
    }
    setIsGenerating(true);
    setError(null);
    setCallCount(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(playbooksBase, {
        method: 'POST',
        headers,
        body: JSON.stringify({ start_date: dateRange.start, end_date: dateRange.end }),
      });
      const result = await res.json();
      if (res.ok && result.playbooks) {
        setPlaybooks(prev => [...result.playbooks, ...prev]);
        setCallCount(result.call_count ?? null);
        setDateRange({ start: '', end: '' });
        setActivePreset(null);
      } else {
        setError(result.error || 'Failed to generate playbooks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsGenerating(false);
    }
  };

  const deletePlaybook = async (id: string) => {
    if (!confirm('Delete this playbook template?')) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${playbooksBase}?id=${id}`, { method: 'DELETE', headers });
      if (res.ok) setPlaybooks(playbooks.filter(p => p.id !== id));
    } catch {
      setError('Failed to delete playbook');
    }
  };

  // Promote AI template → rescue_playbooks so it appears in CustomerGraph's Create Action
  const promoteToRescue = async (pb: PlaybookTemplate) => {
    setPromotingId(pb.id);
    try {
      const headers = await getAuthHeaders();
      const rescuePlaybook = {
        id: `ai-${pb.id}`,
        name: pb.name,
        description: pb.description,
        channels: ['email', 'in_app'],
        message_template: pb.recommended_actions.join(' → '),
        voice_script: pb.recommended_actions[0] || pb.description,
        credit_amount_inr: 0,
        discount_percent: 0,
        success_criteria: pb.success_indicators.join('; '),
        enabled: true,
        ab_test_enabled: false,
        versions: [],
      };
      const res = await fetch(rescueBase, {
        method: 'POST',
        headers,
        body: JSON.stringify({ playbook: rescuePlaybook }),
      });
      if (res.ok) {
        setPromotedIds(prev => new Set([...prev, pb.id]));
      } else {
        const r = await res.json();
        setError(r.error || 'Failed to add to rescue templates');
      }
    } catch {
      setError('Failed to add to rescue templates');
    } finally {
      setPromotingId(null);
    }
  };

  useEffect(() => { loadPlaybooks(); }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={cn('text-2xl font-bold tracking-tight', isDark ? 'text-white' : 'text-gray-900')}>
          AI Playbook Templates
        </h2>
        <p className={cn('text-sm mt-1', isDark ? 'text-white/50' : 'text-gray-500')}>
          Analyze call history and generate reusable rescue playbooks with AI. Add them to Customer Graph for one-click actions.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className={cn('p-4 rounded-xl flex gap-3', isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200')}>
          <AlertCircle className={cn('w-5 h-5 shrink-0 mt-0.5', isDark ? 'text-red-400' : 'text-red-600')} />
          <p className={cn('text-sm', isDark ? 'text-red-400' : 'text-red-700')}>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Generation Panel */}
      <div className={cn('rounded-2xl border p-5', isDark ? 'bg-[#09090B] border-white/10' : 'bg-white border-black/10')}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className={cn('w-4 h-4', isDark ? 'text-purple-400' : 'text-purple-600')} />
          <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-gray-900')}>
            Analyze Call History
          </p>
        </div>

        {/* Preset buttons */}
        <div className="flex gap-2 mb-4">
          {(['week', 'month', 'year'] as const).map(preset => (
            <button
              key={preset}
              onClick={() => selectPreset(preset)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize',
                activePreset === preset
                  ? (isDark ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-purple-50 border-purple-300 text-purple-700')
                  : (isDark ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-gray-200 text-gray-600 hover:bg-gray-50')
              )}
            >
              {preset === 'week' ? 'Last Week' : preset === 'month' ? 'Last Month' : 'Last Year'}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        <div className="flex gap-3 mb-4">
          <input
            type="date"
            value={dateRange.start}
            onChange={e => { setDateRange({ ...dateRange, start: e.target.value }); setActivePreset(null); }}
            className={cn('flex-1 px-3 py-2 rounded-lg border text-sm', isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-black')}
          />
          <span className={cn('self-center text-xs', isDark ? 'text-white/30' : 'text-gray-400')}>to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={e => { setDateRange({ ...dateRange, end: e.target.value }); setActivePreset(null); }}
            className={cn('flex-1 px-3 py-2 rounded-lg border text-sm', isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-black')}
          />
        </div>

        <button
          onClick={generatePlaybooks}
          disabled={isGenerating || (!dateRange.start || !dateRange.end)}
          className={cn(
            'w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors',
            isGenerating || (!dateRange.start || !dateRange.end)
              ? (isDark ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
              : (isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white')
          )}
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {isGenerating ? 'Analyzing calls…' : 'Generate with AI'}
        </button>

        {callCount !== null && (
          <p className={cn('text-xs text-center mt-2', isDark ? 'text-white/30' : 'text-gray-400')}>
            Analyzed {callCount} calls
          </p>
        )}
      </div>

      {/* Playbooks List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className={cn('w-6 h-6 animate-spin', isDark ? 'text-white/30' : 'text-gray-400')} />
        </div>
      ) : playbooks.length === 0 ? (
        <div className={cn('text-center py-16 rounded-2xl border', isDark ? 'bg-[#09090B] border-white/10' : 'bg-white border-black/10')}>
          <Wand2 className={cn('w-10 h-10 mx-auto mb-3', isDark ? 'text-white/15' : 'text-gray-300')} />
          <p className={cn('text-sm font-medium', isDark ? 'text-white/40' : 'text-gray-500')}>No templates yet</p>
          <p className={cn('text-xs mt-1', isDark ? 'text-white/25' : 'text-gray-400')}>Select a date range above and generate from your call history</p>
        </div>
      ) : (
        <div className="space-y-3">
          {playbooks.map(pb => (
            <div
              key={pb.id}
              className={cn('rounded-2xl border p-5', isDark ? 'bg-[#09090B] border-white/10' : 'bg-white border-black/10')}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className={cn('font-semibold text-sm', isDark ? 'text-white' : 'text-gray-900')}>{pb.name}</h3>
                  <p className={cn('text-xs mt-1', isDark ? 'text-white/50' : 'text-gray-500')}>{pb.description}</p>
                </div>
                <div className="flex items-center gap-1.5 ml-3 shrink-0">
                  {promotedIds.has(pb.id) ? (
                    <span className={cn('flex items-center gap-1 text-xs px-2 py-1 rounded-lg', isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600')}>
                      <CheckCircle2 className="w-3 h-3" /> Added to Rescue
                    </span>
                  ) : (
                    <button
                      onClick={() => promoteToRescue(pb)}
                      disabled={promotingId === pb.id}
                      className={cn(
                        'flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors',
                        isDark
                          ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'
                          : 'border-cyan-300 text-cyan-600 hover:bg-cyan-50'
                      )}
                    >
                      {promotingId === pb.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                      Use in Rescue
                    </button>
                  )}
                  <button
                    onClick={() => deletePlaybook(pb.id)}
                    className={cn('p-1.5 rounded-lg transition-colors', isDark ? 'hover:bg-red-500/10 text-white/30 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className={cn('text-[10px] font-semibold uppercase tracking-wider mb-1.5', isDark ? 'text-white/30' : 'text-gray-400')}>Triggers</p>
                  <div className="flex flex-wrap gap-1">
                    {pb.trigger_keywords.map(k => (
                      <span key={k} className={cn('px-2 py-0.5 rounded-full text-[11px]', isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600')}>
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={cn('text-[10px] font-semibold uppercase tracking-wider mb-1.5', isDark ? 'text-white/30' : 'text-gray-400')}>Actions</p>
                  <ul className="space-y-0.5">
                    {pb.recommended_actions.slice(0, 3).map(a => (
                      <li key={a} className={cn('text-[11px]', isDark ? 'text-white/60' : 'text-gray-600')}>• {a}</li>
                    ))}
                    {pb.recommended_actions.length > 3 && (
                      <li className={cn('text-[11px]', isDark ? 'text-white/30' : 'text-gray-400')}>+{pb.recommended_actions.length - 3} more</li>
                    )}
                  </ul>
                </div>
                <div>
                  <p className={cn('text-[10px] font-semibold uppercase tracking-wider mb-1.5', isDark ? 'text-white/30' : 'text-gray-400')}>Success indicators</p>
                  <ul className="space-y-0.5">
                    {pb.success_indicators.slice(0, 2).map(s => (
                      <li key={s} className={cn('text-[11px]', isDark ? 'text-white/60' : 'text-gray-600')}>• {s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
