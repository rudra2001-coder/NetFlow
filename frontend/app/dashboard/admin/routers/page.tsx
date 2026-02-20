'use client';

import { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye,
  RefreshCw, Power, Settings, Shield, Wifi, Clock, Cpu,
  HardDrive, Signal, Server,
} from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Input, Select, Modal, Badge, Progress, Dropdown, Tabs, Alert } from '@/components';
import { cn } from '@/lib/utils';
import { StatusDot } from '@/components/ui/Badge';

// Types
interface Router {
  id: string;
  name: string;
  ip: string;
  port: number;
  username: string;
  location: string;
  description: string;
  snmpCommunity: string;
  autoPolling: boolean;
  status: 'online' | 'offline' | 'warning';
  uptime: string;
  cpu: number;
  memory: number;
  disk: number;
  lastChecked: string;
  version: string;
  interfaces: InterfaceInfo[];
}

interface InterfaceInfo {
  name: string;
  status: 'up' | 'down';
  rx: number;
  tx: number;
  rxErrors: number;
  txErrors: number;
}

interface RouterFormData {
  name: string;
  ip: string;
  port: number;
  username: string;
  password: string;
  location: string;
  description: string;
  snmpCommunity: string;
  autoPolling: boolean;
}

// Mock Data
const mockRouters: Router[] = [
  {
    id: '1',
    name: 'MikroTik-HQ-01',
    ip: '10.0.1.1',
    port: 8728,
    username: 'admin',
    location: 'Headquarters',
    description: 'Main router for HQ building',
    snmpCommunity: 'public',
    autoPolling: true,
    status: 'online',
    uptime: '45d 12h 34m',
    cpu: 45,
    memory: 62,
    disk: 38,
    lastChecked: '2 minutes ago',
    version: 'RouterOS 7.14.3',
    interfaces: [
      { name: 'ether1', status: 'up', rx: 1250000, tx: 890000, rxErrors: 0, txErrors: 0 },
      { name: 'ether2', status: 'up', rx: 890000, tx: 1250000, rxErrors: 0, txErrors: 0 },
      { name: 'wlan1', status: 'up', rx: 450000, tx: 320000, rxErrors: 2, txErrors: 1 },
    ],
  },
  {
    id: '2',
    name: 'MikroTik-Branch-02',
    ip: '10.0.2.1',
    port: 8728,
    username: 'admin',
    location: 'Branch Office',
    description: 'Secondary router for branch',
    snmpCommunity: 'public',
    autoPolling: true,
    status: 'warning',
    uptime: '12d 3h 15m',
    cpu: 78,
    memory: 81,
    disk: 45,
    lastChecked: '5 minutes ago',
    version: 'RouterOS 7.12.1',
    interfaces: [
      { name: 'ether1', status: 'up', rx: 320000, tx: 180000, rxErrors: 0, txErrors: 0 },
      { name: 'wlan1', status: 'down', rx: 0, tx: 0, rxErrors: 15, txErrors: 8 },
    ],
  },
  {
    id: '3',
    name: 'MikroTik-DC-01',
    ip: '10.0.3.1',
    port: 8728,
    username: 'admin',
    location: 'Data Center',
    description: 'Data center core router',
    snmpCommunity: 'public',
    autoPolling: true,
    status: 'online',
    uptime: '120d 8h 45m',
    cpu: 32,
    memory: 45,
    disk: 28,
    lastChecked: '1 minute ago',
    version: 'RouterOS 7.14.3',
    interfaces: [
      { name: 'sfp1', status: 'up', rx: 5400000, tx: 3200000, rxErrors: 0, txErrors: 0 },
      { name: 'sfp2', status: 'up', rx: 3200000, tx: 5400000, rxErrors: 0, txErrors: 0 },
      { name: 'ether1', status: 'up', rx: 890000, tx: 670000, rxErrors: 0, txErrors: 0 },
    ],
  },
];

// Format bytes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Get status badge
const getStatusBadge = (status: Router['status']) => {
  const variants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    online: 'success',
    warning: 'warning',
    offline: 'error',
  };
  return variants[status] || 'default';
};

export default function RoutersPage() {
  const [routers] = useState<Router[]>(mockRouters);
  const [selectedRouter, setSelectedRouter] = useState<Router | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredRouters = useMemo(() => {
    return routers.filter(router => {
      const matchesSearch = router.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        router.ip.includes(searchQuery) ||
        router.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || router.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [routers, searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    total: routers.length,
    online: routers.filter(r => r.status === 'online').length,
    warning: routers.filter(r => r.status === 'warning').length,
    offline: routers.filter(r => r.status === 'offline').length,
    avgCpu: Math.round(routers.reduce((sum, r) => sum + r.cpu, 0) / routers.length),
    avgMemory: Math.round(routers.reduce((sum, r) => sum + r.memory, 0) / routers.length),
  }), [routers]);

  const getProgressVariant = (value: number): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
    if (value > 80) return 'danger';
    if (value > 60) return 'warning';
    return 'success';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Routers</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Manage and monitor your MikroTik routers
          </p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
          Add Router
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Server className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Total</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-100 dark:bg-success-900/30 rounded-lg">
                <Signal className="w-5 h-5 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Online</p>
                <p className="text-2xl font-bold text-success-600">{stats.online}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-100 dark:bg-warning-900/30 rounded-lg">
                <Wifi className="w-5 h-5 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Warning</p>
                <p className="text-2xl font-bold text-warning-600">{stats.warning}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-error-100 dark:bg-error-900/30 rounded-lg">
                <WifiOff className="w-5 h-5 text-error-600 dark:text-error-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Offline</p>
                <p className="text-2xl font-bold text-error-600">{stats.offline}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info-100 dark:bg-info-900/30 rounded-lg">
                <Cpu className="w-5 h-5 text-info-600 dark:text-info-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Avg CPU</p>
                <p className="text-2xl font-bold text-info-600">{stats.avgCpu}%</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <HardDrive className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Avg RAM</p>
                <p className="text-2xl font-bold text-primary-600">{stats.avgMemory}%</p>
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
                placeholder="Search routers..."
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
                  { value: 'all', label: 'All Status' },
                  { value: 'online', label: 'Online' },
                  { value: 'warning', label: 'Warning' },
                  { value: 'offline', label: 'Offline' },
                ]}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Router List */}
      <Card>
        <CardHeader title="Network Devices" subtitle={`${filteredRouters.length} routers found`} />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Router</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">CPU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Memory</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Uptime</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRouters.map(router => (
                  <tr key={router.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          router.status === 'online' && 'bg-success-100 dark:bg-success-900/30',
                          router.status === 'warning' && 'bg-warning-100 dark:bg-warning-900/30',
                          router.status === 'offline' && 'bg-error-100 dark:bg-error-900/30'
                        )}>
                          <Server className={cn(
                            'w-5 h-5',
                            router.status === 'online' && 'text-success-600',
                            router.status === 'warning' && 'text-warning-600',
                            router.status === 'offline' && 'text-error-600'
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{router.name}</p>
                          <p className="text-sm text-neutral-500">{router.version}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                        {router.ip}:{router.port}
                      </code>
                    </td>
                    <td className="px-4 py-4 text-neutral-600 dark:text-neutral-300">{router.location}</td>
                    <td className="px-4 py-4">
                      <Badge variant={getStatusBadge(router.status)} size="sm">
                        {router.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Progress value={router.cpu} variant={getProgressVariant(router.cpu)} size="sm" className="w-16" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-300 w-10">{router.cpu}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Progress value={router.memory} variant={getProgressVariant(router.memory)} size="sm" className="w-16" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-300 w-10">{router.memory}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-neutral-600 dark:text-neutral-300">{router.uptime}</td>
                    <td className="px-4 py-4 text-right">
                      <Dropdown
                        trigger={
                          <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        }
                        items={[
                          { label: 'View Details', icon: <Eye className="w-4 h-4" />, onClick: () => { setSelectedRouter(router); setShowDetailsModal(true); } },
                          { label: 'Edit', icon: <Edit2 className="w-4 h-4" /> },
                          { label: 'Restart', icon: <RefreshCw className="w-4 h-4" /> },
                          { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, danger: true },
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

      {/* Add Router Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Router" size="lg">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Router Name" placeholder="e.g., MikroTik-HQ-01" required />
            <Input label="IP Address" placeholder="e.g., 10.0.1.1" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Port" type="number" defaultValue={8728} required />
            <Input label="Username" defaultValue="admin" required />
          </div>
          <Input label="Password" type="password" placeholder="Enter API password" required />
          <Input label="Location" placeholder="e.g., Headquarters" />
          <Input label="Description" placeholder="Optional description" />
          <Input label="SNMP Community" defaultValue="public" />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="autoPolling" className="rounded" defaultChecked />
            <label htmlFor="autoPolling" className="text-sm text-neutral-600 dark:text-neutral-300">
              Enable automatic polling and monitoring
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Add Router</Button>
          </div>
        </form>
      </Modal>

      {/* Router Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title={selectedRouter?.name || 'Router Details'} size="xl">
        {selectedRouter && (
          <div className="space-y-6">
            <Tabs
              tabs={[
                { id: 'overview', label: 'Overview', content: (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                      <p className="text-sm text-neutral-500">IP Address</p>
                      <p className="font-mono font-medium">{selectedRouter.ip}:{selectedRouter.port}</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                      <p className="text-sm text-neutral-500">Location</p>
                      <p className="font-medium">{selectedRouter.location}</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                      <p className="text-sm text-neutral-500">Version</p>
                      <p className="font-medium">{selectedRouter.version}</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                      <p className="text-sm text-neutral-500">Uptime</p>
                      <p className="font-medium">{selectedRouter.uptime}</p>
                    </div>
                  </div>
                )},
                { id: 'interfaces', label: 'Interfaces', content: (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Interface</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">RX</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">TX</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">RX Errors</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">TX Errors</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRouter.interfaces.map(iface => (
                          <tr key={iface.name} className="border-b border-neutral-100 dark:border-neutral-800">
                            <td className="px-4 py-3 font-medium">{iface.name}</td>
                            <td className="px-4 py-3">
                              <Badge variant={iface.status === 'up' ? 'success' : 'error'} size="sm">
                                {iface.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">{formatBytes(iface.rx)}</td>
                            <td className="px-4 py-3">{formatBytes(iface.tx)}</td>
                            <td className={cn(iface.rxErrors > 0 && 'text-error-600')}>{iface.rxErrors}</td>
                            <td className={cn(iface.txErrors > 0 && 'text-error-600')}>{iface.txErrors}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )},
                { id: 'resources', label: 'Resources', content: (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">CPU Usage</span>
                        <span className="text-sm text-neutral-500">{selectedRouter.cpu}%</span>
                      </div>
                      <Progress value={selectedRouter.cpu} variant={getProgressVariant(selectedRouter.cpu)} size="lg" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Memory Usage</span>
                        <span className="text-sm text-neutral-500">{selectedRouter.memory}%</span>
                      </div>
                      <Progress value={selectedRouter.memory} variant={getProgressVariant(selectedRouter.memory)} size="lg" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Disk Usage</span>
                        <span className="text-sm text-neutral-500">{selectedRouter.disk}%</span>
                      </div>
                      <Progress value={selectedRouter.disk} variant={getProgressVariant(selectedRouter.disk)} size="lg" />
                    </div>
                  </div>
                )},
              ]}
              defaultTab="overview"
              onChange={setActiveTab}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>
                Sync Data
              </Button>
              <Button variant="outline" leftIcon={<Power className="w-4 h-4" />}>
                Restart Router
              </Button>
              <Button leftIcon={<Settings className="w-4 h-4" />}>
                Configure
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Helper icon components
function WifiOff({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
