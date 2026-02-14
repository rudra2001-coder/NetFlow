/**
 * ISP Management Page - Super Admin
 * Create, manage, and suspend ISPs (multi-tenant management)
 */

'use client';

import { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Ban,
  CheckCircle,
  Router,
  Users,
  DollarSign,
  AlertTriangle,
  Eye,
  KeyRound,
  Mail,
  Phone,
  Globe,
  Calendar,
  Shield
} from 'lucide-react';

// ISP Type
interface ISP {
  id: string;
  name: string;
  slug: string;
  domain: string;
  status: 'active' | 'suspended' | 'pending';
  plan: 'basic' | 'professional' | 'enterprise';
  routerCount: number;
  userCount: number;
  monthlyRevenue: number;
  createdAt: string;
  contactEmail: string;
  contactPhone: string;
  routerLimit: number;
  userLimit: number;
}

// Mock Data
const mockISPs: ISP[] = [
  {
    id: '1',
    name: 'FastNet ISP',
    slug: 'fastnet',
    domain: 'fastnet.isp.netflow.app',
    status: 'active',
    plan: 'enterprise',
    routerCount: 12,
    userCount: 1240,
    monthlyRevenue: 4500,
    createdAt: '2024-01-15',
    contactEmail: 'admin@fastnet.isp',
    contactPhone: '+1 234 567 890',
    routerLimit: 50,
    userLimit: 5000,
  },
  {
    id: '2',
    name: 'CityConnect',
    slug: 'cityconnect',
    domain: 'cityconnect.netflow.app',
    status: 'active',
    plan: 'professional',
    routerCount: 8,
    userCount: 890,
    monthlyRevenue: 2800,
    createdAt: '2024-02-20',
    contactEmail: 'support@cityconnect.net',
    contactPhone: '+1 345 678 901',
    routerLimit: 20,
    userLimit: 2000,
  },
  {
    id: '3',
    name: 'RuralLink',
    slug: 'rurallink',
    domain: 'rurallink.netflow.app',
    status: 'active',
    plan: 'basic',
    routerCount: 5,
    userCount: 450,
    monthlyRevenue: 1200,
    createdAt: '2024-03-10',
    contactEmail: 'info@rurallink.com',
    contactPhone: '+1 456 789 012',
    routerLimit: 10,
    userLimit: 500,
  },
  {
    id: '4',
    name: 'MetroNet',
    slug: 'metronet',
    domain: 'metronet.netflow.app',
    status: 'suspended',
    plan: 'basic',
    routerCount: 3,
    userCount: 0,
    monthlyRevenue: 0,
    createdAt: '2024-01-05',
    contactEmail: 'admin@metronet.isp',
    contactPhone: '+1 567 890 123',
    routerLimit: 10,
    userLimit: 500,
  },
  {
    id: '5',
    name: 'SkyBroadband',
    slug: 'skybroadband',
    domain: 'skybroadband.netflow.app',
    status: 'active',
    plan: 'enterprise',
    routerCount: 15,
    userCount: 2100,
    monthlyRevenue: 6200,
    createdAt: '2023-11-20',
    contactEmail: 'tech@skybroadband.net',
    contactPhone: '+1 678 901 234',
    routerLimit: 50,
    userLimit: 5000,
  },
];

// Plan Badge Component
const PlanBadge = ({ plan }: { plan: ISP['plan'] }) => {
  const planStyles = {
    basic: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    professional: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    enterprise: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${planStyles[plan]}`}>
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: ISP['status'] }) => {
  const statusStyles = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  const statusIcons = {
    active: CheckCircle,
    suspended: Ban,
    pending: AlertTriangle,
  };

  const Icon = statusIcons[status];

  return (
    <span className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status]}`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Create ISP Modal
interface CreateISPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ISP>) => void;
}

const CreateISPModal = ({ isOpen, onClose, onSubmit }: CreateISPModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    contactEmail: '',
    contactPhone: '',
    plan: 'basic' as ISP['plan'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Create New ISP</h2>
            <p className="text-sm text-slate-400">Register a new ISP organization</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">ISP Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                placeholder="FastNet ISP"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                placeholder="fastnet"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Domain</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                placeholder="fastnet"
              />
              <span className="text-slate-400">.netflow.app</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                placeholder="admin@isp.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Subscription Plan</label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value as ISP['plan'] })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
            >
              <option value="basic">Basic (10 routers, 500 users)</option>
              <option value="professional">Professional (20 routers, 2000 users)</option>
              <option value="enterprise">Enterprise (50 routers, 5000 users)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Create ISP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ISP Detail Modal
interface ISPDetailModalProps {
  isp: ISP | null;
  isOpen: boolean;
  onClose: () => void;
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
}

const ISPDetailModal = ({ isp, isOpen, onClose, onSuspend, onActivate }: ISPDetailModalProps) => {
  if (!isOpen || !isp) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{isp.name}</h2>
              <p className="text-sm text-slate-400">{isp.domain}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PlanBadge plan={isp.plan} />
            <StatusBadge status={isp.status} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Router className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-slate-400">Routers</span>
            </div>
            <p className="text-2xl font-bold text-white">{isp.routerCount}</p>
            <p className="text-xs text-slate-500">Limit: {isp.routerLimit}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-400">Users</span>
            </div>
            <p className="text-2xl font-bold text-white">{isp.userCount.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Limit: {isp.userLimit.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-400">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-white">${isp.monthlyRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Per month</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Email:</span>
            <span className="text-white">{isp.contactEmail}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Phone:</span>
            <span className="text-white">{isp.contactPhone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Domain:</span>
            <span className="text-white">{isp.domain}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Created:</span>
            <span className="text-white">{isp.createdAt}</span>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
          <div className="flex gap-2">
            {isp.status === 'active' ? (
              <button
                onClick={() => onSuspend(isp.id)}
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Suspend ISP
              </button>
            ) : (
              <button
                onClick={() => onActivate(isp.id)}
                className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Activate ISP
              </button>
            )}
            <button className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg font-medium transition-colors flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              Reset Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main ISP Management Page
export default function ISPManagementPage() {
  const [isps, setISPs] = useState<ISP[]>(mockISPs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedISP, setSelectedISP] = useState<ISP | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Filter ISPs
  const filteredISPs = isps.filter((isp) => {
    const matchesSearch = isp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      isp.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || isp.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || isp.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Handle create ISP
  const handleCreateISP = (data: Partial<ISP>) => {
    const newISP: ISP = {
      id: String(isps.length + 1),
      name: data.name || '',
      slug: data.slug || '',
      domain: `${data.slug}.netflow.app`,
      status: 'pending',
      plan: data.plan || 'basic',
      routerCount: 0,
      userCount: 0,
      monthlyRevenue: 0,
      createdAt: new Date().toISOString().split('T')[0],
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      routerLimit: data.plan === 'enterprise' ? 50 : data.plan === 'professional' ? 20 : 10,
      userLimit: data.plan === 'enterprise' ? 5000 : data.plan === 'professional' ? 2000 : 500,
    };
    setISPs([...isps, newISP]);
  };

  // Handle suspend ISP
  const handleSuspendISP = (id: string) => {
    setISPs(isps.map((isp) => 
      isp.id === id ? { ...isp, status: 'suspended' as const } : isp
    ));
    setDetailModalOpen(false);
  };

  // Handle activate ISP
  const handleActivateISP = (id: string) => {
    setISPs(isps.map((isp) => 
      isp.id === id ? { ...isp, status: 'active' as const } : isp
    ));
    setDetailModalOpen(false);
  };

  // Stats
  const stats = {
    total: isps.length,
    active: isps.filter((i) => i.status === 'active').length,
    suspended: isps.filter((i) => i.status === 'suspended').length,
    totalRevenue: isps.reduce((sum, i) => sum + i.monthlyRevenue, 0),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">ISP Management</h1>
          <p className="text-slate-400">Create and manage ISP organizations</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create ISP
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-400">Total ISPs</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-400">Active</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-400">Suspended</p>
          <p className="text-2xl font-bold text-red-400">{stats.suspended}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-400">Total MRR</p>
          <p className="text-2xl font-bold text-purple-400">${stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ISPs..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-red-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
        >
          <option value="all">All Plans</option>
          <option value="basic">Basic</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* ISP Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase">ISP</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase">Status</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase">Plan</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase">Routers</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase">Users</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase">Revenue</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredISPs.map((isp) => (
              <tr key={isp.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{isp.name}</p>
                      <p className="text-xs text-slate-500">{isp.domain}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={isp.status} />
                </td>
                <td className="px-6 py-4">
                  <PlanBadge plan={isp.plan} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Router className="w-4 h-4 text-orange-400" />
                    <span className="text-white">{isp.routerCount}</span>
                    <span className="text-xs text-slate-500">/ {isp.routerLimit}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-white">{isp.userCount.toLocaleString()}</span>
                    <span className="text-xs text-slate-500">/ {isp.userLimit.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-emerald-400 font-medium">${isp.monthlyRevenue.toLocaleString()}/mo</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setSelectedISP(isp);
                        setDetailModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <CreateISPModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateISP}
      />
      <ISPDetailModal
        isp={selectedISP}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onSuspend={handleSuspendISP}
        onActivate={handleActivateISP}
      />
    </div>
  );
}
