import React from "react";
import { AppNode, NodeStatus } from "../../types/bioflow";
import { DynamicIcon } from "./Icons";
import {
  X,
  Activity,
  Database,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

interface NodeInspectorProps {
  node: AppNode | null;
  onClose: () => void;
  isMobile?: boolean;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  onClose,
  isMobile = false,
}) => {
  if (!node) {
    // Desktop empty state
    if (!isMobile) {
      return (
        <div className="w-80 h-full bg-[#0a0a0a]/95 backdrop-blur-xl border-l border-white/10 flex flex-col items-center justify-center text-slate-500 z-20">
          <Activity className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-sm font-medium">Click a step to see details</p>
          <p className="text-xs text-slate-600 mt-1">View logs and data flow</p>
        </div>
      );
    }
    // Mobile: return null when no node selected
    return null;
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "trigger":
        return "Starting Point";
      case "agent":
        return "AI Processing";
      case "tool":
        return "External Service";
      case "action":
        return "Final Action";
      default:
        return "Step";
    }
  };

  const getStatusInfo = () => {
    if (node.data.status === NodeStatus.PROCESSING)
      return { text: "Processing...", color: "text-yellow-400" };
    if (node.data.status === NodeStatus.COMPLETED)
      return { text: "Completed", color: "text-emerald-400" };
    if (node.data.status === NodeStatus.ERROR)
      return { text: "Error", color: "text-red-400" };
    return { text: "Waiting", color: "text-slate-500" };
  };

  const statusInfo = getStatusInfo();

  // Mobile bottom sheet layout
  if (isMobile) {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-[#0a0a0a]/98 backdrop-blur-xl border-t border-white/10 rounded-t-2xl max-h-[60%] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black/30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <DynamicIcon
                name={node.data.icon}
                className="w-4 h-4 text-indigo-400"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {node.data.label}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">
                  {getCategoryLabel(node.data.category)}
                </span>
                <span className={`text-[10px] font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Activity Log */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <MessageSquare className="w-3 h-3" />
              Activity
            </div>
            <div className="bg-black/50 rounded-lg p-2 border border-white/10 max-h-[120px] overflow-y-auto text-[10px] space-y-1">
              {node.data.logs.length === 0 ? (
                <span className="text-slate-600 italic">
                  Waiting to start...
                </span>
              ) : (
                node.data.logs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span
                      className={
                        log.level === "success"
                          ? "text-emerald-400"
                          : "text-slate-300"
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              )}
              {node.data.status === NodeStatus.COMPLETED && (
                <div className="flex items-center gap-1.5 text-emerald-400 pt-1 border-t border-white/5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/30 p-2 rounded-lg border border-white/5 text-center">
              <div className="text-[9px] text-slate-500 uppercase">Model</div>
              <div className="text-[10px] text-white font-medium truncate">
                {node.data.metadata?.model || "N/A"}
              </div>
            </div>
            <div className="bg-slate-800/30 p-2 rounded-lg border border-white/5 text-center">
              <div className="text-[9px] text-slate-500 uppercase">Speed</div>
              <div className="text-[10px] text-white font-medium">
                {node.data.metadata?.executionTime || "-"}
              </div>
            </div>
            <div className="bg-slate-800/30 p-2 rounded-lg border border-white/5 text-center">
              <div className="text-[9px] text-slate-500 uppercase">
                Confidence
              </div>
              <div className="text-[10px] text-white font-medium">
                {node.data.metadata?.confidence
                  ? `${(node.data.metadata.confidence * 100).toFixed(0)}%`
                  : "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop sidebar layout
  return (
    <div className="w-72 h-full bg-[#0a0a0a]/95 backdrop-blur-xl border-l border-white/10 flex flex-col z-20 transition-all">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-start justify-between bg-black/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <DynamicIcon
              name={node.data.icon}
              className="w-4 h-4 text-indigo-400"
            />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">{node.data.label}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-white/10 text-slate-300">
                {getCategoryLabel(node.data.category)}
              </span>
              <span className={`text-[10px] font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Section: Activity Log */}
        <div className="p-3 border-b border-white/5">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <MessageSquare className="w-3 h-3" />
            Activity Log
          </div>
          <div className="bg-black/50 rounded-xl p-2 border border-white/10 min-h-[100px] text-[10px] space-y-1.5 overflow-hidden">
            {node.data.logs.length === 0 ? (
              <span className="text-slate-600 italic">Waiting to start...</span>
            ) : (
              node.data.logs.map((log, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-slate-600 shrink-0">
                    {log.timestamp}
                  </span>
                  <span
                    className={
                      log.level === "success"
                        ? "text-emerald-400"
                        : log.level === "warn"
                          ? "text-yellow-400"
                          : "text-slate-300"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))
            )}
            {node.data.status === NodeStatus.PROCESSING && (
              <div className="animate-pulse text-indigo-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              </div>
            )}
            {node.data.status === NodeStatus.COMPLETED && (
              <div className="flex items-center gap-2 text-emerald-400 pt-2 border-t border-white/5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Step completed</span>
              </div>
            )}
          </div>
        </div>

        {/* Section: Performance */}
        <div className="p-3 border-b border-white/5">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <Activity className="w-3 h-3" />
            Performance
          </div>
          <div className="grid grid-cols-2 gap-2">
            <MetricCard
              label="Model"
              value={node.data.metadata?.model || "N/A"}
            />
            <MetricCard
              label="Confidence"
              value={
                node.data.metadata?.confidence
                  ? `${(node.data.metadata.confidence * 100).toFixed(0)}%`
                  : "-"
              }
            />
            <MetricCard
              label="Speed"
              value={node.data.metadata?.executionTime || "-"}
            />
            <MetricCard
              label="Cost"
              value={node.data.metadata?.cost || "Free"}
            />
          </div>
        </div>

        {/* Section: Data Flow */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <Database className="w-3 h-3" />
            Data Flow
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-[9px] text-slate-500 mb-1 block uppercase tracking-wider">
                Input
              </span>
              <pre className="bg-slate-900/50 rounded-lg p-2 text-[9px] text-purple-300 overflow-x-auto border border-white/5">
                {Object.keys(node.data.inputs || {}).length > 0
                  ? JSON.stringify(node.data.inputs, null, 2)
                  : '{ "source": "previous step" }'}
              </pre>
            </div>
            {node.data.outputs && Object.keys(node.data.outputs).length > 0 && (
              <div>
                <span className="text-[9px] text-slate-500 mb-1 block uppercase tracking-wider">
                  Output
                </span>
                <pre className="bg-slate-900/50 rounded-lg p-2 text-[9px] text-emerald-300 overflow-x-auto border border-white/5">
                  {JSON.stringify(node.data.outputs, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="bg-slate-800/30 p-2 rounded-lg border border-white/5">
    <div className="text-[9px] text-slate-500 uppercase tracking-wider">
      {label}
    </div>
    <div className="text-[10px] text-white font-medium mt-0.5 truncate">
      {value}
    </div>
  </div>
);
