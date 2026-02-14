'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
} from 'lucide-react';

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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                Audit Timeline
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Unified activity log and compliance history
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                Export
              </Button>
              <Button variant="primary" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />}>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by action, resource, or actor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
            >
              <option value="all">All Types</option>
              <option value="router">Router Changes</option>
              <option value="ppp">PPP Operations</option>
              <option value="template">Templates</option>
              <option value="policy">Policies</option>
              <option value="automation">Automations</option>
              <option value="user">User Activity</option>
              <option value="system">System Events</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>

            {/* Date Range */}
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="flex gap-6">
          {/* Timeline */}
          <div className="flex-1">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={cn(
                        'p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors',
                        selectedEntry?.id === entry.id && 'bg-primary-50 dark:bg-primary-900/20'
                      )}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={cn(
                            'flex items-center justify-center w-10 h-10 rounded-lg shrink-0',
                            typeColors[entry.type]
                          )}
                        >
                          {typeIcons[entry.type]}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900 dark:text-white">
                              {entry.action}
                            </span>
                            {getStatusIcon(entry.status)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                              {entry.resource.name}
                            </span>
                            <span className="text-neutral-300">•</span>
                            <span className="text-sm text-neutral-400">
                              by {entry.actor.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-neutral-400">
                              {formatTimestamp(entry.timestamp)}
                            </span>
                            {entry.ipAddress && (
                              <span className="text-xs text-neutral-400 font-mono">
                                {entry.ipAddress}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {entry.status === 'failed' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredEntries.length === 0 && (
                  <div className="py-12 text-center">
                    <Search className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                    <p className="text-neutral-500 dark:text-neutral-400">
                      No audit entries found
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detail Panel */}
          <div className="w-96 shrink-0">
            {selectedEntry ? (
              <Card>
                <CardHeader
                  title="Entry Details"
                  subtitle={`ID: ${selectedEntry.id}`}
                  action={
                    <Button variant="ghost" size="icon" onClick={() => setSelectedEntry(null)}>
                      <XCircle className="w-4 h-4" />
                    </Button>
                  }
                />
                <CardContent>
                  <div className="space-y-4">
                    {/* Type & Status */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          selectedEntry.type === 'router'
                            ? 'info'
                            : selectedEntry.type === 'ppp'
                            ? 'success'
                            : selectedEntry.type === 'policy'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {selectedEntry.type}
                      </Badge>
                      <Badge
                        variant={
                          selectedEntry.status === 'success'
                            ? 'success'
                            : selectedEntry.status === 'failed'
                            ? 'error'
                            : 'warning'
                        }
                      >
                        {selectedEntry.status}
                      </Badge>
                    </div>

                    {/* Action */}
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 uppercase">
                        Action
                      </label>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white mt-1">
                        {selectedEntry.action}
                      </p>
                    </div>

                    {/* Actor */}
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 uppercase">
                        Actor
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm text-neutral-900 dark:text-white">
                          {selectedEntry.actor.name}
                        </span>
                        <Badge size="sm" variant="default">
                          {selectedEntry.actor.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Resource */}
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 uppercase">
                        Resource
                      </label>
                      <p className="text-sm text-neutral-900 dark:text-white mt-1">
                        {selectedEntry.resource.type}: {selectedEntry.resource.name}
                      </p>
                    </div>

                    {/* Changes */}
                    {selectedEntry.changes && selectedEntry.changes.length > 0 && (
                      <div>
                        <label className="text-xs font-semibold text-neutral-500 uppercase">
                          Changes
                        </label>
                        <div className="mt-2 space-y-2">
                          {selectedEntry.changes.map((change, idx) => (
                            <div
                              key={idx}
                              className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg"
                            >
                              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                {change.field}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-sm">
                                <span className="text-error-500 line-through">
                                  {String(change.oldValue)}
                                </span>
                                <ArrowDownRight className="w-3 h-3 text-neutral-400" />
                                <span className="text-success-500 font-medium">
                                  {String(change.newValue)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 uppercase">
                        Timestamp
                      </label>
                      <p className="text-sm text-neutral-900 dark:text-white mt-1">
                        {selectedEntry.timestamp.toLocaleString()}
                      </p>
                    </div>

                    {/* IP Address */}
                    {selectedEntry.ipAddress && (
                      <div>
                        <label className="text-xs font-semibold text-neutral-500 uppercase">
                          IP Address
                        </label>
                        <p className="text-sm font-mono text-neutral-900 dark:text-white mt-1">
                          {selectedEntry.ipAddress}
                        </p>
                      </div>
                    )}

                    {/* Metadata */}
                    {selectedEntry.metadata && (
                      <div>
                        <label className="text-xs font-semibold text-neutral-500 uppercase">
                          Metadata
                        </label>
                        <pre className="mt-1 p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs overflow-x-auto">
                          {JSON.stringify(selectedEntry.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Info className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Select an entry to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
