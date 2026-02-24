"use client";

import React, { useState, useMemo } from "react";
import {
  Upload, Download, FileSpreadsheet, Users, CheckCircle,
  XCircle, AlertCircle, ChevronRight, Search, Filter,
  RefreshCw, Eye, Trash2, Edit2, Plus, X, Wifi, Network,
  Server, CheckSquare, Square, Copy, FileText
} from "lucide-react";
import {
  Button, Card, CardBody, CardHeader, Input, Badge, Modal,
  Select, Progress, Alert
} from "@/components";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface RouterProfile {
  id: string;
  name: string;
  type: "PPPoE" | "Hotspot";
  server: string;
  profileName: string;
  localAddress: string;
  remoteAddress: string;
  rateLimit: string;
  activeUsers: number;
  status: "active" | "disabled";
}

interface MikroTikClient {
  id: string;
  name: string;
  password: string;
  profile: string;
  ipAddress: string;
  macAddress: string;
  router: string;
  server: string;
  type: "PPPoE" | "Hotspot";
  status: "active" | "disabled" | "pending";
  selected: boolean;
  hasCredentials: boolean;
}

// Mock data for router profiles
const mockRouterProfiles: RouterProfile[] = [
  {
    id: "rp_1",
    name: "PPPoE Static 100M",
    type: "PPPoE",
    server: "pppoe-main",
    profileName: "PPPoE_Static_100M",
    localAddress: "10.10.0.1",
    remoteAddress: "10.10.0.0/24",
    rateLimit: "100M/100M",
    activeUsers: 245,
    status: "active"
  },
  {
    id: "rp_2",
    name: "PPPoE Static 50M",
    type: "PPPoE",
    server: "pppoe-main",
    profileName: "PPPoE_Static_50M",
    localAddress: "10.11.0.1",
    remoteAddress: "10.11.0.0/24",
    rateLimit: "50M/50M",
    activeUsers: 180,
    status: "active"
  },
  {
    id: "rp_3",
    name: "Hotspot Daily 5M",
    type: "Hotspot",
    server: "hotspot-zone-1",
    profileName: "Hotspot_Daily_5M",
    localAddress: "192.168.100.1",
    remoteAddress: "192.168.100.0/24",
    rateLimit: "5M/5M",
    activeUsers: 89,
    status: "active"
  },
  {
    id: "rp_4",
    name: "Hotspot Hourly 2M",
    type: "Hotspot",
    server: "hotspot-zone-1",
    profileName: "Hotspot_Hourly_2M",
    localAddress: "192.168.101.1",
    remoteAddress: "192.168.101.0/24",
    rateLimit: "2M/2M",
    activeUsers: 45,
    status: "active"
  },
  {
    id: "rp_5",
    name: "PPPoE Business 200M",
    type: "PPPoE",
    server: "pppoe-business",
    profileName: "PPPoE_Business_200M",
    localAddress: "10.12.0.1",
    remoteAddress: "10.12.0.0/24",
    rateLimit: "200M/200M",
    activeUsers: 52,
    status: "active"
  },
  {
    id: "rp_6",
    name: "Hotspot Weekly 10M",
    type: "Hotspot",
    server: "hotspot-zone-2",
    profileName: "Hotspot_Weekly_10M",
    localAddress: "192.168.102.1",
    remoteAddress: "192.168.102.0/24",
    rateLimit: "10M/10M",
    activeUsers: 120,
    status: "active"
  }
];

// Mock data for MikroTik clients
const mockMikroTikClients: MikroTikClient[] = [
  {
    id: "mt_1",
    name: "client001",
    password: "pass123",
    profile: "PPPoE_Static_100M",
    ipAddress: "10.10.1.101",
    macAddress: "FC:A1:3E:21:00:01",
    router: "MikroTik-Main",
    server: "pppoe-main",
    type: "PPPoE",
    status: "active",
    selected: false,
    hasCredentials: true
  },
  {
    id: "mt_2",
    name: "client002",
    password: "pass456",
    profile: "PPPoE_Static_100M",
    ipAddress: "10.10.1.102",
    macAddress: "FC:A1:3E:21:00:02",
    router: "MikroTik-Main",
    server: "pppoe-main",
    type: "PPPoE",
    status: "active",
    selected: false,
    hasCredentials: true
  },
  {
    id: "mt_3",
    name: "guest_user_1",
    password: "guest123",
    profile: "Hotspot_Daily_5M",
    ipAddress: "192.168.100.50",
    macAddress: "FC:A1:3E:21:00:03",
    router: "MikroTik-Hotspot-1",
    server: "hotspot-zone-1",
    type: "Hotspot",
    status: "active",
    selected: false,
    hasCredentials: true
  },
  {
    id: "mt_4",
    name: "client003",
    password: "",
    profile: "PPPoE_Static_50M",
    ipAddress: "10.11.1.50",
    macAddress: "FC:A1:3E:21:00:04",
    router: "MikroTik-Main",
    server: "pppoe-main",
    type: "PPPoE",
    status: "pending",
    selected: false,
    hasCredentials: false
  },
  {
    id: "mt_5",
    name: "client004",
    password: "pass789",
    profile: "PPPoE_Business_200M",
    ipAddress: "10.12.1.25",
    macAddress: "FC:A1:3E:21:00:05",
    router: "MikroTik-Business",
    server: "pppoe-business",
    type: "PPPoE",
    status: "active",
    selected: false,
    hasCredentials: true
  },
  {
    id: "mt_6",
    name: "guest_user_2",
    password: "",
    profile: "Hotspot_Weekly_10M",
    ipAddress: "192.168.102.30",
    macAddress: "FC:A1:3E:21:00:06",
    router: "MikroTik-Hotspot-2",
    server: "hotspot-zone-2",
    type: "Hotspot",
    status: "pending",
    selected: false,
    hasCredentials: false
  }
];

// Generate Excel data from selected clients
const generateExcelData = (clients: MikroTikClient[]) => {
  return clients.map(client => ({
    username: client.name,
    password: client.password || "dummy_password",
    profile: client.profile,
    ipAddress: client.ipAddress,
    macAddress: client.macAddress,
    router: client.router,
    server: client.server,
    customerName: "",
    phone: "",
    email: "",
    address: "",
    status: client.hasCredentials ? "Actual" : "Dummy"
  }));
};

// ============================================================================
// Main Component
// ============================================================================

export default function BulkLineImportPage() {
  const [activeTab, setActiveTab] = useState<"profiles" | "clients" | "export">("profiles");
  const [profiles] = useState<RouterProfile[]>(mockRouterProfiles);
  const [clients, setClients] = useState<MikroTikClient[]>(mockMikroTikClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [serverFilter, setServerFilter] = useState<string>("all");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingClient, setAddingClient] = useState(false);

  // Get unique servers for filtering
  const servers = useMemo(() => {
    const uniqueServers = new Set(profiles.map(p => p.server));
    return Array.from(uniqueServers).map(s => ({ value: s, label: s }));
  }, [profiles]);

  // Filter profiles
  const filteredProfiles = profiles.filter(profile => {
    const matchesType = typeFilter === "all" || profile.type === typeFilter;
    const matchesServer = serverFilter === "all" || profile.server === serverFilter;
    const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          profile.profileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesServer && matchesSearch;
  });

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesType = typeFilter === "all" || client.type === typeFilter;
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.ipAddress.includes(searchQuery);
    return matchesType && matchesSearch;
  });

  // Toggle client selection
  const toggleClientSelection = (clientId: string) => {
    setClients(prev => prev.map(client => 
      client.id === clientId ? { ...client, selected: !client.selected } : client
    ));
  };

  // Select all clients
  const selectAllClients = () => {
    const allSelected = filteredClients.every(c => c.selected);
    if (allSelected) {
      setClients(prev => prev.map(c => ({ ...c, selected: false })));
    } else {
      setClients(prev => prev.map(c => ({ ...c, selected: true })));
    }
  };

  // Export to Excel
  const handleExport = () => {
    const selectedClientsList = clients.filter(c => c.selected);
    if (selectedClientsList.length === 0) {
      alert("Please select at least one client to export");
      return;
    }
    setShowExportModal(true);
  };

  const confirmExport = () => {
    setExporting(true);
    setTimeout(() => {
      const exportData = generateExcelData(clients.filter(c => c.selected));
      
      // Create CSV content
      const headers = Object.keys(exportData[0]).join(",");
      const rows = exportData.map(row => Object.values(row).join(","));
      const csvContent = [headers, ...rows].join("\n");
      
      // Download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `bulk_line_import_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExporting(false);
      setShowExportModal(false);
      alert(`Successfully exported ${exportData.length} clients!`);
    }, 1500);
  };

  // Add single client
  const handleAddSingleClient = (client: MikroTikClient) => {
    alert(`Adding client ${client.name} to the system...`);
  };

  // Add all selected clients
  const handleBulkAdd = () => {
    const selected = clients.filter(c => c.selected);
    if (selected.length === 0) {
      alert("Please select at least one client to add");
      return;
    }
    setAddingClient(true);
    setTimeout(() => {
      setAddingClient(false);
      alert(`Successfully added ${selected.length} clients to the system!`);
      setClients(prev => prev.map(c => ({ ...c, selected: false })));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bulk Line Import</h1>
            <p className="text-sm text-gray-500 mt-1">
              Import client lines from MikroTik with PPOE and Hotspot profiles
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </Button>
            <Button
              onClick={handleBulkAdd}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Selected ({clients.filter(c => c.selected).length})
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profiles")}
            className={cn(
              "pb-3 px-1 text-sm font-medium transition-colors border-b-2",
              activeTab === "profiles"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <Server className="w-4 h-4 inline-block mr-2" />
            Server Profiles
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={cn(
              "pb-3 px-1 text-sm font-medium transition-colors border-b-2",
              activeTab === "clients"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            Client List
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] max-w-[300px]">
            <Input
              placeholder="Search profiles or clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            value={typeFilter}
            onChange={(value) => setTypeFilter(value)}
            options={[
              { value: "all", label: "All Types" },
              { value: "PPPoE", label: "PPPoE" },
              { value: "Hotspot", label: "Hotspot" }
            ]}
            className="w-40"
          />
          {activeTab === "profiles" && (
            <Select
              value={serverFilter}
              onChange={(value) => setServerFilter(value)}
              options={[
                { value: "all", label: "All Servers" },
                ...servers
              ]}
              className="w-48"
            />
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="info">
              {activeTab === "profiles" ? filteredProfiles.length : filteredClients.length} items
            </Badge>
            <Badge variant={clients.filter(c => c.selected).length > 0 ? "success" : "default"}>
              {clients.filter(c => c.selected).length} selected
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "profiles" ? (
          /* Profiles Tab */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-md transition-shadow">
                <CardBody>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        profile.type === "PPPoE" ? "bg-purple-100" : "bg-orange-100"
                      )}>
                        {profile.type === "PPPoE" ? (
                          <Network className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Wifi className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                        <p className="text-sm text-gray-500">{profile.server}</p>
                      </div>
                    </div>
                    <Badge variant={profile.type === "PPPoE" ? "ppp" : "warning"}>
                      {profile.type}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Profile:</span>
                      <span className="font-medium">{profile.profileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Local IP:</span>
                      <span className="font-mono">{profile.localAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Remote IP:</span>
                      <span className="font-mono">{profile.remoteAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rate Limit:</span>
                      <span className="font-medium">{profile.rateLimit}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {profile.activeUsers} active users
                        </span>
                      </div>
                      <Badge variant={profile.status === "active" ? "success" : "error"}>
                        {profile.status}
                      </Badge>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          /* Clients Tab */
          <Card>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={selectAllClients}
                          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
                        >
                          {filteredClients.every(c => c.selected) ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                          Select
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Username
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        IP Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Profile
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Server
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Credentials
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className={cn("hover:bg-gray-50", client.selected && "bg-blue-50")}>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleClientSelection(client.id)}
                            className="text-gray-500 hover:text-blue-600"
                          >
                            {client.selected ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{client.name}</p>
                            <p className="text-xs text-gray-500">{client.router}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">{client.ipAddress}</td>
                        <td className="px-4 py-3 text-sm">{client.profile}</td>
                        <td className="px-4 py-3 text-sm">{client.server}</td>
                        <td className="px-4 py-3">
                          <Badge variant={client.type === "PPPoE" ? "ppp" : "warning"}>
                            {client.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {client.hasCredentials ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm">Actual</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-orange-600">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">Dummy</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant={client.status === "active" ? "success" : client.status === "pending" ? "warning" : "error"}
                          >
                            {client.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddSingleClient(client)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Clients to Excel"
        size="lg"
      >
        <div className="space-y-4">
          <Alert variant="info">
            <span>
              The exported file will contain {clients.filter(c => c.selected).length} clients.
              Clients without credentials will have dummy password data.
            </span>
          </Alert>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Export Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Selected:</span>
                <span className="font-medium">{clients.filter(c => c.selected).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">With Actual Credentials:</span>
                <span className="font-medium text-green-600">
                  {clients.filter(c => c.selected && c.hasCredentials).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">With Dummy Credentials:</span>
                <span className="font-medium text-orange-600">
                  {clients.filter(c => c.selected && !c.hasCredentials).length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowExportModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmExport}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Excel
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Adding Client Loading Modal */}
      <Modal
        isOpen={addingClient}
        onClose={() => setAddingClient(false)}
        title="Adding Clients"
        size="sm"
      >
        <div className="text-center py-8">
          <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">
            Adding {clients.filter(c => c.selected).length} clients to the system...
          </p>
        </div>
      </Modal>
    </div>
  );
}
