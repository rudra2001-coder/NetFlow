'use client';

import React, { useState } from 'react';
import {
  ChevronRight, Settings, Search, Filter, Plus, Save, Eye, Edit, Trash2,
  User, Key, Mail, Phone, Bell, Shield, Globe, ToggleLeft, ToggleRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface PortalSetting {
  id: string;
  clientCode: string;
  clientName: string;
  loginEnabled: boolean;
  smsNotification: boolean;
  emailNotification: boolean;
  passwordResetEnabled: boolean;
  lastLogin: string;
  status: 'Active' | 'Inactive';
}

const sampleSettings: PortalSetting[] = [
  { id: '1', clientCode: 'C-001', clientName: 'Rahim Khan', loginEnabled: true, smsNotification: true, emailNotification: true, passwordResetEnabled: true, lastLogin: '2024-01-15 10:30', status: 'Active' },
  { id: '2', clientCode: 'C-002', clientName: 'Karim Ahmed', loginEnabled: true, smsNotification: false, emailNotification: true, passwordResetEnabled: true, lastLogin: '2024-01-14 08:15', status: 'Active' },
  { id: '3', clientCode: 'C-003', clientName: 'Jamal Hossain', loginEnabled: false, smsNotification: true, emailNotification: false, passwordResetEnabled: false, lastLogin: '-', status: 'Inactive' },
  { id: '4', clientCode: 'C-004', clientName: 'Babul Mia', loginEnabled: true, smsNotification: true, emailNotification: true, passwordResetEnabled: true, lastLogin: '2024-01-13 16:45', status: 'Active' },
  { id: '5', clientCode: 'C-005', clientName: 'Khan Enterprise', loginEnabled: true, smsNotification: true, emailNotification: true, passwordResetEnabled: true, lastLogin: '2024-01-12 14:20', status: 'Active' },
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

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'w-10 h-5 rounded-full transition-colors relative',
        enabled ? 'bg-emerald-500' : 'bg-slate-600'
      )}
    >
      <span className={cn(
        'absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform',
        enabled ? 'left-5' : 'left-0.5'
      )} />
    </button>
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

export default function PortalManagePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [settings, setSettings] = useState<PortalSetting[]>(sampleSettings);

  const filteredSettings = settings.filter(s => {
    const matchesSearch = s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.clientCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateSetting = (id: string, key: keyof PortalSetting, value: boolean) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, [key]: value } : s));
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50">
        <div className="px-6 py-4">
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Client', href: '/client' },
              { label: 'Portal Manage' },
            ]} 
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Portal Manage</h1>
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full">
                {settings.filter(s => s.status === 'Active').length} Active
              </span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Save className="w-4 h-4" />
              Save Changes
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
                <p className="text-slate-400 text-sm">Total Portals</p>
                <p className="text-2xl font-bold text-white mt-1">{settings.length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Portals</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{settings.filter(s => s.status === 'Active').length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10">
                <User className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">SMS Enabled</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">{settings.filter(s => s.smsNotification).length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-500/10">
                <Phone className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Email Enabled</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{settings.filter(s => s.emailNotification).length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10">
                <Mail className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Global Settings Card */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Global Portal Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-300">Default Login</span>
              </div>
              <Toggle enabled={true} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-300">SMS Notifications</span>
              </div>
              <Toggle enabled={true} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-300">Email Notifications</span>
              </div>
              <Toggle enabled={true} onChange={() => {}} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search clients..."
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
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/80">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Client</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Login</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">SMS</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Email</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Password Reset</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Last Login</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredSettings.map((setting) => (
                  <tr key={setting.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-3">
                      <div className="text-sm font-medium text-white">{setting.clientName}</div>
                      <div className="text-xs text-slate-500">{setting.clientCode}</div>
                    </td>
                    <td className="px-3 py-3">
                      <Toggle
                        enabled={setting.loginEnabled}
                        onChange={(v) => updateSetting(setting.id, 'loginEnabled', v)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Toggle
                        enabled={setting.smsNotification}
                        onChange={(v) => updateSetting(setting.id, 'smsNotification', v)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Toggle
                        enabled={setting.emailNotification}
                        onChange={(v) => updateSetting(setting.id, 'emailNotification', v)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Toggle
                        enabled={setting.passwordResetEnabled}
                        onChange={(v) => updateSetting(setting.id, 'passwordResetEnabled', v)}
                      />
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-400">{setting.lastLogin}</td>
                    <td className="px-3 py-3"><StatusBadge status={setting.status} /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors" title="Edit">
                          <Key className="w-4 h-4" />
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
