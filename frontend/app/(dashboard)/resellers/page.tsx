'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Plus, 
  Search,
  Pencil,
  Trash2,
  Eye,
  DollarSign,
  BarChart3,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Settings,
  TrendingUp
} from 'lucide-react';

// Types
interface Reseller {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  address?: string;
  notes?: string;
  role: 'admin' | 'macro' | 'reseller' | 'sub_reseller';
  level: number;
  parentId?: string;
  walletBalance: string;
  commissionType: 'percentage' | 'fixed' | 'margin';
  commissionValue: string;
  fundDependencyEnabled: boolean;
  creditLimit: string;
  status: 'active' | 'suspended' | 'inactive' | 'pending';
  createdAt: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description?: string;
  createdAt: string;
}

interface ResellerStats {
  totalChildren: number;
  totalDescendants: number;
  totalRevenue: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  currentBalance: number;
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Role badge component
const RoleBadge = ({ role }: { role: string }) => {
  const styles: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800',
    macro: 'bg-blue-100 text-blue-800',
    reseller: 'bg-cyan-100 text-cyan-800',
    sub_reseller: 'bg-indigo-100 text-indigo-800',
  };
  
  const labels: Record<string, string> = {
    admin: 'Admin',
    macro: 'Macro',
    reseller: 'Reseller',
    sub_reseller: 'Sub-Reseller',
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[role] || 'bg-gray-100'}`}>
      {labels[role] || role}
    </span>
  );
};

// Format currency
const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
};

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function ResellersPage() {
  // State
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<ResellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'wallet'>('create');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterParent, setFilterParent] = useState<string>('');

  // Load resellers
  const loadResellers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterParent) params.append('parentId', filterParent);
      
      const response = await fetch(`/api/resellers?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setResellers(data);
      }
    } catch (error) {
      console.error('Failed to load resellers:', error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterParent]);

  // Load transactions for selected reseller
  const loadTransactions = async (resellerId: string) => {
    try {
      const response = await fetch(`/api/resellers/${resellerId}/wallet/transactions?limit=20`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  // Load stats for selected reseller
  const loadStats = async (resellerId: string) => {
    try {
      const response = await fetch(`/api/resellers/${resellerId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    loadResellers();
  }, [loadResellers]);

  useEffect(() => {
    if (selectedReseller) {
      loadTransactions(selectedReseller.id);
      loadStats(selectedReseller.id);
    }
  }, [selectedReseller]);

  // Filter resellers
  const filteredResellers = resellers.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.companyName && r.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle create/edit reseller
  const handleSaveReseller = async (data: Partial<Reseller>) => {
    try {
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const url = modalMode === 'create' 
        ? '/api/resellers' 
        : `/api/resellers/${selectedReseller?.id}`;
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowModal(false);
        loadResellers();
      }
    } catch (error) {
      console.error('Failed to save reseller:', error);
    }
  };

  // Handle delete reseller
  const handleDeleteReseller = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reseller?')) return;
    
    try {
      const response = await fetch(`/api/resellers/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSelectedReseller(null);
        loadResellers();
      }
    } catch (error) {
      console.error('Failed to delete reseller:', error);
    }
  };

  // Handle add funds
  const handleAddFunds = async (amount: number, description?: string) => {
    if (!selectedReseller) return;
    
    try {
      const response = await fetch(`/api/resellers/${selectedReseller.id}/wallet/credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description }),
      });

      if (response.ok) {
        loadResellers();
        loadTransactions(selectedReseller.id);
        loadStats(selectedReseller.id);
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to add funds:', error);
    }
  };

  // Render tree view
  const renderResellerTree = (parentId: string | null = null, level: number = 0) => {
    const children = parentId 
      ? filteredResellers.filter(r => r.parentId === parentId)
      : filteredResellers.filter(r => !r.parentId);

    return children.map(reseller => (
      <div key={reseller.id} style={{ marginLeft: level * 24 }}>
        <div 
          className={`flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
            selectedReseller?.id === reseller.id 
              ? 'bg-blue-50 border border-blue-200' 
              : 'hover:bg-gray-50 border border-transparent'
          }`}
          onClick={() => setSelectedReseller(reseller)}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white font-medium">
              {reseller.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{reseller.name}</p>
              <p className="text-sm text-gray-500">{reseller.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <RoleBadge role={reseller.role} />
            <StatusBadge status={reseller.status} />
            <div className="text-right">
              <p className="font-medium text-gray-900">{formatCurrency(reseller.walletBalance)}</p>
              <p className="text-xs text-gray-500">Balance</p>
            </div>
          </div>
        </div>
        {renderResellerTree(reseller.id, level + 1)}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reseller Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your multi-level reseller hierarchy with commission and wallet control
            </p>
          </div>
          <button
            onClick={() => {
              setModalMode('create');
              setSelectedReseller(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Reseller
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-4 border-t border-gray-200 pt-4 -mx-6 px-6 overflow-x-auto">
          <a href="/resellers" className="px-4 py-2 text-gray-900 font-semibold border-b-2 border-blue-600 text-blue-600 whitespace-nowrap">
            <Users className="inline-block w-4 h-4 mr-2" /> Resellers
          </a>
          <a href="/resellers/tariffs" className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 transition-colors whitespace-nowrap">
            <BarChart3 className="inline-block w-4 h-4 mr-2" /> Tariffs
          </a>
          <a href="/resellers/packages" className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 transition-colors whitespace-nowrap">
            <FileText className="inline-block w-4 h-4 mr-2" /> Packages
          </a>
          <a href="/resellers/funds" className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 transition-colors whitespace-nowrap">
            <DollarSign className="inline-block w-4 h-4 mr-2" /> Funds
          </a>
          <a href="/resellers/payment-history" className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 transition-colors whitespace-nowrap">
            <CreditCard className="inline-block w-4 h-4 mr-2" /> Payments
          </a>
          <a href="/resellers/payment-gateway" className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 transition-colors whitespace-nowrap">
            <Settings className="inline-block w-4 h-4 mr-2" /> Gateway
          </a>
          <a href="/resellers/settlements" className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 transition-colors whitespace-nowrap">
            <TrendingUp className="inline-block w-4 h-4 mr-2" /> Settlements
          </a>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={loadResellers}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reseller Tree */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Reseller Hierarchy
                </h2>
              </div>
              <div className="p-4 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredResellers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No resellers found</p>
                  </div>
                ) : (
                  renderResellerTree()
                )}
              </div>
            </div>
          </div>

          {/* Reseller Details */}
          <div className="space-y-6">
            {selectedReseller ? (
              <>
                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
                    <h2 className="font-semibold text-white flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Reseller Details
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {selectedReseller.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedReseller.name}</h3>
                        <p className="text-sm text-gray-500">{selectedReseller.email}</p>
                        <div className="flex gap-2 mt-1">
                          <RoleBadge role={selectedReseller.role} />
                          <StatusBadge status={selectedReseller.status} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Company</span>
                        <span className="font-medium">{selectedReseller.companyName || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone</span>
                        <span className="font-medium">{selectedReseller.phone || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Level</span>
                        <span className="font-medium">Level {selectedReseller.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fund Dependency</span>
                        <span className={`font-medium ${selectedReseller.fundDependencyEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                          {selectedReseller.fundDependencyEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Credit Limit</span>
                        <span className="font-medium">{formatCurrency(selectedReseller.creditLimit)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setModalMode('edit');
                          setShowModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setModalMode('wallet');
                          setShowModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <DollarSign className="w-4 h-4" />
                        Add Funds
                      </button>
                      <button
                        onClick={() => handleDeleteReseller(selectedReseller.id)}
                        className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Wallet Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Wallet & Commission
                    </h2>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-600 font-medium">Balance</p>
                        <p className="text-xl font-bold text-green-700">
                          {formatCurrency(selectedReseller.walletBalance)}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-medium">Commission</p>
                        <p className="text-xl font-bold text-blue-700">
                          {selectedReseller.commissionType === 'percentage' 
                            ? `${selectedReseller.commissionValue}%` 
                            : formatCurrency(selectedReseller.commissionValue)}
                        </p>
                      </div>
                    </div>

                    {stats && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Revenue</span>
                          <span className="font-medium">{formatCurrency(stats.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Commission Earned</span>
                          <span className="font-medium text-green-600">{formatCurrency(stats.totalCommissionEarned)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Commission Paid</span>
                          <span className="font-medium text-red-600">{formatCurrency(stats.totalCommissionPaid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Sub-Resellers</span>
                          <span className="font-medium">{stats.totalDescendants}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Recent Transactions
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                    {transactions.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No transactions yet</div>
                    ) : (
                      transactions.map(tx => (
                        <div key={tx.id} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {tx.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              tx.type === 'credit' || tx.type === 'commission_earned' || tx.type === 'package_sale'
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {tx.type === 'credit' || tx.type === 'commission_earned' || tx.type === 'package_sale' ? '+' : '-'}
                              {formatCurrency(tx.amount)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Select a reseller to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === 'create' && 'Create Reseller'}
                {modalMode === 'edit' && 'Edit Reseller'}
                {modalMode === 'view' && 'Reseller Details'}
                {modalMode === 'wallet' && 'Add Funds'}
              </h3>
            </div>
            
            <div className="p-6">
              {modalMode === 'wallet' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      id="walletAmount"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      id="walletDescription"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Bank transfer, Deposit"
                    />
                  </div>
                </div>
              ) : (
                <ResellerForm 
                  reseller={modalMode === 'edit' && selectedReseller ? selectedReseller : undefined}
                  resellers={resellers}
                  onSave={handleSaveReseller}
                />
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              {modalMode === 'wallet' ? (
                <button
                  onClick={() => {
                    const amount = parseFloat((document.getElementById('walletAmount') as HTMLInputElement).value);
                    const description = (document.getElementById('walletDescription') as HTMLInputElement).value;
                    if (amount > 0) {
                      handleAddFunds(amount, description);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Funds
                </button>
              ) : (
                <button
                  onClick={() => {
                    const form = document.getElementById('resellerForm') as HTMLFormElement;
                    if (form) {
                      const formData = new FormData(form);
                      handleSaveReseller(Object.fromEntries(formData));
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modalMode === 'create' ? 'Create' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reseller Form Component
function ResellerForm({ 
  reseller, 
  resellers,
  onSave 
}: { 
  reseller?: Reseller; 
  resellers: Reseller[];
  onSave: (data: Partial<Reseller>) => void;
}) {
  return (
    <form id="resellerForm" className="space-y-4">
      <input type="hidden" name="id" value={reseller?.id || ''} />
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            name="name"
            required
            defaultValue={reseller?.name || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            name="companyName"
            defaultValue={reseller?.companyName || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            required
            defaultValue={reseller?.email || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="text"
            name="phone"
            defaultValue={reseller?.phone || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            name="role"
            defaultValue={reseller?.role || 'reseller'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="macro">Macro</option>
            <option value="reseller">Reseller</option>
            <option value="sub_reseller">Sub-Reseller</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parent Reseller
          </label>
          <select
            name="parentId"
            defaultValue={reseller?.parentId || ''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">None (Top Level)</option>
            {resellers.filter(r => r.id !== reseller?.id).map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commission Type
          </label>
          <select
            name="commissionType"
            defaultValue={reseller?.commissionType || 'percentage'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount</option>
            <option value="margin">Margin Based</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commission Value
          </label>
          <input
            type="number"
            name="commissionValue"
            min="0"
            max="100"
            step="0.01"
            defaultValue={reseller?.commissionValue || '0'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credit Limit
          </label>
          <input
            type="number"
            name="creditLimit"
            min="0"
            step="0.01"
            defaultValue={reseller?.creditLimit || '0'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Balance
          </label>
          <input
            type="number"
            name="walletBalance"
            min="0"
            step="0.01"
            defaultValue={reseller?.walletBalance || '0'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="fundDependencyEnabled"
            defaultChecked={reseller?.fundDependencyEnabled ?? true}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Enable Fund Dependency</span>
        </label>

        {reseller && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              defaultValue={reseller.status}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <textarea
          name="address"
          rows={2}
          defaultValue={reseller?.address || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={reseller?.notes || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </form>
  );
}
