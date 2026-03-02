'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardBody, CardHeader, Button, Badge, Input } from '@/components';
import { 
  BookOpen, Plus, Search, Download, 
  Calendar, DollarSign, User, Receipt, 
  Banknote, Building2, ArrowUpRight, ArrowDownLeft, Save
} from 'lucide-react';

interface CashBookEntry {
  id: string;
  date: string;
  voucherNo: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  type: 'receipt' | 'payment' | 'transfer';
  account: string;
  reference?: string;
}

const mockCashBookEntries: CashBookEntry[] = [
  { id: '1', date: '2026-03-01', voucherNo: 'CBR-001', description: 'Opening Balance', debit: 50000, credit: 0, balance: 50000, type: 'receipt', account: 'Capital Account' },
  { id: '2', date: '2026-03-02', voucherNo: 'CBR-002', description: 'Internet Bill Collection - Customer A', debit: 2500, credit: 0, balance: 52500, type: 'receipt', account: 'Service Income' },
  { id: '3', date: '2026-03-02', voucherNo: 'CBR-003', description: 'Internet Bill Collection - Customer B', debit: 1800, credit: 0, balance: 54300, type: 'receipt', account: 'Service Income' },
  { id: '4', date: '2026-03-03', voucherNo: 'CBP-001', description: 'Office Rent Payment', debit: 0, credit: 15000, balance: 39300, type: 'payment', account: 'Rent Expense' },
  { id: '5', date: '2026-03-03', voucherNo: 'CBP-002', description: 'Internet Bill Collection - Customer C', debit: 3200, credit: 0, balance: 42500, type: 'receipt', account: 'Service Income' },
  { id: '6', date: '2026-03-04', voucherNo: 'CBP-003', description: 'Electricity Bill', debit: 0, credit: 5500, balance: 37000, type: 'payment', account: 'Utility Expense' },
  { id: '7', date: '2026-03-04', voucherNo: 'CBR-004', description: 'Reseller Payment Received', debit: 25000, credit: 0, balance: 62000, type: 'receipt', account: 'Reseller Income' },
  { id: '8', date: '2026-03-05', voucherNo: 'CBP-004', description: 'Staff Salary - February', debit: 0, credit: 35000, balance: 27000, type: 'payment', account: 'Salary Expense' },
];

const accountTypes = [
  { value: 'service_income', label: 'Service Income' },
  { value: 'reseller_income', label: 'Reseller Income' },
  { value: 'installation_charge', label: 'Installation Charge' },
  { value: 'other_income', label: 'Other Income' },
  { value: 'rent_expense', label: 'Rent Expense' },
  { value: 'utility_expense', label: 'Utility Expense' },
  { value: 'salary_expense', label: 'Salary Expense' },
  { value: 'maintenance_expense', label: 'Maintenance Expense' },
  { value: 'marketing_expense', label: 'Marketing Expense' },
  { value: 'other_expense', label: 'Other Expense' },
  { value: 'capital_account', label: 'Capital Account' },
  { value: 'bank_account', label: 'Bank Account' },
  { value: 'customer_receivable', label: 'Customer Receivable' },
];

export default function CashBookPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'receipt' as 'receipt' | 'payment',
    account: '',
    reference: '',
  });

  const filteredEntries = useMemo(() => {
    return mockCashBookEntries.filter(entry => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        entry.description.toLowerCase().includes(q) ||
        entry.voucherNo.toLowerCase().includes(q) ||
        entry.account.toLowerCase().includes(q);
      
      const matchesType = typeFilter === 'all' || entry.type === typeFilter;
      
      const matchesDateFrom = !dateFrom || entry.date >= dateFrom;
      const matchesDateTo = !dateTo || entry.date <= dateTo;
      
      return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
    });
  }, [searchQuery, typeFilter, dateFrom, dateTo]);

  const totals = useMemo(() => {
    const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);
    const closingBalance = totalDebit - totalCredit;
    return { totalDebit, totalCredit, closingBalance };
  }, [filteredEntries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Cash Book Entry:', formData);
    setShowForm(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      type: 'receipt',
      account: '',
      reference: '',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-blue-600" />
            Cash Book
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track all cash receipts and payments with debit/credit entries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {}}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Total Receipts</p>
                <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                  ৳ {totals.totalDebit.toLocaleString()}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">Total Payments</p>
                <p className="text-xl font-bold text-red-800 dark:text-red-200">
                  ৳ {totals.totalCredit.toLocaleString()}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className={`bg-gradient-to-br ${totals.closingBalance >= 0 ? 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800' : 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800'}`}>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${totals.closingBalance >= 0 ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                <Banknote className={`w-5 h-5 ${totals.closingBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Current Balance</p>
                <p className={`text-xl font-bold ${totals.closingBalance >= 0 ? 'text-blue-800 dark:text-blue-200' : 'text-red-800 dark:text-red-200'}`}>
                  ৳ {totals.closingBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <Receipt className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Entries</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  {filteredEntries.length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader 
          title="Cash Book Entries" 
          subtitle={`Showing ${filteredEntries.length} entries`}
        />
        <CardBody className="p-0">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search entries..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="all">All Types</option>
                <option value="receipt">Receipts</option>
                <option value="payment">Payments</option>
                <option value="transfer">Transfer</option>
              </select>
              <Input 
                type="date" 
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-auto"
                placeholder="From"
              />
              <Input 
                type="date" 
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-auto"
                placeholder="To"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Voucher No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Account</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-600 uppercase">Debit (৳)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-red-600 uppercase">Credit (৳)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Balance (৳)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {entry.voucherNo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                      {entry.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {entry.account}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-emerald-600 font-medium">
                      {entry.debit > 0 ? entry.debit.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                      {entry.credit > 0 ? entry.credit.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-slate-800 dark:text-slate-200">
                      {entry.balance.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge 
                        variant={entry.type === 'receipt' ? 'success' : entry.type === 'payment' ? 'error' : 'warning'}
                      >
                        {entry.type === 'receipt' ? 'Receipt' : entry.type === 'payment' ? 'Payment' : 'Transfer'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 dark:bg-slate-800 font-semibold">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">Totals</td>
                  <td className="px-4 py-3 text-right text-emerald-700 dark:text-emerald-300">{totals.totalDebit.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-red-700 dark:text-red-300">{totals.totalCredit.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-200">{totals.closingBalance.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardBody>
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">New Cash Book Entry</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <Input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'receipt' | 'payment'})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    required
                  >
                    <option value="receipt">Cash Receipt</option>
                    <option value="payment">Cash Payment</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <Input 
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account</label>
                <select 
                  value={formData.account}
                  onChange={(e) => setFormData({...formData, account: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  required
                >
                  <option value="">Select Account</option>
                  {accountTypes.map(acc => (
                    <option key={acc.value} value={acc.label}>{acc.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (৳)</label>
                <Input 
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reference (Optional)</label>
                <Input 
                  placeholder="Transaction ID, Check No, etc."
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Entry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
