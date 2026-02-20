'use client';

import React, { useState } from 'react';
import { Plus, Send, History, DollarSign, Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Badge } from '@/components';

interface FundTransaction {
  id: string;
  resellerId: string;
  resellerName: string;
  type: 'credit' | 'debit' | 'adjustment';
  amount: number;
  reason: string;
  balance: number;
  date: string;
  approvedBy?: string;
}

interface ResellerWallet {
  id: string;
  resellerName: string;
  email: string;
  currentBalance: number;
  availableBalance: number;
  pendingBalance: number;
  totalCredit: number;
  totalDebit: number;
  creditLimit: number;
  lastUpdated: string;
}

const mockWallets: ResellerWallet[] = [
  {
    id: '1',
    resellerName: 'TeleComm Networks',
    email: 'admin@telecomm.com',
    currentBalance: 5250.75,
    availableBalance: 5000,
    pendingBalance: 250.75,
    totalCredit: 15000,
    totalDebit: 9749.25,
    creditLimit: 10000,
    lastUpdated: '2024-02-19 14:32:00',
  },
  {
    id: '2',
    resellerName: 'NetWorks Pro',
    email: 'sales@networkspro.com',
    currentBalance: 2100.50,
    availableBalance: 2000,
    pendingBalance: 100.50,
    totalCredit: 8000,
    totalDebit: 5899.50,
    creditLimit: 5000,
    lastUpdated: '2024-02-19 12:15:00',
  },
];

const mockTransactions: FundTransaction[] = [
  {
    id: '1',
    resellerId: '1',
    resellerName: 'TeleComm Networks',
    type: 'credit',
    amount: 2500,
    reason: 'Manual fund credit',
    balance: 5250.75,
    date: '2024-02-18 10:30:00',
    approvedBy: 'admin@company.com',
  },
  {
    id: '2',
    resellerId: '1',
    resellerName: 'TeleComm Networks',
    type: 'debit',
    amount: 500,
    reason: 'Package purchase',
    balance: 2750.75,
    date: '2024-02-17 15:45:00',
  },
  {
    id: '3',
    resellerId: '2',
    resellerName: 'NetWorks Pro',
    type: 'credit',
    amount: 1500,
    reason: 'Refund for cancelled service',
    balance: 2100.50,
    date: '2024-02-16 09:20:00',
    approvedBy: 'support@company.com',
  },
];

export default function ResellersFundsPage() {
  const [wallets] = useState<ResellerWallet[]>(mockWallets);
  const [transactions] = useState<FundTransaction[]>(mockTransactions);
  const [selectedReseller, setSelectedReseller] = useState<string | null>(null);
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [fundReason, setFundReason] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Reseller Funds Management</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Add funds and manage wallet balances for resellers
          </p>
        </div>
        <Button onClick={() => setShowFundModal(true)}>
          <Plus size={18} className="mr-2" /> Add Funds
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Wallet size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Balance</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    ${wallets.reduce((sum, w) => sum + w.currentBalance, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <DollarSign size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Available Balance</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    ${wallets.reduce((sum, w) => sum + w.availableBalance, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <TrendingUp size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Credit Limit</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    ${wallets.reduce((sum, w) => sum + w.creditLimit, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Wallets List */}
      <Card>
        <CardHeader title="Reseller Wallets"></CardHeader>
        <CardBody>
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900 dark:text-white">{wallet.resellerName}</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{wallet.email}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Current Balance</p>
                        <p className="text-lg font-semibold text-neutral-900 dark:text-white">${wallet.currentBalance.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Available</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">${wallet.availableBalance.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Credit Limit</p>
                        <p className="text-lg font-semibold text-neutral-900 dark:text-white">${wallet.creditLimit.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Last Updated</p>
                        <p className="text-sm text-neutral-900 dark:text-white">{wallet.lastUpdated}</p>
                      </div>
                    </div>

                    {wallet.currentBalance > wallet.creditLimit && (
                      <div className="flex items-center gap-2 mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                        <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                        <p className="text-sm text-red-700 dark:text-red-300">Balance exceeds credit limit</p>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedReseller(wallet.id);
                      setShowFundModal(true);
                    }}
                    className="ml-4"
                  >
                    <Send size={16} className="mr-1" /> Add Funds
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader title="Recent Transactions"></CardHeader>
        <CardBody>
          <div className="space-y-2">
            {transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${
                      txn.type === 'credit'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : txn.type === 'debit'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}
                  >
                    <DollarSign
                      size={18}
                      className={
                        txn.type === 'credit'
                          ? 'text-green-600 dark:text-green-400'
                          : txn.type === 'debit'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-blue-600 dark:text-blue-400'
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-white">{txn.resellerName}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{txn.reason}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={`font-bold text-lg ${txn.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">{txn.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Add Funds Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader title="Add Funds to Reseller Wallet"></CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  Select Reseller
                </label>
                <select
                  value={selectedReseller || ''}
                  onChange={(e) => setSelectedReseller(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                >
                  <option value="">Choose a reseller...</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.resellerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  Reason
                </label>
                <textarea
                  value={fundReason}
                  onChange={(e) => setFundReason(e.target.value)}
                  placeholder="Enter reason for crediting funds..."
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFundModal(false);
                    setFundAmount('');
                    setFundReason('');
                    setSelectedReseller(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button className="flex-1">
                  <Send size={16} className="mr-2" /> Add Funds
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
