"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Play, Pause, RotateCcw, Search, Filter, Download, RefreshCw,
  Clock, Wifi, WifiOff, Upload, Download as DownloadIcon, Users, Activity,
  MoreVertical, Shield, ChevronRight, Zap
} from "lucide-react";
import {
  Button, Card, CardBody, CardHeader,
  Input, Badge, Modal, Select, Progress, Dropdown
} from "@/components";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip
} from "recharts";

// ============================================================================
// Helpers & Types
// ============================================================================

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

interface Connection {
  id: string;
  name: string;
  ipAddress: string;
  macAddress: string;
  profile: string;
  uptime: number;
  bytesIn: number;
  bytesOut: number;
  status: "active" | "disabled" | "pending";
  lastSeen: string;
  throughput: { time: string; val: number }[];
}

// ============================================================================
// Mock Data
// ============================================================================

const mockConnections: Connection[] = [
  {
    id: "PPP_001",
    name: "rudra.isp",
    ipAddress: "10.10.20.55",
    macAddress: "FC:A1:EE:22:90:01",
    profile: "Ultra_Speed_100M",
    uptime: 86400 * 2.5,
    bytesIn: 1024 * 1024 * 1024 * 12,
    bytesOut: 1024 * 1024 * 1024 * 45,
    status: "active",
    lastSeen: "Just now",
    throughput: Array.from({ length: 10 }, (_, i) => ({ time: `${i}s`, val: Math.random() * 80 + 20 }))
  },
  {
    id: "PPP_002",
    name: "office.main",
    ipAddress: "10.10.20.102",
    macAddress: "FC:A1:EE:22:90:02",
    profile: "Business_Premium",
    uptime: 12400,
    bytesIn: 1024 * 1024 * 850,
    bytesOut: 1024 * 1024 * 1024 * 2.1,
    status: "active",
    lastSeen: "2m ago",
    throughput: Array.from({ length: 10 }, (_, i) => ({ time: `${i}s`, val: Math.random() * 40 + 10 }))
  },
  {
    id: "PPP_003",
    name: "guest.lounge",
    ipAddress: "10.10.20.215",
    macAddress: "FC:A1:EE:22:90:03",
    profile: "Guest_Access_5M",
    uptime: 0,
    bytesIn: 0,
    bytesOut: 0,
    status: "disabled",
    lastSeen: "3 hours ago",
    throughput: []
  }
];

// ============================================================================
// Main Component
// ============================================================================

export default function PPPPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<"enable" | "disable" | "restart">("enable");

  const filteredConnections = useMemo(() => {
    return mockConnections.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.ipAddress.includes(searchQuery);
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const activeCount = mockConnections.filter(c => c.status === "active").length;

  const handleBulkAction = (type: typeof actionType) => {
    setActionType(type);
    setShowConfirmModal(true);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary-500" />
            PPP Connections
          </h1>
          <p className="text-sm text-neutral-500 font-medium tracking-tight">Real-time session management and tunnel monitoring.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>Force Refresh</Button>
          <Button className="shadow-lg shadow-primary-500/20" leftIcon={<Activity className="w-4 h-4" />}>Live Monitor</Button>
        </div>
      </div>

      {/* Stats Overlays */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-0 shadow-xl overflow-hidden group">
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Active Tunnels</p>
                <h3 className="text-4xl font-black text-neutral-900 dark:text-white">{activeCount}</h3>
                <Badge variant="success" className="mt-2 rounded-full px-2 text-[10px]">Healthy Performance</Badge>
              </div>
              <div className="p-3 bg-primary-500/10 rounded-2xl text-primary-500 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="glass border-0 shadow-xl overflow-hidden group">
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Total Throughput</p>
                <h3 className="text-4xl font-black text-neutral-900 dark:text-white">1.2 GB/s</h3>
                <div className="flex items-center gap-1 text-[10px] font-bold text-success-600 mt-2">
                  <Zap className="w-3 h-3" />
                  Peak Load Detected
                </div>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="glass border-0 shadow-xl overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-800 text-white relative">
          <CardBody className="p-6 relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Tunnel Uptime</p>
            <h3 className="text-4xl font-black mb-1">99.98%</h3>
            <p className="text-[10px] font-bold opacity-80">System-wide Average</p>
            <div className="mt-4 flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-neutral-900 bg-neutral-700 flex items-center justify-center text-[10px] font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
          </CardBody>
          <div className="absolute right-0 bottom-0 p-4 opacity-10">
            <Clock className="w-20 h-20" />
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="glass border-0 shadow-lg">
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search by username or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 border-0 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl h-12"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: "all", label: "Any Status" },
                { value: "active", label: "Active" },
                { value: "disabled", label: "Disabled" },
                { value: "pending", label: "Pending" },
              ]}
              className="w-full md:w-44"
            />
            <Button variant="outline" className="h-12 w-12 p-0 rounded-2xl"><Filter className="w-4 h-4" /></Button>
            <Button variant="outline" className="h-12 w-12 p-0 rounded-2xl"><Download className="w-4 h-4" /></Button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions Floating Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
          <div className="glass shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 border border-primary-500/20 backdrop-blur-2xl">
            <span className="text-sm font-black text-primary-600 px-3 py-1 bg-primary-100 rounded-full">{selectedIds.length} Selected</span>
            <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-700" />
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="hover:text-success-600" onClick={() => handleBulkAction("enable")} leftIcon={<Play className="w-4 h-4" />}>Enable</Button>
              <Button size="sm" variant="ghost" className="hover:text-error-600" onClick={() => handleBulkAction("disable")} leftIcon={<Pause className="w-4 h-4" />}>Disable</Button>
              <Button size="sm" variant="ghost" onClick={() => handleBulkAction("restart")} leftIcon={<RotateCcw className="w-4 h-4" />}>Restart</Button>
            </div>
            <Button size="sm" variant="ghost" className="text-neutral-400" onClick={() => setSelectedIds([])}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Connections Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredConnections.map((conn) => (
          <Card key={conn.id} className={cn(
            "glass border-0 shadow-lg group relative overflow-hidden transition-all duration-300",
            selectedIds.includes(conn.id) ? "ring-2 ring-primary-500" : "hover:shadow-2xl hover:-translate-y-1"
          )}>
            <CardBody className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Session Identity */}
                <div className="p-6 lg:w-1/4 border-r border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                      <Wifi className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-neutral-900 dark:text-white truncate max-w-[120px]">{conn.name}</h4>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(conn.id)}
                          onChange={() => toggleSelect(conn.id)}
                          className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                        />
                      </div>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">{conn.ipAddress}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-neutral-400">PROFILE</span>
                      <span className="text-neutral-700 dark:text-neutral-300 uppercase tracking-tighter">{conn.profile}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-neutral-400">UPTIME</span>
                      <span className="text-neutral-700 dark:text-neutral-300">{conn.uptime > 0 ? formatUptime(conn.uptime) : "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Live Throughput Viz */}
                <div className="p-6 lg:w-1/3 border-r border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Live Throughput</span>
                    <Badge variant={conn.status === "active" ? "success" : "default"} size="sm">{conn.status}</Badge>
                  </div>
                  <div className="h-20 w-full">
                    {conn.throughput.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={conn.throughput}>
                          <defs>
                            <linearGradient id={`colorVal-${conn.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="val"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#colorVal-${conn.id})`}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Signal Lost</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Traffic Stats */}
                <div className="p-6 lg:w-1/4 border-r border-neutral-100 dark:border-neutral-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-4">Session Data</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-success-600 mb-1">
                        <Upload className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Uploaded</span>
                      </div>
                      <p className="text-sm font-black">{formatBytes(conn.bytesIn)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-info-600 mb-1">
                        <DownloadIcon className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Downloaded</span>
                      </div>
                      <p className="text-sm font-black">{formatBytes(conn.bytesOut)}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-[10px] font-bold">
                    <span className="text-neutral-400">LAST SEEN</span>
                    <span className="text-neutral-500">{conn.lastSeen}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 lg:flex-1 flex items-center justify-center lg:justify-end gap-2">
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <Pause className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-info-600">
                    <Search className="w-4 h-4" />
                  </Button>
                  <Dropdown
                    trigger={<Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"><MoreVertical className="w-4 h-4" /></Button>}
                    items={[
                      { label: "Restart Tunnel", icon: <RotateCcw className="w-4 h-4" /> },
                      { label: "Edit Profile", icon: <Activity className="w-4 h-4" /> },
                      { label: "Terminate Session", icon: <Pause className="w-4 h-4" />, danger: true },
                    ]}
                  />
                  <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl group-hover:bg-primary-500 group-hover:text-white transition-all text-neutral-400 hover:text-white">
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Action Confirmation"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Are you sure you want to <span className="font-black uppercase text-primary-500">{actionType}</span> the selected {selectedIds.length} tunnel(s)?
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => setShowConfirmModal(false)}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
