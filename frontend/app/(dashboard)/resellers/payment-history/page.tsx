'use client';

import { useState } from 'react';
import { 
  CreditCard,
  Search,
  Download,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  RefreshCw
} from 'lucide-react';

const PaymentHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGateway, setFilterGateway] = useState('all');

  // Mock payment history data
  const payments = [
    {
      id: 'PAY-001',
      reseller: 'TeleComm Networks',
      amount: 5000.00,
      method: 'Bank Transfer',
      gateway: 'Stripe',
      status: 'completed',
      date: '2026-02-19',
      transactionId: 'txn_1ABC123XYZ',
      description: 'Monthly fund deposit'
    },
    {
      id: 'PAY-002',
      reseller: 'NetWorks Pro',
      amount: 2500.00,
      method: 'Credit Card',
      gateway: 'PayPal',
      status: 'completed',
      date: '2026-02-18',
      transactionId: 'txn_2DEF456UVW',
      description: 'Weekly top-up'
    },
    {
      id: 'PAY-003',
      reseller: 'Speednet',
      amount: 1500.00,
      method: 'Bank Transfer',
      gateway: 'Stripe',
      status: 'pending',
      date: '2026-02-17',
      transactionId: 'txn_3GHI789STU',
      description: 'Fund addition'
    },
    {
      id: 'PAY-004',
      reseller: 'TeleComm Networks',
      amount: 3000.00,
      method: 'Cryptocurrency',
      gateway: 'Coinbase Commerce',
      status: 'completed',
      date: '2026-02-16',
      transactionId: 'txn_4JKL012RST',
      description: 'Crypto payment'
    },
    {
      id: 'PAY-005',
      reseller: 'NetWorks Pro',
      amount: 800.00,
      method: 'Credit Card',
      gateway: 'Stripe',
      status: 'failed',
      date: '2026-02-15',
      transactionId: 'txn_5MNO345PQR',
      description: 'Failed retry'
    },
    {
      id: 'PAY-006',
      reseller: 'Speednet',
      amount: 2200.00,
      method: 'Bank Transfer',
      gateway: 'Wise',
      status: 'completed',
      date: '2026-02-14',
      transactionId: 'txn_6PQR678NOP',
      description: 'International transfer'
    },
  ];

  // Summary statistics
  const stats = {
    totalPayments: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    completedCount: payments.filter(p => p.status === 'completed').length,
    pendingCount: payments.filter(p => p.status === 'pending').length,
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.reseller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesGateway = filterGateway === 'all' || payment.gateway === filterGateway;
    
    return matchesSearch && matchesStatus && matchesGateway;
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
            <CreditCard className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment History</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Track all reseller payments and transactions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalPayments}</p>
              </div>
              <CreditCard className="w-10 h-10 text-blue-100 dark:text-blue-900" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-100 dark:text-green-900" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.completedCount}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-100 dark:text-green-900" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.pendingCount}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-100 dark:text-yellow-900" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
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

            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={filterGateway}
                onChange={(e) => setFilterGateway(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Gateways</option>
                <option value="Stripe">Stripe</option>
                <option value="PayPal">PayPal</option>
                <option value="Wise">Wise</option>
                <option value="Coinbase Commerce">Coinbase Commerce</option>
              </select>
            </div>

            <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Payment ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Reseller</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Method</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Gateway</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{payment.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{payment.reseller}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{payment.method}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{payment.gateway}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(payment.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{payment.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="px-6 py-12 text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No payments found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
