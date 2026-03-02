'use client';

import React, { useState } from 'react';
import {
  ChevronRight, History, Search, Filter, Download, Calendar,
  User, Phone, MapPin, Package, Building2, Clock, CheckCircle,
  XCircle, AlertCircle, Eye, MessageSquare, FileText, RefreshCw,
  ChevronDown, ArrowUpDown, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface SupportTicket {
  id: string;
  title: string;
  requester: string;
  requesterPhone: string;
  requesterEmail: string;
  zone: string;
  category: 'Network' | 'Billing' | 'Technical' | 'General' | 'Equipment';
  status: 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed' | 'Rejected';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assignedTo: string;
  assignedDate: string;
  resolvedDate: string;
  createdAt: string;
  description: string;
  resolution: string;
}

// ============================================================================
// Sample Data
// ============================================================================

const sampleTickets: SupportTicket[] = [
  {
    id: 'TKT-5001',
    title: 'PPPoE Server Timeout - Node HQ',
    requester: 'Rahim Khan',
    requesterPhone: '01712345678',
    requesterEmail: 'rahim@example.com',
    zone: 'Zone A',
    category: 'Network',
    status: 'Closed',
    priority: 'Critical',
    assignedTo: 'John Wick',
    assignedDate: '2024-01-15 10:30',
    resolvedDate: '2024-01-15 14:45',
    createdAt: '2024-01-15 09:15',
    description: 'PPPoE server not responding to authentication requests',
    resolution: 'Restarted PPPoE service and cleared cache - issue resolved'
  },
  {
    id: 'TKT-5002',
    title: 'Billing Discrepancy - Monthly Invoice',
    requester: 'Karim Ahmed',
    requesterPhone: '01712345679',
    requesterEmail: 'karim@example.com',
    zone: 'Zone B',
    category: 'Billing',
    status: 'Closed',
    priority: 'Medium',
    assignedTo: 'Sarah Connor',
    assignedDate: '2024-01-14 11:00',
    resolvedDate: '2024-01-14 16:30',
    createdAt: '2024-01-14 10:00',
    description: 'Customer charged twice for same billing cycle',
    resolution: 'Refunded duplicate charge and updated billing system'
  },
  {
    id: 'TKT-5003',
    title: 'Router Configuration Help',
    requester: 'Jamal Hossain',
    requesterPhone: '01712345680',
    requesterEmail: 'jamal@example.com',
    zone: 'Zone A',
    category: 'Technical',
    status: 'Resolved',
    priority: 'Low',
    assignedTo: 'Elliot Alderson',
    assignedDate: '2024-01-13 14:00',
    resolvedDate: '2024-01-13 15:20',
    createdAt: '2024-01-13 13:30',
    description: 'Need help configuring static IP on MikroTik router',
    resolution: 'Provided step-by-step configuration guide'
  },
  {
    id: 'TKT-5004',
    title: 'OLT Port Failure - Port 4',
    requester: 'Babul Mia',
    requesterPhone: '01712345681',
    requesterEmail: 'babul@example.com',
    zone: 'Zone C',
    category: 'Equipment',
    status: 'Closed',
    priority: 'Critical',
    assignedTo: 'John Wick',
    assignedDate: '2024-01-12 08:00',
    resolvedDate: '2024-01-12 12:00',
    createdAt: '2024-01-12 07:30',
    description: 'OLT port 4 showing down status on monitoring',
    resolution: 'Replaced faulty SFP module - port restored'
  },
  {
    id: 'TKT-5005',
    title: 'Internet Speed Complaint',
    requester: 'Khan Enterprise',
    requesterPhone: '01712345682',
    requesterEmail: 'khan@enterprise.com',
    zone: 'Zone B',
    category: 'Network',
    status: 'Closed',
    priority: 'High',
    assignedTo: 'Sarah Connor',
    assignedDate: '2024-01-11 09:00',
    resolvedDate: '2024-01-11 11:30',
    createdAt: '2024-01-11 08:45',
    description: 'Customer experiencing slow speeds despite 100Mbps plan',
    resolution: 'Identified line noise issue - replaced cable'
  },
  {
    id: 'TKT-5006',
    title: 'New Connection Request',
    requester: 'Islam Brothers',
    requesterPhone: '01712345683',
    requesterEmail: 'islam@example.com',
    zone: 'Zone A',
    category: 'General',
    status: 'Closed',
    priority: 'Low',
    assignedTo: 'Ada Lovelace',
    assignedDate: '2024-01-10 10:00',
    resolvedDate: '2024-01-12 14:00',
    createdAt: '2024-01-10 09:30',
    description: 'Request for new fiber connection at office premises',
    resolution: 'New connection installed successfully'
  },
  {
    id: 'TKT-5007',
    title: 'RADIUS Authentication Failure',
    requester: 'Field Ops',
    requesterPhone: '01712345684',
    requesterEmail: 'fieldops@example.com',
    zone: 'Zone C',
    category: 'Network',
    status: 'Rejected',
    priority: 'High',
    assignedTo: 'Elliot Alderson',
    assignedDate: '2024-01-09 15:00',
    resolvedDate: '2024-01-09 16:00',
    createdAt: '2024-01-09 14:30',
    description: 'Multiple users unable to authenticate',
    resolution: 'Duplicate ticket - already being handled in TKT-5001'
  },
  {
    id: 'TKT-5008',
    title: 'IP Blocked - Firewall Rule',
    requester: 'Hossain Store',
    requesterPhone: '01712345685',
    requesterEmail: 'hossain@example.com',
    zone: 'Zone B',
    category: 'Technical',
    status: 'Closed',
    priority: 'Medium',
    assignedTo: 'John Wick',
    assignedDate: '2024-01-08 11:00',
    resolvedDate: '2024-01-08 13:00',
    createdAt: '2024-01-08 10:30',
    description: 'Customer IP blocked due to suspicious activity',
    resolution: 'Verified legitimate traffic - unblocked IP'
  },
];

const employees = [
  { id: 'E1', name: 'John Wick', role: 'Network Engineer', avatar: 'JW' },
  { id: 'E2', name: 'Sarah Connor', role: 'Support Lead', avatar: 'SC' },
  { id: 'E3', name: 'Elliot Alderson', role: 'System Admin', avatar: 'EA' },
  { id: 'E4', name: 'Ada Lovelace', role: 'Technical Support', avatar: 'AL' },
  { id: 'E5', name: 'Bruce Wayne', role: 'Field Technician', avatar: 'BW' },
  { id: 'E6', name: 'Clark Kent', role: 'Network Engineer', avatar: 'CK' },
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
    'Open': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Assigned': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'In Progress': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Resolved': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Closed': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    'Rejected': 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full border', styles[status])}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
    'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Medium': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Low': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return (
    <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full border', styles[priority])}>
      {priority}
    </span>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function SupportHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredTickets = sampleTickets.filter(ticket => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.requesterPhone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    const matchesAssigned = assignedFilter === 'all' || 
      (assignedFilter === 'unassigned' && ticket.assignedTo === 'Unassigned') ||
      (assignedFilter !== 'unassigned' && ticket.assignedTo === assignedFilter);
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssigned;
  });

  const getStats = () => {
    return {
      total: sampleTickets.length,
      closed: sampleTickets.filter(t => t.status === 'Closed').length,
      resolved: sampleTickets.filter(t => t.status === 'Resolved').length,
      rejected: sampleTickets.filter(t => t.status === 'Rejected').length,
      critical: sampleTickets.filter(t => t.priority === 'Critical').length,
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Breadcrumb items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Support', href: '/support' },
            { label: 'History' },
          ]} />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-3">
            <History className="w-7 h-7 text-indigo-500" />
            Support History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View all past support tickets with filtering and search
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
              showFilters 
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300"
                : "bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Total Tickets</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Closed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.closed}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Resolved</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.resolved}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Rejected</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Critical</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.critical}</p>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 animate-slideDown">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Network">Network</option>
                <option value="Billing">Billing</option>
                <option value="Technical">Technical</option>
                <option value="General">General</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Assigned To
              </label>
              <select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Staff</option>
                <option value="unassigned">Unassigned</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.name}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by ticket ID, title, customer name, or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Results Count */}
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredTickets.length}</span> of <span className="font-semibold">{sampleTickets.length}</span> tickets
      </p>

      {/* Tickets Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Resolved
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredTickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <td className="px-4 py-4">
                    <span className="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {ticket.id}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-slate-900 dark:text-white max-w-xs truncate">
                      {ticket.title}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {ticket.requester}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {ticket.requesterPhone}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      {ticket.category}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                        {ticket.assignedTo.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {ticket.assignedTo}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {ticket.createdAt.split(' ')[0]}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {ticket.resolvedDate ? ticket.resolvedDate.split(' ')[0] : '-'}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        title="View Resolution"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTickets.length === 0 && (
          <div className="p-12 text-center">
            <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No tickets found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {selectedTicket.id}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    {selectedTicket.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <PriorityBadge priority={selectedTicket.priority} />
                <StatusBadge status={selectedTicket.status} />
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {selectedTicket.category}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Requester Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Requester Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedTicket.requester}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedTicket.requesterPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedTicket.requesterEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Zone</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedTicket.zone}</p>
                  </div>
                </div>
              </div>

              {/* Assignment Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Assignment Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Assigned To</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedTicket.assignedTo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Assigned Date</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedTicket.assignedDate}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Timeline
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Created</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedTicket.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Resolved</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedTicket.resolvedDate || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Description
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Resolution */}
              {selectedTicket.resolution && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Resolution
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    {selectedTicket.resolution}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
