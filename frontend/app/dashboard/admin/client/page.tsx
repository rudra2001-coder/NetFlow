'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ChevronRight, Home, FileSpreadsheet, FileText, Users, RefreshCw,
  Download, Upload, Link2, Unlink, Wifi, Package, ToggleLeft,
  MoreHorizontal, Search, Filter, Eye, Edit, Trash2, Copy,
  ChevronDown, Check, X, UserPlus, UserMinus, Clock, ArrowUpDown,
  Building2, MapPin, Cpu, HardDrive, CreditCard, Gauge, Bell
} from 'lucide-react';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface Client {
  id: string;
  code: string;
  username: string;
  password: string;
  customerName: string;
  mobile: string;
  zone: string;
  connectionType: 'UTP' | 'Optical Fiber';
  customerType: 'Home' | 'Business' | 'Corporate';
  package: string;
  speed: string;
  monthlyBill: number;
  macAddress: string;
  server: string;
  billingStatus: 'Active' | 'Suspended' | 'Due';
  manualStatus: boolean;
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

// ============================================================================
// Sample Data
// ============================================================================

const sampleClients: Client[] = [
  { id: '1', code: 'C-001', username: 'rahim001', password: '********', customerName: 'Rahim Khan', mobile: '01712345678', zone: 'Zone A', connectionType: 'Optical Fiber', customerType: 'Home', package: 'Gold 10Mbps', speed: '10 Mbps', monthlyBill: 800, macAddress: 'AA:BB:CC:DD:EE:01', server: 'MikroTik-01', billingStatus: 'Active', manualStatus: true },
  { id: '2', code: 'C-002', username: 'karim002', password: '********', customerName: 'Karim Ahmed', mobile: '01712345679', zone: 'Zone B', connectionType: 'UTP', customerType: 'Business', package: 'Platinum 50Mbps', speed: '50 Mbps', monthlyBill: 2500, macAddress: 'AA:BB:CC:DD:EE:02', server: 'MikroTik-02', billingStatus: 'Active', manualStatus: true },
  { id: '3', code: 'C-003', username: 'jamal003', password: '********', customerName: 'Jamal Hossain', mobile: '01712345680', zone: 'Zone A', connectionType: 'Optical Fiber', customerType: 'Home', package: 'Silver 5Mbps', speed: '5 Mbps', monthlyBill: 500, macAddress: 'AA:BB:CC:DD:EE:03', server: 'MikroTik-01', billingStatus: 'Due', manualStatus: false },
  { id: '4', code: 'C-004', username: 'babu004', password: '********', customerName: 'Babul Mia', mobile: '01712345681', zone: 'Zone C', connectionType: 'UTP', customerType: 'Home', package: 'Bronze 3Mbps', speed: '3 Mbps', monthlyBill: 350, macAddress: 'AA:BB:CC:DD:EE:04', server: 'MikroTik-03', billingStatus: 'Suspended', manualStatus: false },
  { id: '5', code: 'C-005', username: 'khan005', password: '********', customerName: 'Khan Enterprise', mobile: '01712345682', zone: 'Zone B', connectionType: 'Optical Fiber', customerType: 'Corporate', package: 'Diamond 100Mbps', speed: '100 Mbps', monthlyBill: 10000, macAddress: 'AA:BB:CC:DD:EE:05', server: 'MikroTik-02', billingStatus: 'Active', manualStatus: true },
  { id: '6', code: 'C-006', username: 'islam006', password: '********', customerName: 'Islam Brothers', mobile: '01712345683', zone: 'Zone A', connectionType: 'Optical Fiber', customerType: 'Business', package: 'Gold 20Mbps', speed: '20 Mbps', monthlyBill: 1500, macAddress: 'AA:BB:CC:DD:EE:06', server: 'MikroTik-01', billingStatus: 'Active', manualStatus: true },
  { id: '7', code: 'C-007', username: 'hossain007', password: '********', customerName: 'Hossain Store', mobile: '01712345684', zone: 'Zone C', connectionType: 'UTP', customerType: 'Business', package: 'Silver 10Mbps', speed: '10 Mbps', monthlyBill: 800, macAddress: 'AA:BB:CC:DD:EE:07', server: 'MikroTik-03', billingStatus: 'Due', manualStatus: true },
  { id: '8', code: 'C-008', username: 'ali008', password: '********', customerName: 'Ali Corporation', mobile: '01712345685', zone: 'Zone B', connectionType: 'Optical Fiber', customerType: 'Corporate', package: 'Platinum 50Mbps', speed: '50 Mbps', monthlyBill: 5000, macAddress: 'AA:BB:CC:DD:EE:08', server: 'MikroTik-02', billingStatus: 'Active', manualStatus: true },
];

const statCards: StatCard[] = [
  { title: 'Running Clients', value: 523, icon: <Wifi className="w-5 h-5" />, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  { title: 'New Clients', value: 10, icon: <UserPlus className="w-5 h-5" />, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  { title: 'Renewed Clients', value: 0, icon: <RefreshCw className="w-5 h-5" />, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  { title: 'Waiver Clients', value: 8, icon: <CreditCard className="w-5 h-5" />, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
];

// ============================================================================
// Components
// ============================================================================

// Breadcrumb Component
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

// Statistics Card Component
function StatCardComponent({ stat }: { stat: StatCard }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{stat.title}</p>
          <p className="text-2xl font-bold text-white mt-1">{stat.value.toLocaleString()}</p>
        </div>
        <div className={cn('p-2.5 rounded-lg', stat.bgColor)}>
          <span className={stat.color}>{stat.icon}</span>
        </div>
      </div>
    </div>
  );
}

// Dropdown Button Component
function DropdownButton({
  label,
  icon,
  children,
  isOpen,
  onToggle
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-slate-200 transition-all"
      >
        {icon}
        {label}
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1">
          {children}
        </div>
      )}
    </div>
  );
}

// Dropdown Item Component
function DropdownItem({
  icon,
  label,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles = {
    Active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
    Due: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };
  
  return (
    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full border', styles[status as keyof typeof styles] || styles.Active)}>
      {status}
    </span>
  );
}

// Table Header Component
function TableHeader({ 
  label, 
  sortable = false,
  sortKey,
  currentSort,
  onSort 
}: { 
  label: string; 
  sortable?: boolean;
  sortKey?: string;
  currentSort?: { key: string; direction: 'asc' | 'desc' };
  onSort?: (key: string) => void;
}) {
  return (
    <th 
      className={cn(
        'px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider',
        sortable && 'cursor-pointer hover:text-slate-200'
      )}
      onClick={sortable && sortKey && onSort ? () => onSort(sortKey) : undefined}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortable && sortKey && (
          <ArrowUpDown className={cn(
            'w-3 h-3',
            currentSort?.key === sortKey ? 'text-blue-400' : 'text-slate-600'
          )} />
        )}
      </div>
    </th>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function ClientListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [clients] = useState<Client[]>(sampleClients);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | undefined>(undefined);
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    client.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.mobile.includes(searchQuery) ||
    client.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort clients
  const sortedClients = useMemo(() => {
    if (!sortConfig) return filteredClients;
    return [...filteredClients].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof Client];
      const bVal = b[sortConfig.key as keyof Client];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [filteredClients, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const togglePassword = (id: string) => {
    setShowPasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* HEADER AREA */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-800/50 border-b border-slate-700/50">
        <div className="px-6 py-4">
          {/* Breadcrumb */}
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Client', href: '/client' },
              { label: 'Client List' },
            ]} 
          />
          
          {/* Title Row */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Client List</h1>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-full">
                {clients.length.toLocaleString()}
              </span>
            </div>
            <a 
              href="/client" 
              className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Users className="w-4 h-4" />
              View All Client
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="p-6">
        
        {/* ── ACTION BUTTONS SECTION ── */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {/* Export Dropdown */}
          <DropdownButton
            label="Export"
            icon={<Download className="w-4 h-4" />}
            isOpen={openDropdown === 'export'}
            onToggle={() => setOpenDropdown(openDropdown === 'export' ? null : 'export')}
          >
            <DropdownItem icon={<FileSpreadsheet className="w-4 h-4" />} label="Generate Excel" />
            <DropdownItem icon={<FileText className="w-4 h-4" />} label="Generate PDF" />
          </DropdownButton>

          {/* Bulk Actions Dropdown */}
          <DropdownButton
            label="Bulk Actions"
            icon={<Users className="w-4 h-4" />}
            isOpen={openDropdown === 'bulk'}
            onToggle={() => setOpenDropdown(openDropdown === 'bulk' ? null : 'bulk')}
          >
            <DropdownItem icon={<Package className="w-4 h-4" />} label="Bulk Profile Change" />
            <DropdownItem icon={<Gauge className="w-4 h-4" />} label="Bulk Package Change" />
            <DropdownItem icon={<ToggleLeft className="w-4 h-4" />} label="Bulk Status Change" />
          </DropdownButton>

          {/* Network Actions Dropdown */}
          <DropdownButton
            label="Network Actions"
            icon={<Link2 className="w-4 h-4" />}
            isOpen={openDropdown === 'network'}
            onToggle={() => setOpenDropdown(openDropdown === 'network' ? null : 'network')}
          >
            <DropdownItem icon={<Unlink className="w-4 h-4" />} label="Unbind All PPPoE MAC" />
            <DropdownItem icon={<Link2 className="w-4 h-4" />} label="Bind All PPPoE MAC" />
            <DropdownItem icon={<RefreshCw className="w-4 h-4" />} label="Sync Clients & Servers" />
          </DropdownButton>

          {/* Search */}
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-64"
              />
            </div>
            <button className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── STATISTICS CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => (
            <StatCardComponent key={index} stat={stat} />
          ))}
        </div>

        {/* ── CLIENT TABLE ── */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/80 sticky top-0">
                <tr>
                  <TableHeader label="C.Code" sortable sortKey="code" currentSort={sortConfig} onSort={handleSort} />
                  <TableHeader label="ID/IP" sortable sortKey="username" currentSort={sortConfig} onSort={handleSort} />
                  <TableHeader label="Password" />
                  <TableHeader label="Cus. Name" sortable sortKey="customerName" currentSort={sortConfig} onSort={handleSort} />
                  <TableHeader label="Mobile" sortable sortKey="mobile" currentSort={sortConfig} onSort={handleSort} />
                  <TableHeader label="Zone" sortable sortKey="zone" currentSort={sortConfig} onSort={handleSort} />
                  <TableHeader label="Conn. Type" />
                  <TableHeader label="Cus. Type" />
                  <TableHeader label="Package/Speed" />
                  <TableHeader label="M.Bill" sortable sortKey="monthlyBill" currentSort={sortConfig} onSort={handleSort} />
                  <TableHeader label="MAC Address" />
                  <TableHeader label="Server" sortable sortKey="server" currentSort={sortConfig} onSort={handleSort} />
                  <TableHeader label="B.Status" sortable sortKey="billingStatus" currentSort={sortConfig} onSort={handleSort} />
                  <TableHeader label="M.Status" />
                  <TableHeader label="Action" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {sortedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-3 text-sm font-medium text-blue-400">{client.code}</td>
                    <td className="px-3 py-3 text-sm text-slate-200">{client.username}</td>
                    <td className="px-3 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono">
                          {showPasswords.has(client.id) ? client.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePassword(client.id)}
                          className="text-slate-500 hover:text-slate-300"
                        >
                          {showPasswords.has(client.id) ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-white">{client.customerName}</td>
                    <td className="px-3 py-3 text-sm text-slate-400">{client.mobile}</td>
                    <td className="px-3 py-3 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {client.zone}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded',
                        client.connectionType === 'Optical Fiber' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      )}>
                        {client.connectionType}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-400">{client.customerType}</td>
                    <td className="px-3 py-3 text-sm">
                      <div>
                        <div className="text-white font-medium">{client.package}</div>
                        <div className="text-slate-500 text-xs">{client.speed}</div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-white font-medium">৳{client.monthlyBill.toLocaleString()}</td>
                    <td className="px-3 py-3 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 font-mono text-xs">{client.macAddress}</span>
                        <button className="text-slate-500 hover:text-slate-300" title="Copy MAC">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-400">{client.server}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={client.billingStatus} />
                    </td>
                    <td className="px-3 py-3">
                      <button className={cn(
                        'w-10 h-5 rounded-full transition-colors relative',
                        client.manualStatus ? 'bg-emerald-500' : 'bg-slate-600'
                      )}>
                        <span className={cn(
                          'absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform',
                          client.manualStatus ? 'left-5' : 'left-0.5'
                        )} />
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
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

          {/* Table Footer */}
          <div className="px-4 py-3 bg-slate-800/30 border-t border-slate-700/50 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing <span className="text-slate-300">{sortedClients.length}</span> of <span className="text-slate-300">{clients.length}</span> clients
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm text-slate-400 hover:text-white bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm text-slate-400 hover:text-white bg-slate-800 border border-slate-700 rounded-lg">
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
