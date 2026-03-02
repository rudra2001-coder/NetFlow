'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardBody, CardHeader, Button, Badge, Input } from '@/components';
import { 
  PenTool, Plus, Search, Download, 
  Calendar, DollarSign, User, Receipt, 
  Banknote, Building2, ArrowLeftRight, Save, FileText
} from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  voucherNo: string;
  description: string;
  entries: {
    account: string;
    debit: number;
    credit: number;
  }[];
  totalDebit: number;
  totalCredit: number;
  type: 'journal' | 'contra' | 'adjustment';
  createdBy: string;
}

const mockJournalEntries: JournalEntry[] = [
  { 
    id: '1', 
    date: '2026-03-01', 
    voucherNo: 'JRN-001', 
    description: 'Received payment from Customer A',
    entries: [
      { account: 'Cash in Hand', debit: 2500, credit: 0 },
      { account: 'Accounts Receivable - Customer A', debit: 0, credit: 2500 },
    ],
    totalDebit: 2500,
    totalCredit: 2500,
    type: 'journal',
    createdBy: 'Admin'
  },
  { 
    id: '2', 
    date: '2026-03-02', 
    voucherNo: 'JRN-002', 
    description: 'Paid office rent for March',
    entries: [
      { account: 'Rent Expense', debit: 15000, credit: 0 },
      { account: 'Cash in Hand', debit: 0, credit: 15000 },
    ],
    totalDebit: 15000,
    totalCredit: 15000,
    type: 'journal',
    createdBy: 'Admin'
  },
  { 
    id: '3', 
    date: '2026-03-02', 
    voucherNo: 'JRN-003', 
    description: 'Bank to Cash transfer',
    entries: [
      { account: 'Cash in Hand', debit: 20000, credit: 0 },
      { account: 'Bank Account', debit: 0, credit: 20000 },
    ],
    totalDebit: 20000,
    totalCredit: 20000,
    type: 'contra',
    createdBy: 'Admin'
  },
  { 
    id: '4', 
    date: '2026-03-03', 
    voucherNo: 'JRN-004', 
    description: 'Electricity bill payment',
    entries: [
      { account: 'Utility Expense - Electricity', debit: 5500, credit: 0 },
      { account: 'Cash in Hand', debit: 0, credit: 5500 },
    ],
    totalDebit: 5500,
    totalCredit: 5500,
    type: 'journal',
    createdBy: 'Admin'
  },
  { 
    id: '5', 
    date: '2026-03-04', 
    voucherNo: 'JRN-005', 
    description: 'Staff salary paid',
    entries: [
      { account: 'Salary Expense', debit: 35000, credit: 0 },
      { account: 'Cash in Hand', debit: 0, credit: 35000 },
    ],
    totalDebit: 35000,
    totalCredit: 35000,
    type: 'journal',
    createdBy: 'Admin'
  },
  { 
    id: '6', 
    date: '2026-03-04', 
    voucherNo: 'JRN-006', 
    description: 'Purchase of network equipment',
    entries: [
      { account: 'Fixed Assets - Equipment', debit: 45000, credit: 0 },
      { account: 'Bank Account', debit: 0, credit: 45000 },
    ],
    totalDebit: 45000,
    totalCredit: 45000,
    type: 'adjustment',
    createdBy: 'Admin'
  },
];

const chartOfAccounts = [
  { category: 'Assets', accounts: ['Cash in Hand', 'Bank Account', 'Accounts Receivable', 'Fixed Assets - Equipment', 'Prepaid Expenses'] },
  { category: 'Liabilities', accounts: ['Accounts Payable', 'Loan Payable', 'Tax Payable'] },
  { category: 'Income', accounts: ['Service Income', 'Reseller Income', 'Installation Charge', 'Other Income'] },
  { category: 'Expenses', accounts: ['Rent Expense', 'Utility Expense', 'Salary Expense', 'Maintenance Expense', 'Marketing Expense', 'Depreciation Expense'] },
  { category: 'Capital', accounts: ['Capital Account', 'Owner Equity', 'Retained Earnings'] },
];

export default function JournalPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'journal' as 'journal' | 'contra' | 'adjustment',
    entries: [
      { account: '', debit: '', credit: '' },
      { account: '', debit: '', credit: '' },
    ],
  });

  const filteredEntries = useMemo(() => {
    return mockJournalEntries.filter(entry => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        entry.description.toLowerCase().includes(q) ||
        entry.voucherNo.toLowerCase().includes(q) ||
        entry.entries.some(e => e.account.toLowerCase().includes(q));
      
      const matchesType = typeFilter === 'all' || entry.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [searchQuery, typeFilter]);

  const totals = useMemo(() => {
    const totalDebit = filteredEntries.reduce((sum, e) => sum + e.totalDebit, 0);
    const totalCredit = filteredEntries.reduce((sum, e) => sum + e.totalCredit, 0);
    return { totalDebit, totalCredit };
  }, [filteredEntries]);

  const addEntryRow = () => {
    setFormData({
      ...formData,
      entries: [...formData.entries, { account: '', debit: '', credit: '' }]
    });
  };

  const removeEntryRow = (index: number) => {
    if (formData.entries.length > 2) {
      const newEntries = formData.entries.filter((_, i) => i !== index);
      setFormData({ ...formData, entries: newEntries });
    }
  };

  const updateEntry = (index: number, field: string, value: string) => {
    const newEntries = [...formData.entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setFormData({ ...formData, entries: newEntries });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Journal Entry:', formData);
    setShowForm(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      type: 'journal',
      entries: [
        { account: '', debit: '', credit: '' },
        { account: '', debit: '', credit: '' },
      ],
    });
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'journal': return <Badge variant="info">Journal</Badge>;
      case 'contra': return <Badge variant="warning">Contra</Badge>;
      case 'adjustment': return <Badge variant="default">Adjustment</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <PenTool className="w-7 h-7 text-blue-600" />
            Journal / Day Book
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Record double-entry transactions with debit and credit vouchers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {}}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Journal Entry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <ArrowLeftRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Entries</p>
                <p className="text-xl font-bold text-blue-800 dark:text-blue-200">
                  {filteredEntries.length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Total Debit</p>
                <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                  ৳ {totals.totalDebit.toLocaleString()}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Total Credit</p>
                <p className="text-xl font-bold text-purple-800 dark:text-purple-200">
                  ৳ {totals.totalCredit.toLocaleString()}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader 
          title="Journal Entries" 
          subtitle={`Showing ${filteredEntries.length} entries with double-entry transactions`}
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
                <option value="journal">Journal</option>
                <option value="contra">Contra</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredEntries.map((entry) => (
              <div key={entry.id}>
                <div 
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                  onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-white">{entry.voucherNo}</span>
                          {getTypeBadge(entry.type)}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{entry.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-emerald-600 font-medium">Dr: ৳ {entry.totalDebit.toLocaleString()}</p>
                        <p className="text-sm text-purple-600 font-medium">Cr: ৳ {entry.totalCredit.toLocaleString()}</p>
                      </div>
                      <div className="text-right text-sm text-slate-500">
                        <p>{new Date(entry.date).toLocaleDateString()}</p>
                        <p>By: {entry.createdBy}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {expandedEntry === entry.id && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-200 dark:border-slate-700">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-500 dark:text-slate-400">
                          <th className="text-left py-2 px-4 font-medium">Account</th>
                          <th className="text-right py-2 px-4 font-medium text-emerald-600">Debit (৳)</th>
                          <th className="text-right py-2 px-4 font-medium text-purple-600">Credit (৳)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {entry.entries.map((line, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-4 text-slate-800 dark:text-slate-200">{line.account}</td>
                            <td className="py-2 px-4 text-right text-emerald-600">{line.debit > 0 ? line.debit.toLocaleString() : '-'}</td>
                            <td className="py-2 px-4 text-right text-purple-600">{line.credit > 0 ? line.credit.toLocaleString() : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="font-semibold">
                        <tr>
                          <td className="py-2 px-4 text-slate-800 dark:text-slate-200">Total</td>
                          <td className="py-2 px-4 text-right text-emerald-700">{entry.totalDebit.toLocaleString()}</td>
                          <td className="py-2 px-4 text-right text-purple-700">{entry.totalCredit.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">New Journal Entry</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
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
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'journal' | 'contra' | 'adjustment'})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    required
                  >
                    <option value="journal">Journal</option>
                    <option value="contra">Contra</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description / Narration</label>
                <Input 
                  placeholder="Enter transaction description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="text-left py-2 px-4 font-medium text-slate-600">Account</th>
                      <th className="text-right py-2 px-4 font-medium text-emerald-600">Debit (৳)</th>
                      <th className="text-right py-2 px-4 font-medium text-purple-600">Credit (৳)</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {formData.entries.map((entry, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-2">
                          <select 
                            value={entry.account}
                            onChange={(e) => updateEntry(idx, 'account', e.target.value)}
                            className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                            required
                          >
                            <option value="">Select Account</option>
                            {chartOfAccounts.map(cat => (
                              <optgroup key={cat.category} label={cat.category}>
                                {cat.accounts.map(acc => (
                                  <option key={acc} value={acc}>{acc}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <Input 
                            type="number"
                            placeholder="0.00"
                            value={entry.debit}
                            onChange={(e) => updateEntry(idx, 'debit', e.target.value)}
                            className="text-right"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input 
                            type="number"
                            placeholder="0.00"
                            value={entry.credit}
                            onChange={(e) => updateEntry(idx, 'credit', e.target.value)}
                            className="text-right"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          {formData.entries.length > 2 && (
                            <button 
                              type="button" 
                              onClick={() => removeEntryRow(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                  <button 
                    type="button"
                    onClick={addEntryRow}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Line
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Journal Entry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
