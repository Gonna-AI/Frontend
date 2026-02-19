import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Connection,
    addEdge,
    useNodesState,
    useEdgesState,
    ReactFlowProvider,
    OnSelectionChangeParams,
    MiniMap,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import GlassNode from './GlassNode';
import { NodeInspector } from './NodeInspector';
import { USE_CASES, UseCaseId } from './constants';
import { NodeStatus, LogEntry } from '../../types/bioflow';
import { Play, RotateCcw, Stethoscope, Utensils, Scale } from 'lucide-react';

const nodeTypes = {
    glass: GlassNode,
};

interface WorkflowEditorCoreProps {
    selectedUseCase: UseCaseId;
    onUseCaseChange: (id: UseCaseId) => void;
    showInspector?: boolean;
}

const WorkflowEditorCore = ({ selectedUseCase, onUseCaseChange, showInspector = true }: WorkflowEditorCoreProps) => {
    const useCase = USE_CASES[selectedUseCase];
    const [nodes, setNodes, onNodesChange] = useNodesState(useCase.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(useCase.edges);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Helper to find node by ID
    const getNode = (id: string) => nodes.find(n => n.id === id);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 1.5 }
        }, eds)),
        [setEdges]
    );

    const onSelectionChange = useCallback(({ nodes: selectedNodes }: OnSelectionChangeParams) => {
        setSelectedNodeId(selectedNodes.length > 0 ? selectedNodes[0].id : null);
    }, []);

    const resetSimulation = useCallback(() => {
        setIsRunning(false);
        setNodes(useCase.nodes.map((node) => ({
            ...node,
            data: {
                ...node.data,
                status: NodeStatus.IDLE,
                logs: []
            }
        })));
        // Disable animated edges on mobile for better performance
        setEdges(useCase.edges.map(e => ({
            ...e,
            animated: !isMobile,
            style: { ...e.style, opacity: 1 }
        })));
    }, [useCase, setNodes, setEdges, isMobile]);

    const switchUseCase = (id: UseCaseId) => {
        setIsRunning(false);
        setSelectedNodeId(null);
        const newUseCase = USE_CASES[id];
        setNodes(newUseCase.nodes);
        // Disable animated edges on mobile for better performance
        setEdges(newUseCase.edges.map(e => ({ ...e, animated: !isMobile })));
        onUseCaseChange(id);
    };

    const addLogToNode = (nodeId: string, message: string, level: 'info' | 'success' = 'info') => {
        setNodes(nds => nds.map(n => {
            if (n.id === nodeId) {
                const d = new Date();
                const newLog: LogEntry = {
                    timestamp: `${d.toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}`,
                    level,
                    message
                };
                return { ...n, data: { ...n.data, logs: [...n.data.logs, newLog] } };
            }
            return n;
        }));
    };

    const runSimulation = useCallback(async () => {
        if (isRunning) return;
        resetSimulation();
        setIsRunning(true);

        for (const stepNodes of useCase.trace) {
            setNodes((nds) => nds.map((n) => stepNodes.includes(n.id) ? { ...n, data: { ...n.data, status: NodeStatus.PROCESSING } } : n));
            setEdges((eds) => eds.map(e => stepNodes.includes(e.target) ? { ...e, style: { ...e.style, stroke: '#fbbf24', strokeWidth: 2 } } : e));

            const maxDuration = 1200;
            const steps = 3;

            for (let i = 0; i < steps; i++) {
                await new Promise(r => setTimeout(r, maxDuration / steps));
                stepNodes.forEach(id => {
                    const logMsg = useCase.logs[id]?.[i];
                    if (logMsg) addLogToNode(id, logMsg);
                });
            }

            setNodes((nds) => nds.map((n) => stepNodes.includes(n.id) ? { ...n, data: { ...n.data, status: NodeStatus.COMPLETED } } : n));
            setEdges((eds) => eds.map(e => stepNodes.includes(e.target) ? { ...e, animated: false, style: { ...e.style, stroke: '#10b981', strokeWidth: 1.5 } } : e));
        }

        setIsRunning(false);
    }, [useCase, isRunning, setNodes, setEdges, resetSimulation]);

    const getUseCaseIcon = (id: UseCaseId) => {
        switch (id) {
            case 'doctor': return <Stethoscope className="w-3.5 h-3.5" />;
            case 'restaurant': return <Utensils className="w-3.5 h-3.5" />;
            case 'legal': return <Scale className="w-3.5 h-3.5" />;
        }
    };

    const getUseCaseColor = (id: UseCaseId, isActive: boolean) => {
        const colors = {
            doctor: isActive ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-white/5 border-white/10 text-slate-400',
            restaurant: isActive ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-white/5 border-white/10 text-slate-400',
            legal: isActive ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400',
        };
        return colors[id];
    };

    return (
        <div className="flex w-full h-full bg-transparent relative overflow-hidden rounded-2xl border border-white/10">

            {/* Background Ambience - Only on desktop for performance */}
            {!isMobile && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[100px]" />
                </div>
            )}

            {/* Canvas */}
            <div className="flex-1 relative h-full z-10">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onSelectionChange={onSelectionChange}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.3, minZoom: 0.4, maxZoom: 1 }}
                    className="bg-transparent"
                    minZoom={0.1}
                    maxZoom={2}
                    proOptions={{ hideAttribution: true }}
                    defaultEdgeOptions={{
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
                    }}
                >
                    {!isMobile && (
                        <Background
                            color="#6366f1"
                            gap={25}
                            size={1}
                            className="opacity-[0.06]"
                        />
                    )}
                    <Controls
                        showInteractive={false}
                        className="!bg-[#0a0a0a]/80 !border-white/10 !backdrop-blur-md [&>button]:!fill-slate-400 hover:[&>button]:!fill-white !rounded-xl !left-auto !right-2 !bottom-2"
                    />
                    {!isMobile && (
                        <MiniMap
                            nodeColor={(n) => {
                                const data = n.data as any;
                                if (data.status === 'PROCESSING') return '#fbbf24';
                                if (data.status === 'COMPLETED') return '#10b981';
                                return '#334155';
                            }}
                            maskColor="rgba(10, 10, 10, 0.8)"
                            className="!bg-[#0a0a0a]/80 !border !border-white/10 !rounded-xl"
                        />
                    )}
                </ReactFlow>

                {/* HUD Controls */}
                <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10 flex flex-col gap-2 md:gap-3">
                    {/* Use Case Selector */}
                    <div className="flex items-center gap-1 p-0.5 md:p-1 bg-[#0a0a0a]/80 border border-white/10 rounded-lg md:rounded-xl backdrop-blur-md">
                        {Object.entries(USE_CASES).map(([id, uc]) => (
                            <button
                                key={id}
                                onClick={() => switchUseCase(id as UseCaseId)}
                                disabled={isRunning}
                                className={`
                  flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[10px] md:text-xs font-medium transition-all border
                  ${getUseCaseColor(id as UseCaseId, selectedUseCase === id)}
                  ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                            >
                                {getUseCaseIcon(id as UseCaseId)}
                                <span className="hidden sm:inline">{uc.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Run Controls */}
                    <div className="flex gap-1.5 md:gap-2">
                        <button
                            onClick={isRunning ? undefined : runSimulation}
                            disabled={isRunning}
                            className={`
                flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-medium transition-all border shadow-lg
                ${isRunning
                                    ? 'bg-[#0a0a0a]/90 border-slate-800 text-slate-600 cursor-not-allowed'
                                    : 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/30 hover:border-emerald-400 hover:text-white'
                                }
              `}
                        >
                            <Play className="w-3 h-3" />
                            <span>{isRunning ? 'Running...' : 'Run Demo'}</span>
                        </button>
                        <button
                            onClick={resetSimulation}
                            disabled={isRunning}
                            className="p-1.5 md:p-2 bg-[#0a0a0a]/80 border border-white/10 text-slate-400 hover:text-white hover:border-slate-600 rounded-lg md:rounded-xl transition-colors shadow-lg disabled:opacity-50"
                            aria-label="Reset Demo"
                        >
                            <RotateCcw className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Inspector - Desktop: sidebar, Mobile: bottom sheet */}
            {showInspector && (
                isMobile ? (
                    <NodeInspector
                        node={selectedNodeId ? getNode(selectedNodeId) || null : null}
                        onClose={() => setSelectedNodeId(null)}
                        isMobile={true}
                    />
                ) : (
                    <NodeInspector
                        node={selectedNodeId ? getNode(selectedNodeId) || null : null}
                        onClose={() => setSelectedNodeId(null)}
                        isMobile={false}
                    />
                )
            )}
        </div>
    );
};

interface WorkflowEditorProps {
    initialUseCase?: UseCaseId;
    showInspector?: boolean;
}

const WorkflowEditor = ({ initialUseCase = 'doctor', showInspector = true }: WorkflowEditorProps) => {
    const [selectedUseCase, setSelectedUseCase] = useState<UseCaseId>(initialUseCase);

    return (
        <ReactFlowProvider>
            <WorkflowEditorCore
                selectedUseCase={selectedUseCase}
                onUseCaseChange={setSelectedUseCase}
                showInspector={showInspector}
            />
        </ReactFlowProvider>
    );
};

export default WorkflowEditor;
