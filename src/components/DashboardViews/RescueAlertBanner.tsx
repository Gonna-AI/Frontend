import { AlertTriangle, Sparkles, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { RescueOpportunity } from '../../types/rescuePlaybook';
import { formatInrCompact } from '../../services/rescuePlaybookService';

interface RescueAlertBannerProps {
  opportunities: RescueOpportunity[];
  isDark?: boolean;
  onDismiss: (opportunityId: string) => void;
  onOpenGraph?: () => void;
}

export default function RescueAlertBanner({
  opportunities,
  isDark = true,
  onDismiss,
  onOpenGraph,
}: RescueAlertBannerProps) {
  if (!opportunities.length) return null;

  return (
    <div className="sticky top-2 z-30 space-y-2">
      {opportunities.map((opportunity) => (
        <div
          key={opportunity.id}
          className={cn(
            'rounded-xl border px-4 py-3 shadow-sm backdrop-blur-sm',
            isDark
              ? 'border-orange-400/35 bg-orange-500/10 text-orange-100'
              : 'border-orange-200 bg-orange-50 text-orange-900',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <p className="text-sm font-semibold">
                  Rescue alert: {opportunity.generatedClusterName}
                </p>
              </div>
              <p className={cn('text-xs', isDark ? 'text-orange-100/85' : 'text-orange-900/85')}>
                Potential loss {formatInrCompact(opportunity.potentialLossInr)} · Risk {Math.round(opportunity.riskScore * 100)}% · Similarity {Math.round(opportunity.similarityScore * 100)}%
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {onOpenGraph && (
                  <button
                    onClick={onOpenGraph}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium',
                      isDark
                        ? 'border-white/20 bg-white/10 text-white hover:bg-white/15'
                        : 'border-black/15 bg-white text-black hover:bg-black/5',
                    )}
                  >
                    <Sparkles className="w-3 h-3" />
                    Open Customer Graph
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => onDismiss(opportunity.id)}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                isDark ? 'hover:bg-white/10' : 'hover:bg-black/5',
              )}
              aria-label="Dismiss rescue alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
