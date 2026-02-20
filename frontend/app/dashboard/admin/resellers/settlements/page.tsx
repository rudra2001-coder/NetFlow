'use client';

import { useState } from 'react';
import { 
  TrendingUp,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  Building2
} from 'lucide-react';

const SettlementsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock settlement data
  const settlements = [
    {
      id: 'SETTLE-001',
      reseller: 'TeleComm Networks',
      period: '2026-02-01 to 2026-02-15',
      grossRevenue: 15000.00,
      commissions: 1500.00,
      deductions: 200.00,
      netAmount: 13300.00,
      status: 'completed',
      settledDate: '2026-02-16',
      paymentMethod: 'Bank Transfer',
      referenceId: 'REF-20260216-001'
    },
    {
      id: 'SETTLE-002',
      reseller: 'NetWorks Pro',
      period: '2026-02-01 to 2026-02-15',
      grossRevenue: 8500.00,
      commissions: 850.00,
      deductions: 100.00,
      netAmount: 7550.00,
      status: 'completed',
      settledDate: '2026-02-16',
      paymentMethod: 'Bank Transfer',
      referenceId: 'REF-20260216-002'
    },
    {
      id: 'SETTLE-003',
      reseller: 'Speednet',
      period: '2026-02-01 to 2026-02-15',
      grossRevenue: 6200.00,
      commissions: 620.00,
      deductions: 50.00,
      netAmount: 5530.00,
      status: 'pending',
      settledDate: null,
      paymentMethod: 'Pending',
      referenceId: 'REF-20260217-001'
    },
    {
      id: 'SETTLE-004',
      reseller: 'Digital Connect',
      period: '2026-01-16 to 2026-01-31',
      grossRevenue: 12000.00,
      commissions: 1200.00,
      deductions: 150.00,
      netAmount: 10650.00,
      status: 'completed',
      settledDate: '2026-02-01',
      paymentMethod: 'Bank Transfer',
      referenceId: 'REF-20260201-001'
    },
    {
      id: 'SETTLE-005',
      reseller: 'TeleComm Networks',
      period: '2026-01-16 to 2026-01-31',
      grossRevenue: 14500.00,
      commissions: 1450.00,
      deductions: 200.00,
      netAmount: 12850.00,
      status: 'completed',
      settledDate: '2026-02-01',
      paymentMethod: 'Bank Transfer',
      referenceId: 'REF-20260201-002'
    },
    {
      id: 'SETTLE-006',
      reseller: 'NetWorks Pro',
      period: '2026-01-16 to 2026-01-31',
      grossRevenue: 8000.00,
      commissions: 800.00,
      deductions: 100.00,
      netAmount: 7100.00,
      status: 'failed',
      settledDate: null,
      paymentMethod: 'Bank Transfer',
      referenceId: 'REF-20260201-003'
    },
  ];

  // Summary statistics
  const stats = {
    totalSettlements: settlements.filter(s => s.status === 'completed').length,
    totalAmount: settlements.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.netAmount, 0),
    pendingAmount: settlements.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.netAmount, 0),
    totalCommissions: settlements.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.commissions, 0),
  };

  const filteredSettlements = settlements.filter(settlement => {
    const matchesSearch = 
      settlement.reseller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      settlement.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      settlement.referenceId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || settlement.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settlements</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Manage and track reseller fund settlements</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalSettlements}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-100 dark:text-green-900" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Settled Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-100 dark:text-green-900" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending Settlements</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">${stats.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-100 dark:text-yellow-900" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Commissions</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">${stats.totalCommissions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-100 dark:text-blue-900" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search settlements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Settlements Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Settlement ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Reseller</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Period</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Gross Revenue</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Net Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Settled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSettlements.map((settlement) => (
                  <tr key={settlement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{settlement.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{settlement.reseller}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{settlement.period}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">${settlement.grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400">${settlement.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(settlement.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{settlement.settledDate || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSettlements.length === 0 && (
            <div className="px-6 py-12 text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No settlements found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettlementsPage;
