'use client';

import React, { useState } from 'react';
import {
  ChevronRight, Send, Users, Search, Filter, Plus, X, Check,
  User, Phone, MapPin, Package, CreditCard, Building2, Clock,
  AlertCircle, CheckCircle, Eye, Edit, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface NewRequest {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  zone: string;
  package: string;
  connectionType: 'UTP' | 'Optical Fiber';
  requestedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes: string;
}

const sampleRequests: NewRequest[] = [
  { id: '1', name: 'Rahim Khan', mobile: '01712345678', email: 'rahim@example.com', address: '123 Main St', zone: 'Zone A', package: 'Gold 10Mbps', connectionType: 'Optical Fiber', requestedDate: '2024-01-15', status: 'Pending', notes: 'Urgent installation needed' },
  { id: '2', name: 'Karim Ahmed', mobile: '01712345679', email: 'karim@example.com', address: '456 Oak Ave', zone: 'Zone B', package: 'Platinum 50Mbps', connectionType: 'Optical Fiber', requestedDate: '2024-01-14', status: 'Approved', notes: 'Business connection' },
  { id: '3', name: 'Jamal Hossain', mobile: '01712345680', email: 'jamal@example.com', address: '789 Pine Rd', zone: 'Zone A', package: 'Silver 5Mbps', connectionType: 'UTP', requestedDate: '2024-01-13', status: 'Pending', notes: 'Residential area' },
  { id: '4', name: 'Babul Mia', mobile: '01712345681', email: 'babul@example.com', address: '321 Cedar Ln', zone: 'Zone C', package: 'Bronze 3Mbps', connectionType: 'UTP', requestedDate: '2024-01-12', status: 'Rejected', notes: 'Area not covered' },
  { id: '5', name: 'Khan Enterprise', mobile: '01712345682', email: 'khan@enterprise.com', address: '555 Business Park', zone: 'Zone B', package: 'Diamond 100Mbps', connectionType: 'Optical Fiber', requestedDate: '2024-01-11', status: 'Pending', notes: 'Corporate client' },
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

export default function NewRequestPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRequests = sampleRequests.filter(req => {
    const matchesSearch = req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.mobile.includes(searchQuery) ||
      req.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
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
              { label: 'New Request' },
            ]} 
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">New Request</h1>
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 text-sm font-medium rounded-full">
                {sampleRequests.filter(r => r.status === 'Pending').length} Pending
              </span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              New Request
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
                <CheckCircle className="w-5 h-5 text-emerald-400" />
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
                <AlertCircle className="w-5 h-5 text-red-400" />
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
        </div>

        {/* Table */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/80">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Name</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Mobile</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Zone</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Package</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Connection</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-3">
                      <div className="text-sm font-medium text-white">{req.name}</div>
                      <div className="text-xs text-slate-500">{req.email}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-300">{req.mobile}</td>
                    <td className="px-3 py-3 text-sm text-slate-300">{req.zone}</td>
                    <td className="px-3 py-3 text-sm text-white">{req.package}</td>
                    <td className="px-3 py-3 text-sm">
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded',
                        req.connectionType === 'Optical Fiber' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      )}>
                        {req.connectionType}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-400">{req.requestedDate}</td>
                    <td className="px-3 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Reject">
                          <X className="w-4 h-4" />
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
