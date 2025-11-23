import { useState, useRef, useEffect } from 'react';
import { Scale, FileText, Building2, User, BookOpen, Hash } from 'lucide-react';
import * as d3 from 'd3-force';

interface Node extends d3.SimulationNodeDatum {
    id: string;
    type: 'case' | 'statute' | 'case_type' | 'court' | 'judge' | 'concept';
    label: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
    source: Node | string;
    target: Node | string;
}

interface KnowledgeGraphProps {
    caseData: any;
}

export default function KnowledgeGraph({ caseData }: KnowledgeGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);
    const draggedNodeRef = useRef<Node | null>(null);

    const width = 800;
    const height = 500;

    useEffect(() => {
        // Create nodes for this specific case
        const caseNode: Node = {
            id: 'case',
            type: 'case',
            label: caseData.title.split(' ').slice(0, 4).join(' ') + '...'
        };

        const newNodes: Node[] = [caseNode];
        const newLinks: Link[] = [];

        // Add statute nodes
        caseData.metadata.statutes_cited.slice(0, 3).forEach((statute: string, idx: number) => {
            const node: Node = {
                id: `statute-${idx}`,
                type: 'statute',
                label: statute.split(' ').slice(0, 3).join(' ')
            };
            newNodes.push(node);
            newLinks.push({ source: 'case', target: node.id });
        });

        // Add court node
        const courtNode: Node = {
            id: 'court',
            type: 'court',
            label: caseData.court.split(' ').slice(0, 2).join(' ')
        };
        newNodes.push(courtNode);
        newLinks.push({ source: 'case', target: 'court' });

        // Add judge node
        const judgeNode: Node = {
            id: 'judge',
            type: 'judge',
            label: caseData.judge.split(' ').slice(-2).join(' ')
        };
        newNodes.push(judgeNode);
        newLinks.push({ source: 'case', target: 'judge' });

        // Add case type
        const typeNode: Node = {
            id: 'type',
            type: 'case_type',
            label: caseData.metadata.jurisdiction
        };
        newNodes.push(typeNode);
        newLinks.push({ source: 'case', target: 'type' });

        // Add concepts
        ['Facts', 'Holding', 'Precedents'].forEach((concept, idx) => {
            const node: Node = {
                id: `concept-${idx}`,
                type: 'concept',
                label: concept
            };
            newNodes.push(node);
            newLinks.push({ source: 'case', target: node.id });
        });

        setNodes(newNodes);
        setLinks(newLinks);

        // Create D3 force simulation
        const simulation = d3.forceSimulation<Node>(newNodes)
            .force('link', d3.forceLink<Node, Link>(newLinks)
                .id(d => d.id)
                .distance(150)
                .strength(0.5))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(40))
            .alphaDecay(0.02)
            .velocityDecay(0.3);

        simulation.on('tick', () => {
            setNodes([...newNodes]);
            setLinks([...newLinks]);
        });

        simulationRef.current = simulation;

        return () => {
            simulation.stop();
        };
    }, [caseData]);

    const handleMouseDown = (node: Node, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        draggedNodeRef.current = node;

        if (simulationRef.current) {
            simulationRef.current.alphaTarget(0.3).restart();
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggedNodeRef.current || !svgRef.current || !simulationRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        draggedNodeRef.current.fx = x;
        draggedNodeRef.current.fy = y;

        simulationRef.current.alpha(0.3).restart();
    };

    const handleMouseUp = () => {
        if (draggedNodeRef.current) {
            draggedNodeRef.current.fx = null;
            draggedNodeRef.current.fy = null;
            draggedNodeRef.current = null;
        }

        if (simulationRef.current) {
            simulationRef.current.alphaTarget(0);
        }
    };

    const getNodeColor = (type: string) => {
        switch (type) {
            case 'case': return { bg: '#7c3aed', border: '#a78bfa', text: '#fff' };
            case 'statute': return { bg: '#6366f1', border: '#818cf8', text: '#fff' };
            case 'case_type': return { bg: '#8b5cf6', border: '#a78bfa', text: '#fff' };
            case 'court': return { bg: '#6b21a8', border: '#9333ea', text: '#fff' };
            case 'judge': return { bg: '#7e22ce', border: '#a855f7', text: '#fff' };
            case 'concept': return { bg: '#581c87', border: '#7e22ce', text: '#fff' };
            default: return { bg: '#6b21a8', border: '#9333ea', text: '#fff' };
        }
    };

    const getNodeIcon = (type: string) => {
        switch (type) {
            case 'statute': return BookOpen;
            case 'case_type': return Hash;
            case 'court': return Building2;
            case 'judge': return User;
            case 'concept': return FileText;
            default: return Scale;
        }
    };

    return (
        <div className="relative w-full h-[500px] bg-gradient-to-br from-purple-950/20 to-violet-950/20 rounded-2xl border border-purple-500/20 overflow-hidden mt-3">
            <svg
                ref={svgRef}
                className="w-full h-full"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
            >
                {/* Draw links with spring effect */}
                {links.map((link, idx) => {
                    const source = typeof link.source === 'string'
                        ? nodes.find(n => n.id === link.source)
                        : link.source;
                    const target = typeof link.target === 'string'
                        ? nodes.find(n => n.id === link.target)
                        : link.target;

                    if (!source || !target || source.x === undefined || target.x === undefined) return null;

                    return (
                        <line
                            key={`link-${idx}`}
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            stroke="rgba(168, 85, 247, 0.4)"
                            strokeWidth="2"
                            className="transition-all duration-100"
                        />
                    );
                })}

                {/* Draw nodes */}
                {nodes.map(node => {
                    if (node.x === undefined || node.y === undefined) return null;

                    const colors = getNodeColor(node.type);
                    const Icon = getNodeIcon(node.type);
                    const isCase = node.type === 'case';
                    const size = isCase ? 50 : 35;

                    return (
                        <g
                            key={node.id}
                            transform={`translate(${node.x}, ${node.y})`}
                            onMouseDown={(e) => handleMouseDown(node, e)}
                            style={{ cursor: 'grab' }}
                            className={draggedNodeRef.current?.id === node.id ? 'cursor-grabbing' : ''}
                        >
                            {/* Glow effect */}
                            <circle
                                r={size + 5}
                                fill={colors.bg}
                                opacity="0.2"
                                className={isCase ? 'animate-pulse' : ''}
                            />

                            {/* Main circle */}
                            <circle
                                r={size}
                                fill={colors.bg}
                                stroke={colors.border}
                                strokeWidth="3"
                                className="transition-all duration-200 hover:stroke-purple-300"
                            />

                            {/* Icon */}
                            {!isCase && (
                                <foreignObject
                                    x={-10}
                                    y={-10}
                                    width="20"
                                    height="20"
                                >
                                    <Icon className="w-5 h-5 text-white" />
                                </foreignObject>
                            )}

                            {/* Label */}
                            <text
                                y={size + 18}
                                textAnchor="middle"
                                fill="white"
                                fontSize={isCase ? "12" : "10"}
                                fontWeight={isCase ? "bold" : "normal"}
                                className="pointer-events-none select-none"
                            >
                                {node.label.length > 15 ? node.label.substring(0, 15) + '...' : node.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
