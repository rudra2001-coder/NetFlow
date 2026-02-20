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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showBulkPackageModal, setShowBulkPackageModal] = useState(false);
  const [actionType, setActionType] = useState<"delete" | "paid" | "sync">("delete");
  const [newProfile, setNewProfile] = useState("");

  const filteredUsers = useMemo(() => {
    return mockHotspotUsers.filter(u => {
      const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.macAddress.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const onlineCount = mockHotspotUsers.filter(u => u.status === "online").length;

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
            <Globe className="w-7 h-7 text-primary-500" />
            Hotspot Command Center
          </h1>
          <p className="text-sm text-neutral-500 font-medium tracking-tight">Enterprise guest networking and voucher orchestration hub.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-11 px-6 border-0 glass shadow-lg font-bold" leftIcon={<Download className="w-4 h-4" />}>Export Vouchers</Button>
          <Button className="rounded-2xl h-11 px-6 shadow-xl shadow-primary-500/20 bg-primary-600 font-black" leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>Create User</Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border-0 shadow-lg group hover:bg-success-50/10 transition-colors">
          <CardBody className="p-4 flex items-center gap-4">
            <div className="p-3 bg-success-500/10 text-success-600 rounded-2xl group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-neutral-400">Online Now</p>
              <h4 className="text-2xl font-black">{onlineCount}</h4>
            </div>
          </CardBody>
        </Card>
        <Card className="glass border-0 shadow-lg group hover:bg-primary-50/10 transition-colors">
          <CardBody className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 text-primary-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-neutral-400">Total Devices</p>
              <h4 className="text-2xl font-black">{mockHotspotUsers.length}</h4>
            </div>
          </CardBody>
        </Card>
        <Card className="glass border-0 shadow-lg group hover:bg-warning-50/10 transition-colors">
          <CardBody className="p-4 flex items-center gap-4">
            <div className="p-3 bg-warning-500/10 text-warning-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-neutral-400">Expiring Soon</p>
              <h4 className="text-2xl font-black">12</h4>
            </div>
          </CardBody>
        </Card>
        <Card className="glass border-0 shadow-lg group hover:bg-error-50/10 transition-colors">
          <CardBody className="p-4 flex items-center gap-4">
            <div className="p-3 bg-error-500/10 text-error-600 rounded-2xl group-hover:scale-110 transition-transform">
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
          title="Administrative User Ledger"
          subtitle="Real-time monitoring and advanced session management"
        />

        {/* Search & Bulk Toolbar */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/10">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Find user by identity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 border-0 bg-white dark:bg-neutral-800 shadow-sm h-11 rounded-2xl"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: "all", label: "All Users" },
                { value: "online", label: "Live Only" },
                { value: "expired", label: "Expired" },
                { value: "blocked", label: "Blocked" },
              ]}
              className="w-full md:w-44"
            />
            <Button variant="outline" className="h-11 w-11 p-0 rounded-2xl border-0 glass shadow-lg"><Filter className="w-4 h-4" /></Button>
            <Button variant="outline" className="h-11 w-11 p-0 rounded-2xl border-0 glass shadow-lg"><Download className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Bulk Actions Floating Bar */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
            <div className="glass shadow-2xl rounded-[2rem] px-8 py-4 flex items-center gap-8 border border-primary-500/30 backdrop-blur-3xl bg-white/80 dark:bg-neutral-900/80">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Selected Nodes</span>
                <span className="text-sm font-black text-neutral-900 dark:text-white">{selectedIds.length} Users</span>
              </div>
              <div className="h-10 w-[1px] bg-neutral-200 dark:bg-neutral-700" />
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="hover:bg-success-50 dark:hover:bg-success-900/20 text-success-600 rounded-xl px-4" onClick={() => handleBulkAction("paid")} leftIcon={<CheckCircle2 className="w-4 h-4" />}>Mark Paid</Button>
                <Button size="sm" variant="ghost" className="hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 rounded-xl px-4" onClick={() => setShowBulkPackageModal(true)} leftIcon={<Settings className="w-4 h-4" />}>Change Plan</Button>
                <Button size="sm" variant="ghost" className="hover:bg-info-50 dark:hover:bg-info-900/20 text-info-600 rounded-xl px-4" onClick={() => handleBulkAction("sync")} leftIcon={<RefreshCw className="w-4 h-4" />}>Sync Router</Button>

                <div className="w-[1px] h-6 bg-neutral-200 dark:bg-neutral-700 mx-2" />

                <Button size="sm" variant="ghost" className="hover:text-error-600 rounded-xl" onClick={() => handleBulkAction("delete")}><Trash2 className="w-4 h-4" /></Button>
              </div>
              <Button size="sm" variant="ghost" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white" onClick={() => setSelectedIds([])}>Dismiss</Button>
            </div>
          </div>
        )}

        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/50 dark:bg-neutral-800/30 text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => e.target.checked ? setSelectedIds(filteredUsers.map(u => u.id)) : setSelectedIds([])}
                      className="rounded-lg border-neutral-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4">User Session Identity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Data Consumption</th>
                  <th className="px-6 py-4">SLA / Validity</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-all duration-300 group">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="rounded-lg border-neutral-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center text-neutral-500 group-hover:from-primary-500 group-hover:to-primary-600 group-hover:text-white transition-all shadow-sm">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black dark:text-white leading-tight">{user.username}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{user.macAddress}</span>
                            <div className="w-1 h-1 rounded-full bg-neutral-300" />
                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{user.profile}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={user.status === "online" ? "success" : user.status === "blocked" ? "error" : "default"}
                        size="sm"
                        className="rounded-full px-3 font-black uppercase italic"
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-sm font-black dark:text-white tabular-nums">{formatBytes(user.bytesTotal)}</span>
                        <div className="w-28 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: '45%' }} />
                        </div>
                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest italic">Node Uptime: {user.uptime > 0 ? formatUptime(user.uptime) : "Inactive"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.validUntil ? (
                        <div className="space-y-1">
                          <p className="text-xs font-black dark:text-neutral-300 tabular-nums">{user.validUntil}</p>
                          <p className="text-[9px] font-black text-warning-600 uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Session Timeout
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start">
                          <span className="text-xs font-black text-success-600 italic tracking-tight uppercase">Permanent SLA</span>
                          <span className="text-[9px] font-black text-neutral-400 uppercase">Enterprise Node</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button
                          className="h-10 w-10 rounded-2xl bg-success-50 dark:bg-success-900/10 text-success-600 flex items-center justify-center hover:bg-success-500 hover:text-white transition-all shadow-sm"
                          title="Process Payment"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-2xl hover:bg-white dark:hover:bg-neutral-800 shadow-sm"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-2xl hover:bg-white dark:hover:bg-neutral-800 shadow-sm"><Edit2 className="w-4 h-4" /></Button>
                        <Dropdown
                          trigger={<Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-2xl"><MoreVertical className="w-5 h-5" /></Button>}
                          items={[
                            { label: "Credentials Reset", icon: <Settings className="w-4 h-4" /> },
                            { label: "Force Session Drop", icon: <Pause className="w-4 h-4" /> },
                            { label: "Blacklist Node", icon: <ShieldAlert className="w-4 h-4" />, danger: true },
                          ]}
                        />
                        <Button variant="ghost" size="sm" className="h-10 px-4 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-black opacity-0 group-hover:opacity-100 transition-all"><ChevronRight className="w-6 h-6" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Protocol Command Execution"
        size="sm"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-700">
            <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Hotspot Action</p>
              <p className="text-sm font-black dark:text-white uppercase italic">{actionType}</p>
            </div>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
            Authorized to execute <b>{actionType}</b> for <span className="text-primary-600 font-black">{selectedIds.length} guest nodes</span>? This will propagate across all core network controllers.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold" onClick={() => setShowConfirmModal(false)}>Discard Action</Button>
            <Button className="flex-1 h-12 rounded-2xl font-black bg-primary-600" onClick={() => setShowConfirmModal(false)}>Confirm & Deploy</Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Package Modal */}
      <Modal
        isOpen={showBulkPackageModal}
        onClose={() => setShowBulkPackageModal(false)}
        title="Bulk Profile Migration"
        size="md"
      >
        <div className="space-y-6">
          <Alert variant="warning" title="SLA Modification Warning">
            Migrating profiles for multiple nodes will force recalculate session validity and link constraints.
          </Alert>

          <div className="grid grid-cols-1 gap-4">
            <Select
              label="Target Hotspot Profile"
              value={newProfile}
              onChange={setNewProfile}
              options={[
                { value: "1h", label: "Guest_1Hr (Limited)" },
                { value: "24h", label: "Guest_24Hr (Full)" },
                { value: "vip", label: "VIP_Unlimited (Unrestricted)" },
                { value: "staff", label: "Staff_SLA (Internal)" },
              ]}
              className="h-12 rounded-2xl"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold" onClick={() => setShowBulkPackageModal(false)}>Abort</Button>
            <Button className="flex-1 h-12 rounded-2xl font-black bg-primary-600" onClick={() => setShowBulkPackageModal(false)}>Apply Migration</Button>
          </div>
        </div>
      </Modal>

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
            <Input label="Username / Voucher Code" placeholder="GUEST_XXXX" className="h-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-0 shadow-sm" />
            <Input label="Session Password" type="password" placeholder="••••••••" className="h-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-0 shadow-sm" />
            <Select
              label="Assignment Profile"
              value="1h"
              onChange={() => { }}
              options={[
                { value: "1h", label: "Guest (1 Hour)" },
                { value: "24h", label: "Guest (24 Hours)" },
                { value: "permanent", label: "Executive (Permanent)" },
              ]}
              className="h-12 rounded-2xl"
            />
            <Input label="Binding MAC Address (Optional)" placeholder="00:00:00:00:00:00" className="h-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-0 shadow-sm" />
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-700">
            <p className="text-[10px] font-black uppercase text-neutral-400 mb-3 tracking-widest">Optional Attributes</p>
            <Input label="Administrative Comment" placeholder="e.g. Conference Attendee Table 4" className="h-12 rounded-2xl bg-white dark:bg-neutral-900 border-0 shadow-sm" />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button variant="outline" className="h-12 px-8 rounded-2xl font-bold text-neutral-500" onClick={() => setShowAddModal(false)}>Discard</Button>
            <Button className="h-12 px-8 rounded-2xl font-black shadow-lg shadow-primary-500/20" leftIcon={<CheckCircle2 className="w-4 h-4" />} onClick={() => setShowAddModal(false)}>Deploy User Access</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
