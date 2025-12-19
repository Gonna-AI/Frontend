import { Node, Edge } from 'reactflow';

export enum NodeStatus {
    IDLE = 'IDLE',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    ERROR = 'ERROR',
}

export type NodeCategory = 'trigger' | 'agent' | 'tool' | 'action';

export interface LogEntry {
    timestamp: string;
    level: 'info' | 'warn' | 'success';
    message: string;
}

export interface NodeMetadata {
    model?: string;
    tokens?: number;
    confidence?: number;
    executionTime?: string;
    version?: string;
    cost?: string;
}

export interface NodeData {
    label: string;
    subline?: string;
    icon?: string;
    category: NodeCategory;
    status: NodeStatus;
    logs: LogEntry[];
    metadata?: NodeMetadata;
    // Technical IO
    inputType?: string;
    outputType?: string;
    inputs?: Record<string, any>;
    outputs?: Record<string, any>;
}

export type AppNode = Node<NodeData>;
export type AppEdge = Edge;
