'use client';

import React, { useState } from 'react';
import {
  ChevronRight, ArrowRightLeft, Search, Filter, Plus, Eye, Check, X,
  User, Package, MapPin, Clock, Package as PackageIcon, Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ChangeRequest {
  id: string;
  clientCode: string;
  clientName: string;
  mobile: string;
  changeType: 'Package Change' | 'Address Change' | 'Device Change' | 'Plan Upgrade' | 'Plan Downgrade';
  from: string;
  to: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  processedBy: string;
}

const sampleRequests: ChangeRequest[] = [
  { id: '1', clientCode: 'C-001', clientName: 'Rahim Khan', mobile: '01712345678', changeType: 'Package Change', from: 'Gold 10Mbps', to: 'Platinum 50Mbps', requestDate: '2024-01-15', status: 'Pending', processedBy: '-' },
  { id: '2', clientCode: 'C-002', clientName: 'Karim Ahmed', mobile: '01712345679', changeType: 'Address Change', from: 'Zone A', to: 'Zone B', requestDate: '2024-01-14', status: 'Approved', processedBy: 'Admin' },
  { id: '3', clientCode: 'C-003', clientName: 'Jamal Hossain', mobile: '01712345680', changeType: 'Plan Upgrade', from: 'Silver 5Mbps', to: 'Gold 10Mbps', requestDate: '2024-01-13', status: 'Pending', processedBy: '-' },
  { id: '4', clientCode: 'C-004', clientName: 'Babul Mia', mobile: '01712345681', changeType: 'Device Change', from: 'UTP', to: 'Optical Fiber', requestDate: '2024-01-12', status: 'Rejected', processedBy: 'Admin' },
  { id: '5', clientCode: 'C-005', clientName: 'Khan Enterprise', mobile: '01712345682', changeType: 'Plan Downgrade', from: 'Diamond 100Mbps', to: 'Platinum 50Mbps', requestDate: '2024-01-11', status: 'Approved', processedBy: 'Admin' },
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

function ChangeTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    'Package Change': 'bg-blue-500/20 text-blue-400',
    'Address Change': 'bg-purple-500/20 text-purple-400',
    'Device Change': 'bg-amber-500/20 text-amber-400',
    'Plan Upgrade': 'bg-emerald-500/20 text-emerald-400',
    'Plan Downgrade': 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={cn('px-2 py-0.5 text-xs font-medium rounded', styles[type] || 'bg-slate-500/20 text-slate-400')}>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full border', styles[status])}>
      {status}
    </span>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function ChangeRequestPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredRequests = sampleRequests.filter(req => {
    const matchesSearch = req.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.clientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.mobile.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || req.status.toLowerCase() === statusFilter;
    const matchesType = typeFilter === 'all' || req.changeType === typeFilter;
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
              { label: 'Change Request' },
            ]} 
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Change Request</h1>
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 text-sm font-medium rounded-full">
                {sampleRequests.filter(r => r.status === 'Pending').length} Pending
              </span>
            </div>
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
                <p className="text-slate-400 text-sm">Total Requests</p>
                <p className="text-2xl font-bold text-white mt-1">{sampleRequests.length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10">
                <ArrowRightLeft className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{sampleRequests.filter(r => r.status === 'Pending').length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Approved</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{sampleRequests.filter(r => r.status === 'Approved').length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{sampleRequests.filter(r => r.status === 'Rejected').length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-red-500/10">
                <X className="w-5 h-5 text-red-400" />
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
              placeholder="Search requests..."
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="Package Change">Package Change</option>
            <option value="Address Change">Address Change</option>
            <option value="Device Change">Device Change</option>
            <option value="Plan Upgrade">Plan Upgrade</option>
            <option value="Plan Downgrade">Plan Downgrade</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/80">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Client</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Change Type</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">From</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">To</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Request Date</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Processed By</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-3">
                      <div className="text-sm font-medium text-white">{req.clientName}</div>
                      <div className="text-xs text-slate-500">{req.clientCode} • {req.mobile}</div>
                    </td>
                    <td className="px-3 py-3"><ChangeTypeBadge type={req.changeType} /></td>
                    <td className="px-3 py-3 text-sm text-slate-400">{req.from}</td>
                    <td className="px-3 py-3 text-sm text-white">{req.to}</td>
                    <td className="px-3 py-3 text-sm text-slate-400">{req.requestDate}</td>
                    <td className="px-3 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-3 py-3 text-sm text-slate-400">{req.processedBy}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        {req.status === 'Pending' && (
                          <>
                            <button className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors" title="Approve">
                              <Check className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Reject">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
