"use client";

import React, { useState, useCallback } from "react";
import {
  Play, Pause, RotateCcw, Search, Filter, Download, RefreshCw,
  Clock, Wifi, WifiOff, Users, Activity, UserPlus, Settings, Trash2, Edit2, Eye,
} from "lucide-react";
import { Button, Card, CardBody, CardHeader, Input, Badge, Modal, Table, Select, Progress, Dropdown, Alert } from "@/components";
import { cn } from "@/lib/utils";

// Format bytes to human readable
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Format uptime
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

// Format date
const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

// Get status badge variant
const getStatusBadge = (status: string): "success" | "warning" | "error" | "info" | "default" => {
  const variants: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
    online: "success",
    expired: "warning",
    disabled: "default",
    blocked: "error",
  };
  return variants[status] || "info";
};

// Mock data
const mockHotspotUsers = [
  {
    id: "1",
    username: "guest001",
    password: "guest123",
    profile: "Guest-1hr",
    macAddress: "AA:BB:CC:DD:EE:01",
    ipAddress: "10.0.10.100",
    uptime: 1800,
    bytesIn: 1024 * 1024 * 45,
    bytesOut: 1024 * 1024 * 120,
    lastActivity: Date.now() - 60000,
    status: "online",
    comment: "Guest user - 1 hour pass",
    validUntil: Date.now() + 3600000,
  },
  {
    id: "2",
    username: "visitor002",
    password: "visitor456",
    profile: "Visitor-24hr",
    macAddress: "AA:BB:CC:DD:EE:02",
    ipAddress: "10.0.10.101",
    uptime: 43200,
    bytesIn: 1024 * 1024 * 150,
    bytesOut: 1024 * 1024 * 350,
    lastActivity: Date.now() - 300000,
    status: "online",
    comment: "Conference attendee",
    validUntil: Date.now() + 82800000,
  },
  {
    id: "3",
    username: "temp003",
    password: "temp789",
    profile: "Temp-Daily",
    macAddress: "AA:BB:CC:DD:EE:03",
    ipAddress: "10.0.10.102",
    uptime: 0,
    bytesIn: 0,
    bytesOut: 0,
    lastActivity: Date.now() - 86400000 * 2,
    status: "expired",
    comment: "Temporary access",
    validUntil: Date.now() - 86400000,
  },
  {
    id: "4",
    username: "permanent004",
    password: "perm1234",
    profile: "Permanent",
    macAddress: "AA:BB:CC:DD:EE:04",
    ipAddress: "10.0.10.103",
    uptime: 86400 * 15,
    bytesIn: 1024 * 1024 * 500,
    bytesOut: 1024 * 1024 * 1024 * 2.5,
    lastActivity: Date.now() - 10000,
    status: "online",
    comment: "Staff member",
    validUntil: null,
  },
  {
    id: "5",
    username: "blocked005",
    password: "blocked123",
    profile: "Guest-1hr",
    macAddress: "AA:BB:CC:DD:EE:05",
    ipAddress: "10.0.10.104",
    uptime: 0,
    bytesIn: 0,
    bytesOut: 0,
    lastActivity: Date.now() - 86400000 * 5,
    status: "blocked",
    comment: "Abused privileges",
    validUntil: null,
  },
];

export default function HotspotPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionType, setActionType] = useState<"enable" | "disable" | "delete">("enable");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionUserId, setActionUserId] = useState<string>("");

  const filteredUsers = mockHotspotUsers.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.macAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.ipAddress.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onlineUsers = mockHotspotUsers.filter((u) => u.status === "online").length;
  const totalTraffic = mockHotspotUsers.reduce((acc, u) => acc + u.bytesIn + u.bytesOut, 0);

  const handleUserAction = useCallback((userId: string, action: "enable" | "disable" | "delete") => {
    setActionUserId(userId);
    setActionType(action);
    setShowActionsModal(true);
  }, []);

  const handleBulkAction = useCallback((action: "enable" | "disable" | "delete") => {
    if (selectedUsers.length === 0) return;
    setActionType(action);
    setShowActionsModal(true);
  }, [selectedUsers]);

  const confirmAction = useCallback(async () => {
    setActionLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setActionLoading(false);
    setShowActionsModal(false);
    setSelectedUsers([]);
  }, []);

  const toggleUserSelection = useCallback((id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  }, [filteredUsers, selectedUsers.length]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Hotspot Users</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Manage hotspot users and guests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => {}}
          >
            Refresh
          </Button>
          <Button leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            Add User
          </Button>
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Total Users</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{mockHotspotUsers.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-100 dark:bg-success-900/30 rounded-lg">
                <Wifi className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Online</p>
                <p className="text-2xl font-bold text-success-600">{onlineUsers}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-100 dark:bg-warning-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Expired</p>
                <p className="text-2xl font-bold text-warning-600">
                  {mockHotspotUsers.filter((u) => u.status === "expired").length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info-100 dark:bg-info-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-info-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Total Traffic</p>
                <p className="text-2xl font-bold text-info-600">{formatBytes(totalTraffic)}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "online", label: "Online" },
                  { value: "expired", label: "Expired" },
                  { value: "disabled", label: "Disabled" },
                  { value: "blocked", label: "Blocked" },
                ]}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800">
          <CardBody className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" leftIcon={<Play className="w-3 h-3" />} onClick={() => handleBulkAction("enable")}>
                  Enable
                </Button>
                <Button variant="outline" size="sm" leftIcon={<Pause className="w-3 h-3" />} onClick={() => handleBulkAction("disable")}>
                  Disable
                </Button>
                <Button variant="outline" size="sm" leftIcon={<Trash2 className="w-3 h-3" />} onClick={() => handleBulkAction("delete")}>
                  Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUsers([])}>
                  Clear
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader title="Hotspot Users" subtitle={`${filteredUsers.length} users found`} />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="px-4 py-3 w-12">
                    <input type="checkbox" className="rounded border-neutral-300" checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0} onChange={toggleSelectAll} />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Profile</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">IP / MAC</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Uptime</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Traffic</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Valid Until</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-4 py-4">
                      <input type="checkbox" className="rounded border-neutral-300" checked={selectedUsers.includes(user.id)} onChange={() => toggleUserSelection(user.id)} />
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={getStatusBadge(user.status)} size="sm">{user.status}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{user.username}</p>
                        <p className="text-sm text-neutral-500">{user.comment}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-neutral-600 dark:text-neutral-300">{user.profile}</td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <p className="font-mono">{user.ipAddress}</p>
                        <p className="text-neutral-500">{user.macAddress}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {user.status === "online" ? (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-neutral-400" />
                          <span>{formatUptime(user.uptime)}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-600 dark:text-neutral-300">
                      <div className="flex items-center gap-1">
                        <span className="text-success-500">↑</span>
                        <span>{formatBytes(user.bytesIn)}</span>
                        <span className="text-neutral-400">/</span>
                        <span className="text-info-500">↓</span>
                        <span>{formatBytes(user.bytesOut)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-600 dark:text-neutral-300">
                      {user.validUntil ? (
                        <span className={user.validUntil < Date.now() ? "text-error-600" : ""}>
                          {formatDate(user.validUntil)}
                        </span>
                      ) : (
                        <span className="text-success-600">Never expires</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Dropdown
                        trigger={
                          <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                            <Settings className="w-4 h-4" />
                          </button>
                        }
                        items={[
                          { label: "View Details", icon: <Eye className="w-4 h-4" />, onClick: () => {} },
                          { label: "Edit", icon: <Edit2 className="w-4 h-4" />, onClick: () => {} },
                          { label: "Enable", icon: <Play className="w-4 h-4" />, onClick: () => handleUserAction(user.id, "enable"), disabled: user.status === "online" },
                          { label: "Disable", icon: <Pause className="w-4 h-4" />, onClick: () => handleUserAction(user.id, "disable"), disabled: user.status !== "online" },
                          { label: "Delete", icon: <Trash2 className="w-4 h-4" />, onClick: () => handleUserAction(user.id, "delete"), danger: true },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Action Modal */}
      <Modal
        isOpen={showActionsModal}
        onClose={() => !actionLoading && setShowActionsModal(false)}
        title={actionType === "enable" ? "Enable User(s)" : actionType === "disable" ? "Disable User(s)" : "Delete User(s)"}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowActionsModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant={actionType === "delete" ? "danger" : "primary"} onClick={confirmAction} loading={actionLoading}>
              {actionType === "enable" ? "Enable" : actionType === "disable" ? "Disable" : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-neutral-600 dark:text-neutral-300">
          Are you sure you want to {actionType} the selected user{selectedUsers.length > 1 ? "s" : ""}?
        </p>
      </Modal>

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Hotspot User" size="lg">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Username" placeholder="Enter username" required />
            <Input label="Password" type="password" placeholder="Enter password" required />
          </div>
          <Select
            label="Profile"
            options={[
              { value: "guest-1hr", label: "Guest - 1 Hour" },
              { value: "guest-24hr", label: "Guest - 24 Hours" },
              { value: "visitor-7day", label: "Visitor - 7 Days" },
              { value: "temp-daily", label: "Temporary - Daily" },
              { value: "permanent", label: "Permanent" },
            ]}
          />
          <Input label="MAC Address (optional)" placeholder="AA:BB:CC:DD:EE:FF" />
          <Input label="Comment (optional)" placeholder="Add a note" />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Add User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
