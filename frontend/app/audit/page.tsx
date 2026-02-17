'use client';

import React, { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { cn, formatBytes, formatUptime } from '@/lib/utils';
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  Calendar,
  User,
  Server,
  FileText,
  Shield,
  Zap,
  Users,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Eye,
  RotateCcw,
  Activity,
  Globe,
  ArrowRight
} from 'lucide-react';

const CardBody = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 ${className || ''}`}>{children}</div>
);

// Types
interface AuditEntry {
  id: string;
  timestamp: Date;
  type: 'router' | 'ppp' | 'template' | 'policy' | 'automation' | 'user' | 'system';
  action: string;
  actor: {
    id: string;
    name: string;
    type: 'user' | 'system' | 'automation';
  };
  resource: {
    type: string;
    id: string;
    name: string;
  };
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  status: 'success' | 'failed' | 'pending';
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

// Mock data
const mockAuditEntries: AuditEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    type: 'router',
    action: 'Configuration Updated',
    actor: { id: 'u1', name: 'admin@netflow', type: 'user' },
    resource: { type: 'router', id: 'r1', name: 'RTR-HQ-01' },
    changes: [
      { field: 'firewall.enabled', oldValue: false, newValue: true },
      { field: 'bandwidth.limit', oldValue: 1000000000, newValue: 2000000000 },
    ],
    status: 'success',
    ipAddress: '192.168.1.100',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: 'ppp',
    action: 'User Suspended',
    actor: { id: 'sys1', name: 'Auto-Suspend Policy', type: 'automation' },
    resource: { type: 'ppp_user', id: 'p1', name: 'user-3421@example.com' },
    status: 'success',
    metadata: { reason: 'Payment overdue > 30 days' },
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 32 * 60 * 1000),
    type: 'template',
    action: 'Template Applied',
    actor: { id: 'u2', name: 'tech@netflow', type: 'user' },
    resource: { type: 'template', id: 't1', name: 'Firewall Rules v2.1' },
    status: 'success',
    ipAddress: '192.168.1.101',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    type: 'automation',
    action: 'Workflow Executed',
    actor: { id: 'sch1', name: 'Scheduler', type: 'system' },
    resource: { type: 'automation', id: 'a1', name: 'Auto-Renewal Daily' },
    changes: [
      { field: 'accounts.renewed', oldValue: 0, newValue: 15 },
    ],
    status: 'success',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'router',
    action: 'Firmware Update Failed',
    actor: { id: 'u3', name: 'backup@netflow', type: 'user' },
    resource: { type: 'router', id: 'r15', name: 'RTR-BRANCH-22' },
    status: 'failed',
    metadata: { error: 'Download timeout after 300s' },
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    type: 'policy',
    action: 'Policy Enforced',
    actor: { id: 'sys2', name: 'Compliance Engine', type: 'system' },
    resource: { type: 'policy', id: 'pol1', name: 'Compliance Policy v3.0' },
    status: 'success',
    changes: [
      { field: 'violations.detected', oldValue: null, newValue: 3 },
      { field: 'violations.auto-fixed', oldValue: null, newValue: 2 },
    ],
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    type: 'user',
    action: 'Login Successful',
    actor: { id: 'u1', name: 'admin@netflow', type: 'user' },
    resource: { type: 'session', id: 'sess1', name: 'Current Session' },
    status: 'success',
    ipAddress: '192.168.1.100',
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    type: 'router',
    action: 'Router Offline Detected',
    actor: { id: 'mon1', name: 'Health Monitor', type: 'system' },
    resource: { type: 'router', id: 'r8', name: 'RTR-HOTSPOT-08' },
    status: 'success',
  },
];

const typeIcons: Record<AuditEntry['type'], React.ReactNode> = {
  router: <Server className="w-4 h-4" />,
  ppp: <Users className="w-4 h-4" />,
  template: <FileText className="w-4 h-4" />,
  policy: <Shield className="w-4 h-4" />,
  automation: <Zap className="w-4 h-4" />,
  user: <User className="w-4 h-4" />,
  system: <RefreshCw className="w-4 h-4" />,
};

const typeColors: Record<AuditEntry['type'], string> = {
  router: 'text-primary-500 bg-primary-100 dark:bg-primary-900/30',
  ppp: 'text-success-500 bg-success-100 dark:bg-success-900/30',
  template: 'text-accent-500 bg-accent-100 dark:bg-accent-900/30',
  policy: 'text-warning-500 bg-warning-100 dark:bg-warning-900/30',
  automation: 'text-info-500 bg-info-100 dark:bg-info-900/30',
  user: 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800',
  system: 'text-neutral-400 bg-neutral-100 dark:bg-neutral-800',
};

export default function AuditTimelinePage() {
  const [entries, setEntries] = useState<AuditEntry[]>(mockAuditEntries);
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [filters, setFilters] = useState({
    type: 'all' as string,
    status: 'all' as string,
    actor: 'all' as string,
    dateRange: '24h' as string,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60 * 1000) return 'Just now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: AuditEntry['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-error-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning-500" />;
    }
  };

  const filteredEntries = entries.filter((entry) => {
    if (filters.type !== 'all' && entry.type !== filters.type) return false;
    if (filters.status !== 'all' && entry.status !== filters.status) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        entry.action.toLowerCase().includes(query) ||
        entry.resource.name.toLowerCase().includes(query) ||
        entry.actor.name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Audit History</h1>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400">
            Unified forensic timeline of every administrative action and system event.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Export Log</Button>
          <Button className="glow-primary" leftIcon={<RefreshCw className="w-4 h-4" />}>Sync History</Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="glass px-0 py-0">
        <CardBody className="p-4 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by action, resource, or actor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <Select
            value={filters.type}
            onChange={(val: string) => setFilters({ ...filters, type: val })}
            className="w-auto min-w-[160px]"
            options={[
              { value: "all", label: "All Types" },
              { value: "router", label: "Router Changes" },
              { value: "ppp", label: "PPP Operations" },
              { value: "template", label: "Templates" },
              { value: "policy", label: "Policies" },
              { value: "automation", label: "Automations" },
              { value: "user", label: "User Activity" },
            ]}
          />
          <Select
            value={filters.status}
            onChange={(val: string) => setFilters({ ...filters, status: val })}
            className="w-auto min-w-[140px]"
            options={[
              { value: "all", label: "All Status" },
              { value: "success", label: "Success" },
              { value: "failed", label: "Failed" },
              { value: "pending", label: "Pending" },
            ]}
          />
          <Button variant="ghost" size="sm" className="text-neutral-500" leftIcon={<Filter className="w-4 h-4" />}>More Filters</Button>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Timeline List */}
        <div className="lg:col-span-8">
          <Card className="glass overflow-hidden px-0">
            <CardBody className="p-0">
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      'p-5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-all border-l-4',
                      selectedEntry?.id === entry.id ? 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-500' : 'border-transparent'
                    )}
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <div className="flex items-start gap-5">
                      <div className={cn(
                        'flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 shadow-sm',
                        typeColors[entry.type]
                      )}>
                        {typeIcons[entry.type]}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 dark:text-white">
                              {entry.action}
                            </span>
                            {getStatusIcon(entry.status)}
                          </div>
                          <span className="text-xs font-medium text-neutral-400 whitespace-nowrap">
                            {formatTimestamp(entry.timestamp)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                            <Activity className="w-3.5 h-3.5 text-neutral-400" />
                            {entry.resource.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                            <User className="w-3.5 h-3.5 text-neutral-400" />
                            {entry.actor.name}
                          </div>
                          {entry.ipAddress && (
                            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                              <Globe className="w-3.5 h-3.5" />
                              {entry.ipAddress}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEntries.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
                  </div>
                  <h3 className="text-lg font-bold dark:text-white">No results found</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 mt-1">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-4 space-y-6">
          {selectedEntry ? (
            <div className="sticky top-24">
              <Card className="glass border-primary-500/20 glow-primary-hover transition-all">
                <CardHeader
                  title="Entry Analysis"
                  subtitle={`Reference: AX-${selectedEntry.id}092`}
                  action={
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setSelectedEntry(null)}>
                      <XCircle className="w-4 h-4" />
                    </Button>
                  }
                />
                <CardBody className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedEntry.status === 'success' ? 'success' : selectedEntry.status === 'failed' ? 'error' : 'warning'}>
                      {selectedEntry.status.toUpperCase()}
                    </Badge>
                    <Badge variant="default">{selectedEntry.type.toUpperCase()}</Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl space-y-3">
                      <div>
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-tighter">Initiator</label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-primary-600" />
                          </div>
                          <span className="text-sm font-medium dark:text-white">{selectedEntry.actor.name}</span>
                          <span className="text-[10px] bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded uppercase">{selectedEntry.actor.type}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-tighter">Affected Resource</label>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white mt-1 capitalize">
                          {selectedEntry.resource.type}: {selectedEntry.resource.name}
                        </p>
                      </div>
                    </div>

                    {selectedEntry.changes && selectedEntry.changes.length > 0 && (
                      <div>
                        <label className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-2 mb-2">
                          <RefreshCw className="w-3 h-3" />
                          Data Transformation
                        </label>
                        <div className="space-y-2">
                          {selectedEntry.changes.map((change, idx) => (
                            <div key={idx} className="p-3 bg-neutral-50 dark:bg-neutral-800/30 rounded-xl border border-neutral-100 dark:border-neutral-800">
                              <div className="text-xs font-medium text-primary-500 mb-2 truncate">{change.field}</div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-error-500 bg-error-50 dark:bg-error-900/10 px-2 py-1 rounded line-through truncate max-w-[100px]">
                                  {String(change.oldValue)}
                                </span>
                                <ArrowRight className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                                <span className="text-xs text-success-500 bg-success-50 dark:bg-success-900/10 px-2 py-1 rounded font-bold truncate max-w-[100px]">
                                  {String(change.newValue)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Security Hash</span>
                      <span className="font-mono text-neutral-400 uppercase">SHA256: 3F4D...B2A1</span>
                    </div>
                    <Button variant="outline" className="w-full" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                      View Compliance Context
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          ) : (
            <div className="sticky top-24">
              <Card className="glass border-dashed border-2 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                  <Info className="w-8 h-8 text-neutral-400" />
                </div>
                <h4 className="font-bold dark:text-white">Forensic Overview</h4>
                <p className="text-sm text-neutral-500 mt-2 max-w-[200px]">
                  Select any event from the timeline to perform deep-package inspection and change analysis.
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
