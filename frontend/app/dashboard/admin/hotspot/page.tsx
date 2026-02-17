"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Play, Pause, RotateCcw, Search, Filter, Download, RefreshCw,
  Clock, Wifi, WifiOff, Users, Activity, UserPlus, Settings,
  Trash2, Edit2, Eye, Globe, Smartphone, UserCheck, ShieldAlert,
  ChevronRight, MoreVertical, X, CheckCircle2
} from "lucide-react";
import {
  Button, Card, CardBody, CardHeader,
  Input, Badge, Modal, Select, Progress, Dropdown, Alert
} from "@/components";
import { cn } from "@/lib/utils";

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

interface HotspotUser {
  id: string;
  username: string;
  profile: string;
  ipAddress: string;
  macAddress: string;
  uptime: number;
  bytesTotal: number;
  status: "online" | "expired" | "blocked" | "idle";
  validUntil: string | null;
  comment: string;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockHotspotUsers: HotspotUser[] = [
  {
    id: "HS_001",
    username: "guest_772",
    profile: "Guest_1Hr_Limited",
    ipAddress: "192.168.88.10",
    macAddress: "AA:BB:CC:DD:EE:01",
    uptime: 1800,
    bytesTotal: 1024 * 1024 * 450,
    status: "online",
    validUntil: "2024-03-20 22:30",
    comment: "Coffee Shop Guest"
  },
  {
    id: "HS_002",
    username: "vip.user.01",
    profile: "VIP_Unlimited",
    ipAddress: "192.168.88.22",
    macAddress: "AA:BB:CC:DD:EE:02",
    uptime: 86400 * 5,
    bytesTotal: 1024 * 1024 * 1024 * 15.2,
    status: "online",
    validUntil: null,
    comment: "Regular Staff"
  },
  {
    id: "HS_003",
    username: "temp_voucher_99",
    profile: "Voucher_24h",
    ipAddress: "-",
    macAddress: "AA:BB:CC:DD:EE:03",
    uptime: 0,
    bytesTotal: 1024 * 1024 * 50,
    status: "expired",
    validUntil: "2024-03-19 10:00",
    comment: "Daily Pass"
  },
  {
    id: "HS_004",
    username: "bad_actor_0x",
    profile: "Restricted",
    ipAddress: "-",
    macAddress: "AA:BB:CC:DD:EE:04",
    uptime: 0,
    bytesTotal: 1024 * 1024 * 800,
    status: "blocked",
    validUntil: null,
    comment: "Spam behavior detected"
  }
];

// ============================================================================
// Main Component
// ============================================================================

export default function HotspotPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredUsers = useMemo(() => {
    return mockHotspotUsers.filter(u => {
      const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.macAddress.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const onlineCount = mockHotspotUsers.filter(u => u.status === "online").length;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Globe className="w-7 h-7 text-primary-500" />
            Hotspot Users
          </h1>
          <p className="text-sm text-neutral-500 font-medium tracking-tight">Manage voucher-based access and guest sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Export Vouchers</Button>
          <Button className="shadow-lg shadow-primary-500/20" leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>Create User</Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border-0 shadow-lg">
          <CardBody className="p-4 flex items-center gap-4">
            <div className="p-3 bg-success-500/10 text-success-600 rounded-2xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-neutral-400">Online Now</p>
              <h4 className="text-2xl font-black">{onlineCount}</h4>
            </div>
          </CardBody>
        </Card>
        <Card className="glass border-0 shadow-lg">
          <CardBody className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 text-primary-600 rounded-2xl">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-neutral-400">Total Devices</p>
              <h4 className="text-2xl font-black">{mockHotspotUsers.length}</h4>
            </div>
          </CardBody>
        </Card>
        <Card className="glass border-0 shadow-lg">
          <CardBody className="p-4 flex items-center gap-4">
            <div className="p-3 bg-warning-500/10 text-warning-600 rounded-2xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-neutral-400">Expiring Soon</p>
              <h4 className="text-2xl font-black">12</h4>
            </div>
          </CardBody>
        </Card>
        <Card className="glass border-0 shadow-lg">
          <CardBody className="p-4 flex items-center gap-4">
            <div className="p-3 bg-error-500/10 text-error-600 rounded-2xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-neutral-400">Blocked MACs</p>
              <h4 className="text-2xl font-black">2</h4>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card className="glass border-0 shadow-2xl overflow-hidden">
        <CardHeader
          title="User Management Grid"
          subtitle="Monitor activity, modify profiles, and manage vouchers"
        />

        {/* Search & Bulk Toolbar */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/10">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search username or MAC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-0 bg-white dark:bg-neutral-800 shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: "all", label: "Any Status" },
                { value: "online", label: "Online Only" },
                { value: "expired", label: "Expired" },
                { value: "blocked", label: "Blocked" },
              ]}
              className="w-full md:w-40"
            />
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-1 bg-primary-500 p-1 rounded-xl shadow-lg shadow-primary-500/20">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 px-3"><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
                <div className="w-[1px] h-6 bg-white/20 mx-1" />
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 px-3" onClick={() => setSelectedIds([])}><X className="w-4 h-4" /></Button>
              </div>
            )}
          </div>
        </div>

        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => e.target.checked ? setSelectedIds(filteredUsers.map(u => u.id)) : setSelectedIds([])}
                      className="rounded border-neutral-300"
                    />
                  </th>
                  <th className="px-6 py-4">User Identity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Session Data</th>
                  <th className="px-6 py-4">Expirations</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-all group">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="rounded border-neutral-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 group-hover:bg-primary-500 group-hover:text-white transition-colors shadow-sm">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black dark:text-white leading-tight">{user.username}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{user.macAddress}</span>
                            <div className="w-1 h-1 rounded-full bg-neutral-300" />
                            <span className="text-[10px] font-bold text-primary-500 uppercase tracking-tighter">{user.profile}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={user.status === "online" ? "success" : user.status === "blocked" ? "error" : "default"}
                        size="sm"
                        className="rounded-full px-3"
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-black dark:text-white">{formatBytes(user.bytesTotal)}</span>
                        <div className="w-24 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500" style={{ width: '45%' }} />
                        </div>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">Uptime: {user.uptime > 0 ? formatUptime(user.uptime) : "None"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.validUntil ? (
                        <div className="space-y-1">
                          <p className="text-xs font-bold dark:text-neutral-300">{user.validUntil}</p>
                          <p className="text-[9px] font-black text-warning-600 uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Auto-Disconnect
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-success-600 italic">Permanent Access</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-white dark:hover:bg-neutral-700 shadow-sm"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-white dark:hover:bg-neutral-700 shadow-sm"><Edit2 className="w-4 h-4" /></Button>
                        <Dropdown
                          trigger={<Button variant="ghost" size="sm" className="h-9 w-9 p-0"><MoreVertical className="w-4 h-4" /></Button>}
                          items={[
                            { label: "Reset Password", icon: <Settings className="w-4 h-4" /> },
                            { label: "Force Logout", icon: <Pause className="w-4 h-4" /> },
                            { label: "Block MAC", icon: <ShieldAlert className="w-4 h-4" />, danger: true },
                          ]}
                        />
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-2 hover:bg-primary-500 hover:text-white transition-all text-neutral-400"><ChevronRight className="w-5 h-5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Hotspot Session"
        size="lg"
      >
        <div className="space-y-6">
          <Alert variant="info" title="Voucher System Tip">
            Users created here can bypass traditional login prompts via MAC authentication if specified.
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Username / Voucher Code" placeholder="GUEST_XXXX" />
            <Input label="Session Password" type="password" placeholder="••••••••" />
            <Select
              label="Assignment Profile"
              value="1h"
              onChange={() => { }}
              options={[
                { value: "1h", label: "Guest (1 Hour)" },
                { value: "24h", label: "Guest (24 Hours)" },
                { value: "permanent", label: "Executive (Permanent)" },
              ]}
            />
            <Input label="Binding MAC Address (Optional)" placeholder="00:00:00:00:00:00" />
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-700">
            <p className="text-[10px] font-black uppercase text-neutral-400 mb-3">Optional Attributes</p>
            <Input label="Administrative Comment" placeholder="e.g. Conference Attendee Table 4" />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Discard</Button>
            <Button leftIcon={<CheckCircle2 className="w-4 h-4" />} onClick={() => setShowAddModal(false)}>Deploy User Access</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
