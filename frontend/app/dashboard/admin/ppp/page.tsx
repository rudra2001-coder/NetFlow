"use client";

import React, { useState, useCallback } from "react";
import {
  Play, Pause, RotateCcw, Search, Filter, Download, RefreshCw,
  Clock, Wifi, WifiOff, Upload, Download as DownloadIcon, Users, Activity,
} from "lucide-react";
import { Button, Card, CardBody, CardHeader, Input, Badge, Modal, Table, Select, Progress, Dropdown } from "@/components";
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
    active: "success",
    pending: "warning",
    disabled: "default",
    expired: "error",
  };
  return variants[status] || "info";
};

export default function PPPPage() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [actionType, setActionType] = useState<"start" | "stop" | "restart">("start");
  const [actionLoading, setActionLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [actionConnectionId, setActionConnectionId] = useState<string>("");

  // Mock data
  const connections = [
    {
      id: "1",
      name: "john.doe",
      ipAddress: "10.0.1.100",
      macAddress: "AA:BB:CC:DD:EE:01",
      profile: " Residential-10Mbps",
      uptime: 86400 * 5 + 3600 * 3,
      bytesIn: 1024 * 1024 * 1024 * 15.5,
      bytesOut: 1024 * 1024 * 1024 * 45.2,
      connectionCount: 1,
      lastActivity: Date.now() - 300000,
      status: "active",
      comment: "Home user - Package 1",
    },
    {
      id: "2",
      name: "jane.smith",
      ipAddress: "10.0.1.101",
      macAddress: "AA:BB:CC:DD:EE:02",
      profile: "Business-50Mbps",
      uptime: 86400 * 12 + 3600 * 8,
      bytesIn: 1024 * 1024 * 1024 * 45.8,
      bytesOut: 1024 * 1024 * 1024 * 120.3,
      connectionCount: 3,
      lastActivity: Date.now() - 60000,
      status: "active",
      comment: "Office user",
    },
    {
      id: "3",
      name: "bob.wilson",
      ipAddress: "10.0.1.102",
      macAddress: "AA:BB:CC:DD:EE:03",
      profile: "Residential-5Mbps",
      uptime: 0,
      bytesIn: 0,
      bytesOut: 0,
      connectionCount: 0,
      lastActivity: Date.now() - 86400000 * 3,
      status: "disabled",
      comment: "Payment pending",
    },
    {
      id: "4",
      name: "alice.johnson",
      ipAddress: "10.0.1.103",
      macAddress: "AA:BB:CC:DD:EE:04",
      profile: "Residential-20Mbps",
      uptime: 86400 * 2 + 3600 * 5,
      bytesIn: 1024 * 1024 * 1024 * 8.2,
      bytesOut: 1024 * 1024 * 1024 * 25.6,
      connectionCount: 2,
      lastActivity: Date.now() - 180000,
      status: "active",
      comment: "",
    },
    {
      id: "5",
      name: "charlie.brown",
      ipAddress: "10.0.1.104",
      macAddress: "AA:BB:CC:DD:EE:05",
      profile: "VIP-100Mbps",
      uptime: 86400 * 30 + 3600 * 12,
      bytesIn: 1024 * 1024 * 1024 * 500.5,
      bytesOut: 1024 * 1024 * 1024 * 1024 * 1.2,
      connectionCount: 1,
      lastActivity: Date.now() - 10000,
      status: "active",
      comment: "VIP customer",
    },
  ];

  const totalActive = connections.filter((c) => c.status === "active").length;
  const totalBandwidth = connections.reduce((acc, c) => acc + c.bytesIn + c.bytesOut, 0);

  // Filter connections
  const filteredConnections = connections.filter((conn) => {
    const matchesSearch =
      conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.ipAddress.includes(searchQuery) ||
      conn.profile.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || conn.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleConnectionAction = useCallback(
    (connectionId: string, action: "start" | "stop" | "restart") => {
      setActionConnectionId(connectionId);
      setActionType(action);
      setShowActionsModal(true);
    },
    []
  );

  const handleBulkAction = useCallback(
    (action: "start" | "stop" | "restart") => {
      if (selectedConnections.length === 0) return;
      setActionType(action);
      setShowActionsModal(true);
    },
    [selectedConnections]
  );

  const confirmAction = useCallback(async () => {
    setActionLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setActionLoading(false);
    setShowActionsModal(false);
    setSelectedConnections([]);
  }, []);

  const toggleConnectionSelection = useCallback((id: string) => {
    setSelectedConnections((prev) =>
      prev.includes(id) ? prev.filter((connId) => connId !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedConnections.length === filteredConnections.length) {
      setSelectedConnections([]);
    } else {
      setSelectedConnections(filteredConnections.map((c) => c.id));
    }
  }, [filteredConnections, selectedConnections.length]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">PPP Connections</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Manage PPPoE and PPTP connections
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
          <Button leftIcon={<Download className="w-4 h-4" />}>Export CSV</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Total Connections</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {connections.length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-100 dark:bg-success-900/30 rounded-lg">
                <Wifi className="w-5 h-5 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Active</p>
                <p className="text-2xl font-bold text-success-600">{totalActive}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info-100 dark:bg-info-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-info-600 dark:text-info-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Total Traffic</p>
                <p className="text-2xl font-bold text-info-600">{formatBytes(totalBandwidth)}</p>
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
                placeholder="Search connections..."
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
                  { value: "active", label: "Active" },
                  { value: "pending", label: "Pending" },
                  { value: "disabled", label: "Disabled" },
                  { value: "expired", label: "Expired" },
                ]}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Bulk Actions */}
      {selectedConnections.length > 0 && (
        <Card className="bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800">
          <CardBody className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                {selectedConnections.length} connection(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Play className="w-3 h-3" />}
                  onClick={() => handleBulkAction("start")}
                >
                  Enable
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Pause className="w-3 h-3" />}
                  onClick={() => handleBulkAction("stop")}
                >
                  Disable
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RotateCcw className="w-3 h-3" />}
                  onClick={() => handleBulkAction("restart")}
                >
                  Restart
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConnections([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Connections Table */}
      <Card>
        <CardHeader title="PPP Connections" subtitle={`${filteredConnections.length} connections found`} />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      className="rounded border-neutral-300"
                      checked={
                        selectedConnections.length === filteredConnections.length &&
                        filteredConnections.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Profile</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Uptime</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Traffic (In/Out)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Last Activity</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConnections.map((conn) => (
                  <tr
                    key={conn.id}
                    className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-neutral-300"
                        checked={selectedConnections.includes(conn.id)}
                        onChange={() => toggleConnectionSelection(conn.id)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={getStatusBadge(conn.status)} size="sm">
                        {conn.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{conn.name}</p>
                        <p className="text-sm text-neutral-500">{conn.macAddress}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                        {conn.ipAddress}
                      </code>
                    </td>
                    <td className="px-4 py-4 text-neutral-600 dark:text-neutral-300">{conn.profile}</td>
                    <td className="px-4 py-4">
                      {conn.status === "active" ? (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-neutral-400" />
                          <span>{formatUptime(conn.uptime)}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Upload className="w-4 h-4 text-success-500" />
                        <span>{formatBytes(conn.bytesIn)}</span>
                        <span className="text-neutral-400">/</span>
                        <DownloadIcon className="w-4 h-4 text-info-500" />
                        <span>{formatBytes(conn.bytesOut)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-500">
                      {formatDate(conn.lastActivity)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Dropdown
                        trigger={
                          <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                            <Activity className="w-4 h-4" />
                          </button>
                        }
                        items={[
                          {
                            label: "Enable",
                            icon: <Play className="w-4 h-4" />,
                            onClick: () => handleConnectionAction(conn.id, "start"),
                            disabled: conn.status === "active",
                          },
                          {
                            label: "Disable",
                            icon: <Pause className="w-4 h-4" />,
                            onClick: () => handleConnectionAction(conn.id, "stop"),
                            disabled: conn.status !== "active",
                          },
                          { label: "Restart", icon: <RotateCcw className="w-4 h-4" />, onClick: () => handleConnectionAction(conn.id, "restart") },
                          { label: "View Details", icon: <Search className="w-4 h-4" /> },
                          { label: "Edit", icon: <Activity className="w-4 h-4" /> },
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

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={showActionsModal}
        onClose={() => !actionLoading && setShowActionsModal(false)}
        title={
          actionType === "start"
            ? "Enable Connection(s)"
            : actionType === "stop"
            ? "Disable Connection(s)"
            : "Restart Connection(s)"
        }
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowActionsModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              variant={actionType === "stop" ? "danger" : "primary"}
              onClick={confirmAction}
              loading={actionLoading}
            >
              {actionType === "start"
                ? "Enable"
                : actionType === "stop"
                ? "Disable"
                : "Restart"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-300">
            Are you sure you want to {actionType} the selected connection
            {selectedConnections.length > 1 ? "s" : ""}?
          </p>
          {selectedConnections.length > 1 && (
            <p className="text-sm text-neutral-500">
              {selectedConnections.length} connection(s) will be affected.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
