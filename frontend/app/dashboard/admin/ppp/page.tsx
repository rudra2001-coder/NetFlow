"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Play, Pause, RotateCcw, Search, Filter, Download, RefreshCw,
  Clock, Wifi, WifiOff, Upload, Download as DownloadIcon, Users, Activity,
  MoreVertical, Shield, ChevronRight, Zap, CheckCircle2, Settings, X
} from "lucide-react";
import {
  Button, Card, CardBody, CardHeader,
  Input, Badge, Modal, Select, Progress, Dropdown, Alert
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
  const [showBulkPackageModal, setShowBulkPackageModal] = useState(false);
  const [actionType, setActionType] = useState<"enable" | "disable" | "restart" | "paid" | "sync">("enable");
  const [newPackage, setNewPackage] = useState("");

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
    <div className="space-y-6 animate-fadeIn pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary-500" />
            PPP Command Center
          </h1>
          <p className="text-sm text-neutral-500 font-medium tracking-tight">Enterprise tunnel orchestration and real-time session management.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-11 px-6 border-0 glass shadow-lg font-bold" leftIcon={<RefreshCw className="w-4 h-4" />}>Force Refresh</Button>
          <Button className="rounded-2xl h-11 px-6 shadow-xl shadow-primary-500/20 bg-primary-600 font-black" leftIcon={<Activity className="w-4 h-4" />}>Live Monitor</Button>
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
              <div className="p-4 bg-primary-500/10 rounded-2xl text-primary-500 group-hover:scale-110 transition-transform">
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
              <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="glass border-0 shadow-xl overflow-hidden bg-neutral-900 text-white relative">
          <CardBody className="p-6 relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Service SLA</p>
            <h3 className="text-4xl font-black mb-1">99.98%</h3>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">Enterprise Uptime Guaranteed</p>
            <div className="mt-4 flex gap-1">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-5 w-1.5 rounded-full bg-success-500" />
              ))}
              <div className="h-5 w-1.5 rounded-full bg-neutral-700" />
            </div>
          </CardBody>
          <div className="absolute right-0 bottom-0 p-4 opacity-5">
            <Clock className="w-24 h-24" />
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="glass border-0 shadow-lg overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search by identity or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 border-0 bg-white dark:bg-neutral-800 shadow-sm rounded-2xl h-12"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "disabled", label: "Disabled" },
                { value: "pending", label: "Pending" },
              ]}
              className="w-full md:w-44"
            />
            <Button variant="outline" className="h-12 w-12 p-0 rounded-2xl border-0 glass shadow-lg"><Filter className="w-4 h-4" /></Button>
            <Button variant="outline" className="h-12 w-12 p-0 rounded-2xl border-0 glass shadow-lg"><Download className="w-4 h-4" /></Button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions Floating Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
          <div className="glass shadow-2xl rounded-[2rem] px-8 py-4 flex items-center gap-8 border border-primary-500/30 backdrop-blur-3xl bg-white/80 dark:bg-neutral-900/80">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Selection</span>
              <span className="text-sm font-black text-neutral-900 dark:text-white">{selectedIds.length} Nodes</span>
            </div>
            <div className="h-10 w-[1px] bg-neutral-200 dark:bg-neutral-700" />
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="hover:bg-success-50 dark:hover:bg-success-900/20 text-success-600 rounded-xl px-4" onClick={() => handleBulkAction("paid")} leftIcon={<CheckCircle2 className="w-4 h-4" />}>Mark Paid</Button>
              <Button size="sm" variant="ghost" className="hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 rounded-xl px-4" onClick={() => setShowBulkPackageModal(true)} leftIcon={<Settings className="w-4 h-4" />}>Change Plan</Button>
              <Button size="sm" variant="ghost" className="hover:bg-info-50 dark:hover:bg-info-900/20 text-info-600 rounded-xl px-4" onClick={() => handleBulkAction("sync")} leftIcon={<RefreshCw className="w-4 h-4" />}>Sync Router</Button>

              <div className="w-[1px] h-6 bg-neutral-200 dark:bg-neutral-700 mx-2" />

              <Button size="sm" variant="ghost" className="hover:text-error-600 rounded-xl" onClick={() => handleBulkAction("disable")}><Pause className="w-4 h-4" /></Button>
            </div>
            <Button size="sm" variant="ghost" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white" onClick={() => setSelectedIds([])}>Dismiss</Button>
          </div>
        </div>
      )}

      {/* Connections Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredConnections.map((conn) => (
          <Card key={conn.id} className={cn(
            "glass border-0 shadow-lg group relative overflow-hidden transition-all duration-500",
            selectedIds.includes(conn.id) ? "ring-2 ring-primary-500 bg-primary-50/10 dark:bg-primary-900/5" : "hover:shadow-2xl hover:-translate-y-1"
          )}>
            <CardBody className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Session Identity */}
                <div className="p-6 lg:w-1/4 border-r border-neutral-100 dark:border-neutral-800 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-xl shadow-primary-500/20 group-hover:scale-110 transition-transform">
                      <Wifi className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-neutral-900 dark:text-white truncate">{conn.name}</h4>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(conn.id)}
                          onChange={() => toggleSelect(conn.id)}
                          className="w-4 h-4 rounded-lg border-neutral-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{conn.ipAddress}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black">
                      <span className="text-neutral-400 uppercase">Profile Plan</span>
                      <span className="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-md">{conn.profile}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black">
                      <span className="text-neutral-400 uppercase">Active Time</span>
                      <span className="text-neutral-700 dark:text-neutral-300 tabular-nums">{conn.uptime > 0 ? formatUptime(conn.uptime) : "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Live Throughput Viz */}
                <div className="p-6 lg:w-1/3 border-r border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/10 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Live Traffic Viz</span>
                    <Badge variant={conn.status === "active" ? "success" : "default"} size="sm" className="font-black uppercase">{conn.status}</Badge>
                  </div>
                  <div className="h-20 w-full">
                    {conn.throughput.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={conn.throughput}>
                          <defs>
                            <linearGradient id={`colorVal-${conn.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="val"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill={`url(#colorVal-${conn.id})`}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl bg-white/50 dark:bg-black/20">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Link Inactive</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Traffic Stats */}
                <div className="p-6 lg:w-1/4 border-r border-neutral-100 dark:border-neutral-800 flex flex-col justify-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-4">Session Statistics</span>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-1.5 text-success-600 mb-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">TX</span>
                      </div>
                      <p className="text-sm font-black tabular-nums">{formatBytes(conn.bytesIn)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                        <DownloadIcon className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">RX</span>
                      </div>
                      <p className="text-sm font-black tabular-nums">{formatBytes(conn.bytesOut)}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-neutral-400">Identity</span>
                    <span className="text-neutral-600 dark:text-neutral-400">{conn.macAddress}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 lg:flex-1 flex items-center justify-center lg:justify-end gap-2">
                  <button
                    className="h-11 w-11 rounded-2xl bg-success-50 dark:bg-success-900/10 text-success-600 flex items-center justify-center hover:bg-success-500 hover:text-white transition-all shadow-sm"
                    title="Process Payment"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <Button variant="ghost" size="sm" className="h-11 w-11 p-0 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <Pause className="w-4 h-4 text-neutral-500" />
                  </Button>
                  <Dropdown
                    trigger={<Button variant="ghost" size="sm" className="h-11 w-11 p-0 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800"><MoreVertical className="w-5 h-5" /></Button>}
                    items={[
                      { label: "Restart Tunnel Session", icon: <RotateCcw className="w-4 h-4" /> },
                      { label: "Edit Service Profile", icon: <Settings className="w-4 h-4" /> },
                      { label: "Router Sync Status", icon: <RefreshCw className="w-4 h-4" /> },
                      { label: "Force Terminate", icon: <X className="w-4 h-4" />, danger: true },
                    ]}
                  />
                  <Button variant="ghost" size="sm" className="h-11 px-4 rounded-2xl group-hover:bg-neutral-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
                    <ChevronRight className="w-6 h-6" />
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
        title="Command Execution"
        size="sm"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-700">
            <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Protocol Action</p>
              <p className="text-sm font-black dark:text-white uppercase italic">{actionType}</p>
            </div>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
            Confirm execution for <span className="font-black text-primary-600">{selectedIds.length} active nodes</span>? This action will be logged in the administrative audit vault.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
            <Button className="flex-1 h-12 rounded-2xl font-black bg-primary-600" onClick={() => setShowConfirmModal(false)}>Authorize</Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Package Modal */}
      <Modal
        isOpen={showBulkPackageModal}
        onClose={() => setShowBulkPackageModal(false)}
        title="Core Package Migration"
        size="md"
      >
        <div className="space-y-6">
          <Alert variant="warning" title="Critical Migration">
            Changing profiles for multiple users will trigger a session restart and router sync for all selected nodes.
          </Alert>

          <Select
            label="Target Service Profile"
            value={newPackage}
            onChange={setNewPackage}
            options={[
              { value: "10m", label: "Value Pack (10Mbps)" },
              { value: "50m", label: "Pro Gamer (50Mbps)" },
              { value: "100m", label: "Ultra Fiber (100Mbps)" },
              { value: "corp", label: "Executive Dedication" },
            ]}
          />

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold" onClick={() => setShowBulkPackageModal(false)}>Abort</Button>
            <Button className="flex-1 h-12 rounded-2xl font-black bg-primary-600" onClick={() => setShowBulkPackageModal(false)}>Start Migration</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
