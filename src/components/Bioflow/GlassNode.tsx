import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData, NodeStatus } from '../../types/bioflow';
import { DynamicIcon } from './Icons';
import { Loader2, Clock, Sparkles } from 'lucide-react';

const GlassNode = ({ data, selected }: NodeProps<NodeData>) => {
    const isProcessing = data.status === NodeStatus.PROCESSING;
    const isCompleted = data.status === NodeStatus.COMPLETED;
    const isError = data.status === NodeStatus.ERROR;

    // Color Schemes based on node type
    const getScheme = () => {
        switch (data.category) {
            case 'trigger': return { base: 'border-fuchsia-500/30', text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/5', label: 'Start' };
            case 'agent': return { base: 'border-indigo-500/30', text: 'text-indigo-400', bg: 'bg-indigo-500/5', label: 'AI' };
            case 'tool': return { base: 'border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-500/5', label: 'Tool' };
            case 'action': return { base: 'border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/5', label: 'Action' };
            default: return { base: 'border-slate-500/30', text: 'text-slate-400', bg: 'bg-slate-500/5', label: 'Step' };
        }
    };

    const scheme = getScheme();

    // Status Indicator logic
    const getStatusInfo = () => {
        if (isProcessing) return { color: 'bg-yellow-400 animate-pulse', text: 'Processing...' };
        if (isCompleted) return { color: 'bg-emerald-400', text: 'Completed' };
        if (isError) return { color: 'bg-red-500', text: 'Error' };
        return { color: 'bg-slate-600', text: 'Ready' };
    };

    const statusInfo = getStatusInfo();

    return (
        <div className={`
      relative group w-[320px] rounded-xl backdrop-blur-xl transition-all duration-300
      border ${isProcessing ? 'border-yellow-400/50' : selected ? 'border-indigo-400/60' : scheme.base}
      bg-[#0a0a0a]/90
      hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]
      ${selected ? 'shadow-[0_0_25px_-5px_rgba(99,102,241,0.4)]' : ''}
    `}>
            {/* Header Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02] rounded-t-xl">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
                    <span className={`text-[10px] font-medium uppercase tracking-wider ${scheme.text}`}>
                        {scheme.label}
                    </span>
                </div>
                <span className="text-[10px] text-slate-500">
                    {statusInfo.text}
                </span>
            </div>

            {/* Main Body */}
            <div className="p-4 flex gap-4">
                {/* Icon Box */}
                <div className={`
            flex items-center justify-center w-12 h-12 rounded-xl border 
            bg-gradient-to-br from-[#0a0a0a] to-slate-900/50
            ${scheme.base} ${scheme.text}
         `}>
                    {isProcessing ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <DynamicIcon name={data.icon} className="w-6 h-6" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-semibold ${scheme.text}`}>
                        {data.label}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {data.subline}
                    </p>

                    {/* Metrics */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-dashed border-white/10">
                        {data.metadata?.executionTime && (
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-slate-600" />
                                <span className="text-[10px] text-slate-400">{data.metadata.executionTime}</span>
                            </div>
                        )}
                        {data.metadata?.model && (
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-slate-600" />
                                <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{data.metadata.model}</span>
                            </div>
                        )}
                        {data.metadata?.confidence && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-emerald-400">{Math.round(data.metadata.confidence * 100)}% sure</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* IO Footer */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 border-t border-white/5 rounded-b-xl">
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                    <span className="text-[9px] text-slate-500">Receives: {data.inputType || 'Start'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-500">Outputs: {data.outputType || 'Done'}</span>
                    <div className={`w-1 h-1 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                </div>
            </div>

            {/* Progress Line */}
            {isProcessing && (
                <div className="absolute bottom-0 left-0 h-[2px] bg-yellow-400/20 w-full overflow-hidden rounded-b-xl">
                    <div className="h-full bg-yellow-400 w-1/3 animate-[loading_1s_linear_infinite]" />
                </div>
            )}

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                className="!w-2 !h-4 !rounded-sm !bg-slate-700 !border-none !-ml-[5px] transition-colors hover:!bg-indigo-400"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="!w-2 !h-4 !rounded-sm !bg-slate-700 !border-none !-mr-[5px] transition-colors hover:!bg-indigo-400"
            />
        </div>
    );
};

// Custom comparison function to prevent re-renders when only logs change
function arePropsEqual(prevProps: NodeProps<NodeData>, nextProps: NodeProps<NodeData>) {
    return (
        prevProps.selected === nextProps.selected &&
        prevProps.data.status === nextProps.data.status &&
        prevProps.data.label === nextProps.data.label &&
        prevProps.data.category === nextProps.data.category &&
        prevProps.data.icon === nextProps.data.icon &&
        prevProps.data.inputType === nextProps.data.inputType &&
        prevProps.data.outputType === nextProps.data.outputType &&
        prevProps.data.metadata?.executionTime === nextProps.data.metadata?.executionTime &&
        prevProps.data.metadata?.model === nextProps.data.metadata?.model
    );
}

export default memo(GlassNode, arePropsEqual);
