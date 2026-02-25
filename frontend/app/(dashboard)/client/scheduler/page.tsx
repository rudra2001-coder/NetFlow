'use client';

import React, { useState } from 'react';
import {
  ChevronRight, CalendarClock, Plus, Search, Filter, Play, Pause,
  Edit, Trash2, Clock, User, RefreshCw, CheckCircle, XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface SchedulerTask {
  id: string;
  name: string;
  type: 'Auto Suspend' | 'Auto Activate' | 'Auto Renew' | 'Notification' | 'Backup';
  target: 'Due Clients' | 'All Clients' | 'Expired Clients' | 'Specific Zone';
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
  time: string;
  status: 'Active' | 'Paused';
  lastRun: string;
  nextRun: string;
  createdBy: string;
}

const sampleTasks: SchedulerTask[] = [
  { id: '1', name: 'Auto Suspend Due', type: 'Auto Suspend', target: 'Due Clients', frequency: 'Daily', time: '00:00', status: 'Active', lastRun: '2024-01-15 00:00', nextRun: '2024-01-16 00:00', createdBy: 'Admin' },
  { id: '2', name: 'Auto Activate on Payment', type: 'Auto Activate', target: 'Due Clients', frequency: 'Daily', time: '08:00', status: 'Active', lastRun: '2024-01-15 08:00', nextRun: '2024-01-16 08:00', createdBy: 'Admin' },
  { id: '3', name: 'Expiry Notification', type: 'Notification', target: 'Expired Clients', frequency: 'Daily', time: '09:00', status: 'Active', lastRun: '2024-01-15 09:00', nextRun: '2024-01-16 09:00', createdBy: 'Admin' },
  { id: '4', name: 'Weekly Backup', type: 'Backup', target: 'All Clients', frequency: 'Weekly', time: '02:00', status: 'Paused', lastRun: '2024-01-14 02:00', nextRun: '2024-01-21 02:00', createdBy: 'Admin' },
  { id: '5', name: 'Zone A Renewal', type: 'Auto Renew', target: 'Specific Zone', frequency: 'Monthly', time: '10:00', status: 'Active', lastRun: '2024-01-01 10:00', nextRun: '2024-02-01 10:00', createdBy: 'Admin' },
];

// ============================================================================
// Components
// ============================================================================

function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-slate-500" />}
          {item.href ? (
            <a href={item.href} className="text-slate-500 hover:text-blue-400 transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-slate-300 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    'Auto Suspend': 'bg-red-500/20 text-red-400',
    'Auto Activate': 'bg-emerald-500/20 text-emerald-400',
    'Auto Renew': 'bg-blue-500/20 text-blue-400',
    'Notification': 'bg-amber-500/20 text-amber-400',
    'Backup': 'bg-purple-500/20 text-purple-400',
  };
  return (
    <span className={cn('px-2 py-0.5 text-xs font-medium rounded', styles[type] || 'bg-slate-500/20 text-slate-400')}>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'px-2 py-0.5 text-xs font-medium rounded-full border',
      status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    )}>
      {status}
    </span>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function SchedulerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredTasks = sampleTasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status.toLowerCase() === statusFilter;
    const matchesType = typeFilter === 'all' || task.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50">
        <div className="px-6 py-4">
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Client', href: '/client' },
              { label: 'Scheduler' },
            ]} 
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Scheduler</h1>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-full">
                {sampleTasks.filter(t => t.status === 'Active').length} Active
              </span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Tasks</p>
                <p className="text-2xl font-bold text-white mt-1">{sampleTasks.length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10">
                <CalendarClock className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{sampleTasks.filter(t => t.status === 'Active').length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Paused</p>
                <p className="text-2xl font-bold text-slate-400 mt-1">{sampleTasks.filter(t => t.status === 'Paused').length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-500/10">
                <Pause className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Daily Tasks</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">{sampleTasks.filter(t => t.frequency === 'Daily').length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-500/10">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="Auto Suspend">Auto Suspend</option>
            <option value="Auto Activate">Auto Activate</option>
            <option value="Auto Renew">Auto Renew</option>
            <option value="Notification">Notification</option>
            <option value="Backup">Backup</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/80">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Task Name</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Type</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Target</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Frequency</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Time</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Last Run</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Next Run</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-3 text-sm font-medium text-white">{task.name}</td>
                    <td className="px-3 py-3"><TypeBadge type={task.type} /></td>
                    <td className="px-3 py-3 text-sm text-slate-300">{task.target}</td>
                    <td className="px-3 py-3 text-sm text-slate-400">{task.frequency}</td>
                    <td className="px-3 py-3 text-sm text-slate-400">{task.time}</td>
                    <td className="px-3 py-3"><StatusBadge status={task.status} /></td>
                    <td className="px-3 py-3 text-sm text-slate-400">{task.lastRun}</td>
                    <td className="px-3 py-3 text-sm text-slate-400">{task.nextRun}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors" title={task.status === 'Active' ? 'Pause' : 'Resume'}>
                          {task.status === 'Active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
