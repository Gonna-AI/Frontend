import { SystemMetrics } from "../../types/juris";
import { TrendingUp, Database, Zap, Network, Award, Clock } from "lucide-react";

interface JurisDashboardProps {
  metrics: SystemMetrics;
  onRefresh: () => void;
}

export default function JurisDashboard({
  metrics,
  onRefresh,
}: JurisDashboardProps) {
  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">System Metrics</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-purple-900/40 hover:bg-purple-800/50 border border-purple-600/30 hover:border-purple-500/50 text-purple-100 rounded-xl transition-all duration-300 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Precision Score */}
        <div className="p-6 bg-gradient-to-br from-purple-900/20 to-violet-900/20 border border-purple-500/20 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-medium text-white/60">Precision@5</h3>
          </div>
          <p className="text-3xl font-bold text-purple-300">
            {(metrics.precisionAt5 * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-white/40 mt-2">
            Industry leading accuracy
          </p>
        </div>

        {/* Response Time */}
        <div className="p-6 bg-gradient-to-br from-violet-900/20 to-purple-900/20 border border-violet-500/20 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-violet-500/20 rounded-xl">
              <Clock className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-sm font-medium text-white/60">
              Avg Response Time
            </h3>
          </div>
          <p className="text-3xl font-bold text-violet-300">
            {metrics.avgResponseTime.toFixed(1)}s
          </p>
          <p className="text-xs text-white/40 mt-2">
            Real-time search performance
          </p>
        </div>

        {/* Total Cases */}
        <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-sm font-medium text-white/60">Total Cases</h3>
          </div>
          <p className="text-3xl font-bold text-indigo-300">
            {metrics.totalCases.toLocaleString()}
          </p>
          <p className="text-xs text-white/40 mt-2">Indexed and searchable</p>
        </div>
      </div>

      {/* System Status */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-4">
            System Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Vector Store</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  metrics.vectorStoreStatus === "Active"
                    ? "bg-green-500/20 border border-green-500/30 text-green-400"
                    : "bg-red-500/20 border border-red-500/30 text-red-400"
                }`}
              >
                {metrics.vectorStoreStatus}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Graph Database</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  metrics.graphDbStatus === "Active"
                    ? "bg-green-500/20 border border-green-500/30 text-green-400"
                    : "bg-red-500/20 border border-red-500/30 text-red-400"
                }`}
              >
                {metrics.graphDbStatus}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-sm text-white/60">Last Indexed</span>
              <span className="text-sm text-white/80">
                {metrics.lastIndexed}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-4">
            Entity Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Cases</span>
              <span className="text-sm font-semibold text-purple-300">
                {metrics.entityCounts.cases.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Judges</span>
              <span className="text-sm font-semibold text-violet-300">
                {metrics.entityCounts.judges.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Courts</span>
              <span className="text-sm font-semibold text-indigo-300">
                {metrics.entityCounts.courts.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Statutes</span>
              <span className="text-sm font-semibold text-fuchsia-300">
                {metrics.entityCounts.statutes.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Sections</span>
              <span className="text-sm font-semibold text-pink-300">
                {metrics.entityCounts.sections.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Comparison */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">
            Multi-Modal Performance
          </h3>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <Network className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-white/60 mb-1">Vector Search</p>
            <p className="text-lg font-bold text-purple-300">87%</p>
          </div>
          <div className="text-center p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
            <Network className="w-6 h-6 text-violet-400 mx-auto mb-2" />
            <p className="text-xs text-white/60 mb-1">Graph Search</p>
            <p className="text-lg font-bold text-violet-300">82%</p>
          </div>
          <div className="text-center p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <Zap className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <p className="text-xs text-white/60 mb-1">Keyword Search</p>
            <p className="text-lg font-bold text-indigo-300">71%</p>
          </div>
          <div className="text-center p-4 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-xl">
            <Award className="w-6 h-6 text-fuchsia-400 mx-auto mb-2" />
            <p className="text-xs text-white/60 mb-1">Hybrid (All)</p>
            <p className="text-lg font-bold text-fuchsia-300">92%</p>
          </div>
        </div>
        <p className="text-xs text-white/40 text-center mt-4">
          Precision@5 scores across different search modalities
        </p>
      </div>
    </div>
  );
}
