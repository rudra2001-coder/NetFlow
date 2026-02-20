"use client";

import React, { useState, useCallback, useRef } from "react";
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    Connection,
    Edge,
    Node,
    useNodesState,
    useEdgesState,
    Panel,
    MarkerType,
    Handle,
    Position,
} from "reactflow";
import "reactflow/dist/style.css";
import {
    Server, Layers, Wifi, HardDrive, Globe,
    Trash2, Plus, Zap, Activity, Info,
    Maximize2, MousePointer2, Share2, Shield
} from "lucide-react";
import { Button, Card, CardBody, Badge, Input } from "@/components";
import { cn } from "@/lib/utils";

// ============================================================================
// Custom Node Components (Glassmorphism)
// ============================================================================

const NetworkNode = ({ data, selected }: any) => {
    const Icon = data.icon || Server;

    return (
        <div className={cn(
            "px-4 py-3 rounded-2xl border-2 transition-all duration-300 min-w-[180px]",
            "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl",
            selected
                ? "border-primary-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105"
                : "border-neutral-200/50 dark:border-neutral-800/50 shadow-xl"
        )}>
            <Handle type="target" position={Position.Top} className="!bg-primary-500 !w-3 !h-3 !border-2 !border-white dark:!border-neutral-900" />

            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl text-white shadow-lg", data.color || "bg-primary-500")}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-black text-neutral-900 dark:text-white truncate">{data.label}</p>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{data.type}</p>
                </div>
            </div>

            <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                    <span className="text-neutral-400 font-medium italic">{data.ip}</span>
                    <Badge variant={data.status === 'online' ? 'success' : 'warning'} size="sm" className="px-1.5 py-0">
                        {data.status}
                    </Badge>
                </div>
                <div className="h-1 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                        className={cn("h-full transition-all duration-1000", data.color || "bg-primary-500")}
                        style={{ width: `${data.usage || 45}%` }}
                    />
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-primary-500 !w-3 !h-3 !border-2 !border-white dark:!border-neutral-900" />
        </div>
    );
};

const nodeTypes = {
    networkNode: NetworkNode,
};

// ============================================================================
// Initial Data
// ============================================================================

const initialNodes: Node[] = [
    {
        id: "1",
        type: "networkNode",
        position: { x: 400, y: 50 },
        data: { label: "Core Router", type: "Gateway", ip: "192.168.1.1", status: "online", icon: Globe, color: "bg-blue-600", usage: 65 },
    },
    {
        id: "2",
        type: "networkNode",
        position: { x: 200, y: 200 },
        data: { label: "Switch-Floor-1", type: "Aggregation", ip: "192.168.1.2", status: "online", icon: Layers, color: "bg-purple-600", usage: 32 },
    },
    {
        id: "3",
        type: "networkNode",
        position: { x: 600, y: 200 },
        data: { label: "Data-Server", type: "Storage", ip: "192.168.1.10", status: "online", icon: HardDrive, color: "bg-emerald-600", usage: 88 },
    },
];

const initialEdges: Edge[] = [
    {
        id: "e1-2",
        source: "1",
        target: "2",
        animated: true,
        style: { stroke: "#3b82f6", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" }
    },
    {
        id: "e1-3",
        source: "1",
        target: "3",
        animated: false,
        style: { stroke: "#10b981", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" }
    },
];

// ============================================================================
// Main Page Component
// ============================================================================

export default function TopologyPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({
            ...params,
            animated: true,
            style: { stroke: "#3b82f6", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" }
        }, eds)),
        [setEdges]
    );

    const onDragStart = (event: React.DragEvent, nodeType: string, deviceName: string, iconType: string, color: string) => {
        event.dataTransfer.setData("application/reactflow", JSON.stringify({ nodeType, deviceName, iconType, color }));
        event.dataTransfer.effectAllowed = "move";
    };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
            const rawData = event.dataTransfer.getData("application/reactflow");

            if (!rawData || !reactFlowBounds) return;

            const { deviceName, iconType, color } = JSON.parse(rawData);

            // Map string icons back to components
            const iconMap: any = { Server, Layers, Wifi, HardDrive, Globe };

            const position = {
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            };

            const newNode: Node = {
                id: `node_${Date.now()}`,
                type: "networkNode",
                position,
                data: {
                    label: deviceName,
                    type: "Utility",
                    ip: "192.168.1.X",
                    status: "online",
                    icon: iconMap[iconType] || Server,
                    color: color || "bg-primary-500",
                    usage: Math.floor(Math.random() * 50) + 10
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [setNodes]
    );

    const deleteSelected = () => {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] animate-fadeIn">
            {/* Topology Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                        <Share2 className="w-6 h-6 text-primary-500" />
                        Network Topology
                    </h1>
                    <p className="text-sm text-neutral-500 font-medium">Visual map of your infrastructure and active connections.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="hidden md:flex" leftIcon={<MousePointer2 className="w-4 h-4" />}>Selection Mode</Button>
                    <Button variant="outline" size="sm" onClick={deleteSelected} className="text-error-500 hover:text-error-600">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button leftIcon={<Plus className="w-4 h-4" />} className="shadow-lg shadow-primary-500/20">Provision Device</Button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 min-h-0">
                {/* Sidebar - Node Repository */}
                <aside className="w-64 flex flex-col gap-4">
                    <Card className="glass border-0 shadow-xl h-full">
                        <CardBody className="p-4 flex flex-col h-full">
                            <p className="text-xs font-black text-neutral-400 uppercase tracking-[2px] mb-4">Device Repository</p>

                            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                {[
                                    { name: "Core Router", icon: Globe, iconName: "Globe", color: "bg-blue-600", type: "Gateway" },
                                    { name: "Access Switch", icon: Layers, iconName: "Layers", color: "bg-purple-600", type: "Network" },
                                    { name: "WiFi Node", icon: Wifi, iconName: "Wifi", color: "bg-orange-600", type: "Wireless" },
                                    { name: "Storage NAS", icon: HardDrive, iconName: "HardDrive", color: "bg-emerald-600", type: "System" },
                                    { name: "Virtual Server", icon: Server, iconName: "Server", color: "bg-indigo-600", type: "Utility" },
                                ].map((item) => (
                                    <div
                                        key={item.name}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, "networkNode", item.name, item.iconName, item.color)}
                                        className="group cursor-grab active:cursor-grabbing p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 hover:border-primary-500/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-xl text-white shadow-md group-hover:scale-110 transition-transform", item.color)}>
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">{item.name}</p>
                                                <p className="text-[10px] text-neutral-500">{item.type}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                                <div className="p-4 bg-primary-500/10 rounded-2xl border border-primary-500/20">
                                    <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-1">
                                        <Zap className="w-4 h-4" />
                                        <span className="text-xs font-black uppercase tracking-tighter">Live Monitor</span>
                                    </div>
                                    <p className="text-[10px] text-neutral-500 font-medium">Drag devices to auto-discover and map interfaces.</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </aside>

                {/* Main Canvas Area */}
                <main className="flex-1 min-w-0">
                    <Card className="glass border-0 shadow-2xl h-full overflow-hidden relative">
                        <div ref={reactFlowWrapper} className="w-full h-full">
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                onDrop={onDrop}
                                onDragOver={onDragOver}
                                nodeTypes={nodeTypes}
                                fitView
                                className="bg-neutral-50/50 dark:bg-transparent"
                            >
                                <Background color="#ccc" variant={"dots" as any} gap={20} size={1} />
                                <Controls className="!bg-white dark:!bg-neutral-900 !border-0 !shadow-xl !rounded-xl overflow-hidden" />
                                <MiniMap
                                    className="!bg-white/80 dark:!bg-neutral-900/80 !backdrop-blur-md !rounded-2xl !border-0 !shadow-2xl"
                                    nodeColor={(n) => (n.data as any).color === 'bg-blue-600' ? '#3b82f6' : '#9ca3af'}
                                    maskColor="rgba(0, 0, 0, 0.1)"
                                />

                                <Panel position="top-right" className="flex gap-2">
                                    <Badge variant="info" className="flex items-center gap-2 py-1.5 px-3">
                                        <Activity className="w-3 h-3" />
                                        Real-time Routing
                                    </Badge>
                                    <Badge variant="success" className="flex items-center gap-2 py-1.5 px-3">
                                        <Shield className="w-3 h-3" />
                                        Secure Link
                                    </Badge>
                                </Panel>
                            </ReactFlow>
                        </div>

                        {/* Canvas Overlay Info */}
                        <div className="absolute bottom-6 left-6 pointer-events-none">
                            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-black tracking-widest opacity-60">System Mode</span>
                                    <span className="text-sm font-bold flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                                        Operational
                                    </span>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Nodes On Mesh</span>
                                    <span className="text-sm font-bold">{nodes.length} Devices</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </main>
            </div>
        </div>
    );
}
