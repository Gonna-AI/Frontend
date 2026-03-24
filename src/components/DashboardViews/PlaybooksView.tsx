import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Calendar, Wand2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface Playbook {
  id: string;
  name: string;
  description: string;
  trigger_keywords: string[];
  recommended_actions: string[];
  success_indicators: string[];
  created_at: string;
  confidence_score: number;
}

export default function PlaybooksView({ isDark = true }: { isDark?: boolean }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const playbooksBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/playbooks`;

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    };
  };

  const loadPlaybooks = async () => {
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(playbooksBase, { headers });
      const result = await res.json();
      if (res.ok && result.playbooks) {
        setPlaybooks(result.playbooks);
      }
    } catch (err) {
      setError('Failed to load playbooks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePlaybooks = async () => {
    if (!dateRange.start || !dateRange.end) {
      setError('Select both start and end dates');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(playbooksBase, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          start_date: dateRange.start,
          end_date: dateRange.end,
        }),
      });

      const result = await res.json();
      if (res.ok && result.templates) {
        setPlaybooks(result.templates);
        setDateRange({ start: '', end: '' });
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
    if (!confirm('Delete this playbook?')) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${playbooksBase}?id=${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        setPlaybooks(playbooks.filter(p => p.id !== id));
      }
    } catch (err) {
      setError('Failed to delete playbook');
      console.error(err);
    }
  };

  useEffect(() => {
    loadPlaybooks();
  }, []);

  return (
    <div className={cn(
      "p-6 rounded-xl border",
      isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10"
    )}>
      <div className="mb-6">
        <h2 className={cn("text-xl font-semibold mb-2", isDark ? "text-white" : "text-black")}>
          AI Playbook Templates
        </h2>
        <p className={cn("text-sm", isDark ? "text-white/60" : "text-gray-600")}>
          Analyze your call history and generate playbook templates with AI
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className={cn(
          "p-4 rounded-lg flex gap-3 mb-4",
          isDark ? "bg-red-500/10 border border-red-500/30" : "bg-red-50 border border-red-200"
        )}>
          <AlertCircle className={cn("w-5 h-5 flex-shrink-0", isDark ? "text-red-400" : "text-red-600")} />
          <p className={cn("text-sm", isDark ? "text-red-400" : "text-red-700")}>{error}</p>
        </div>
      )}

      {/* Date Range Picker */}
      <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
        <label className={cn("text-sm font-medium block mb-3", isDark ? "text-white/80" : "text-gray-700")}>
          Select Date Range for Analysis
        </label>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className={cn(
              "flex-1 px-3 py-2 rounded border text-sm",
              isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-black"
            )}
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className={cn(
              "flex-1 px-3 py-2 rounded border text-sm",
              isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-black"
            )}
          />
        </div>
        <button
          onClick={generatePlaybooks}
          disabled={isGenerating || !dateRange.start || !dateRange.end}
          className={cn(
            "w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors",
            isGenerating || !dateRange.start || !dateRange.end
              ? (isDark ? "bg-white/10 text-white/50 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed")
              : "bg-[#FF8A5B] hover:bg-[#FF9E6C] text-white"
          )}
        >
          {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
          <Wand2 className="w-4 h-4" />
          Generate Playbooks
        </button>
      </div>

      {/* Playbooks List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className={cn("w-6 h-6 animate-spin", isDark ? "text-white/40" : "text-gray-400")} />
        </div>
      ) : playbooks.length === 0 ? (
        <div className="text-center py-8">
          <p className={cn("text-sm", isDark ? "text-white/60" : "text-gray-600")}>
            No playbooks yet. Select a date range and generate from your call history.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {playbooks.map((playbook) => (
            <div
              key={playbook.id}
              className={cn(
                "p-4 rounded-lg border",
                isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className={cn("font-semibold", isDark ? "text-white" : "text-black")}>
                    {playbook.name}
                  </h3>
                  <p className={cn("text-xs mt-1", isDark ? "text-white/60" : "text-gray-600")}>
                    {playbook.description}
                  </p>
                </div>
                <button
                  onClick={() => deletePlaybook(playbook.id)}
                  className={cn(
                    "p-2 rounded transition-colors",
                    isDark ? "hover:bg-red-500/10 text-white/40 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-600"
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className={cn("font-medium mb-1", isDark ? "text-white/60" : "text-gray-600")}>
                    Triggers
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {playbook.trigger_keywords.map((k) => (
                      <span
                        key={k}
                        className={cn(
                          "px-2 py-0.5 rounded",
                          isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                        )}
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={cn("font-medium mb-1", isDark ? "text-white/60" : "text-gray-600")}>
                    Actions
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {playbook.recommended_actions.slice(0, 3).map((a) => (
                      <span
                        key={a}
                        className={cn(
                          "px-2 py-0.5 rounded",
                          isDark ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"
                        )}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
