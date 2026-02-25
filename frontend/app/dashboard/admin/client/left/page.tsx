'use client';

import React, { useState } from 'react';
import {
  ChevronRight, UserMinus, Users, Search, Filter, RefreshCw,
  Eye, Edit, Trash2, Calendar, MapPin, Phone, Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface LeftClient {
  id: string;
  code: string;
  username: string;
  customerName: string;
  mobile: string;
  zone: string;
  package: string;
  leftDate: string;
  reason: string;
  finalBill: number;
  settlementStatus: 'Pending' | 'Settled' | 'Written Off';
}

const sampleLeftClients: LeftClient[] = [
  { id: '1', code: 'C-101', username: 'john101', customerName: 'John Smith', mobile: '01711111111', zone: 'Zone A', package: 'Gold 10Mbps', leftDate: '2024-01-10', reason: 'Relocated', finalBill: 800, settlementStatus: 'Settled' },
  { id: '2', code: 'C-102', username: 'mary102', customerName: 'Mary Jane', mobile: '01722222222', zone: 'Zone B', package: 'Silver 5Mbps', leftDate: '2024-01-08', reason: 'Not Satisfied', finalBill: 500, settlementStatus: 'Pending' },
  { id: '3', code: 'C-103', username: 'tom103', customerName: 'Tom Wilson', mobile: '01733333333', zone: 'Zone A', package: 'Platinum 50Mbps', leftDate: '2024-01-05', reason: 'Financial Issues', finalBill: 2500, settlementStatus: 'Written Off' },
  { id: '4', code: 'C-104', username: 'alice104', customerName: 'Alice Brown', mobile: '01744444444', zone: 'Zone C', package: 'Bronze 3Mbps', leftDate: '2024-01-02', reason: 'Competitor', finalBill: 350, settlementStatus: 'Settled' },
  { id: '5', code: 'C-105', username: 'bob105', customerName: 'Bob Johnson', mobile: '01755555555', zone: 'Zone B', package: 'Gold 20Mbps', leftDate: '2023-12-28', reason: 'Business Closed', finalBill: 1500, settlementStatus: 'Pending' },
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
    Settled: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Written Off': 'bg-red-500/20 text-red-400 border-red-500/30',
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

export default function LeftClientPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredClients = sampleLeftClients.filter(client => {
    const matchesSearch = client.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.mobile.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || client.settlementStatus.toLowerCase() === statusFilter;
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
              { label: 'Left Client' },
            ]} 
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Left Client</h1>
              <span className="px-2.5 py-1 bg-red-500/20 text-red-400 text-sm font-medium rounded-full">
                {sampleLeftClients.length} Total
              </span>
            </div>
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
                <p className="text-slate-400 text-sm">Total Left</p>
                <p className="text-2xl font-bold text-white mt-1">{sampleLeftClients.length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-red-500/10">
                <UserMinus className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending Settlement</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{sampleLeftClients.filter(c => c.settlementStatus === 'Pending').length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10">
                <RefreshCw className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Outstanding Amount</p>
                <p className="text-2xl font-bold text-red-400 mt-1">
                  ৳{sampleLeftClients.filter(c => c.settlementStatus === 'Pending').reduce((sum, c) => sum + c.finalBill, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-red-500/10">
                <Package className="w-5 h-5 text-red-400" />
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
              placeholder="Search left clients..."
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
            <option value="settled">Settled</option>
            <option value="written off">Written Off</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/80">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">C.Code</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Username</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Customer Name</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Mobile</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Zone</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Package</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Left Date</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Reason</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Final Bill</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-3 text-sm font-medium text-blue-400">{client.code}</td>
                    <td className="px-3 py-3 text-sm text-slate-200">{client.username}</td>
                    <td className="px-3 py-3 text-sm text-white">{client.customerName}</td>
                    <td className="px-3 py-3 text-sm text-slate-400">{client.mobile}</td>
                    <td className="px-3 py-3 text-sm text-slate-400">{client.zone}</td>
                    <td className="px-3 py-3 text-sm text-slate-300">{client.package}</td>
                    <td className="px-3 py-3 text-sm text-slate-400">{client.leftDate}</td>
                    <td className="px-3 py-3 text-sm text-slate-300">{client.reason}</td>
                    <td className="px-3 py-3 text-sm font-medium text-white">৳{client.finalBill.toLocaleString()}</td>
                    <td className="px-3 py-3"><StatusBadge status={client.settlementStatus} /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors" title="Restore">
                          <RefreshCw className="w-4 h-4" />
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
