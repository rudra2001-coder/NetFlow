'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardBody, CardHeader, Button, Badge, Input } from '@/components';
import { getStoredToken } from '@/lib/auth/authVerifier';
import { 
  CreditCard, Plus, Search, Filter, Download, 
  Calendar, DollarSign, User, Receipt, ChevronRight,
  Banknote, Building2, Smartphone, CreditCardIcon, CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock payment data
interface Payment {
  id: string;
  customerName: string;
  customerPhone: string;
  invoices: string[];
  amount: number;
  method: string;
  paymentDate: string;
  collectorName?: string;
  transactionId?: string;
  discount: number;
  advance: number;
  notes?: string;
  status: 'completed' | 'pending' | 'failed';
}

const mockPayments: Payment[] = [
  { 
    id: 'PAY-2026-001', 
    customerName: 'Rahim Ahmed', 
    customerPhone: '+8801712345678',
    invoices: ['INV-2026-001'], 
    amount: 450, 
    method: 'cash', 
    paymentDate: '2026-02-20',
    collectorName: 'Admin',
    discount: 0,
    advance: 0,
    status: 'completed'
  },
  
];

const methodLabels: Record<string, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  bkash: 'bKash',
  nagad: 'Nagad',
  card: 'Card',
  online: 'Online',
  other: 'Other',
};

const methodIcons: Record<string, React.ReactNode> = {
  cash: <Banknote className="w-4 h-4" />,
  bank_transfer: <Building2 className="w-4 h-4" />,
  bkash: <Smartphone className="w-4 h-4" />,
  nagad: <Smartphone className="w-4 h-4" />,
  card: <CreditCardIcon className="w-4 h-4" />,
  online: <CreditCard className="w-4 h-4" />,
  other: <Receipt className="w-4 h-4" />,
};

export default function AccountingPayments() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 500);
  }, []);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !payment.customerName.toLowerCase().includes(q) &&
          !payment.customerPhone.includes(q) &&
          !payment.id.toLowerCase().includes(q) &&
          !payment.invoices.some(inv => inv.toLowerCase().includes(q))
        ) {
          return false;
        }
      }
      // Method filter
      if (methodFilter !== 'all' && payment.method !== methodFilter) {
        return false;
      }
      // Date filter
      if (dateFilter !== 'all') {
        const paymentDate = new Date(payment.paymentDate);
        const now = new Date();
        if (dateFilter === 'today') {
          if (paymentDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (paymentDate < weekAgo) return false;
        } else if (dateFilter === 'month') {
          if (paymentDate.getMonth() !== now.getMonth() || paymentDate.getFullYear() !== now.getFullYear()) return false;
        }
      }
      return true;
    });
  }, [payments, searchQuery, methodFilter, dateFilter]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      total: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
      count: filteredPayments.length,
      today: filteredPayments
        .filter(p => new Date(p.paymentDate).toDateString() === new Date().toDateString())
        .reduce((sum, p) => sum + p.amount, 0),
    };
  }, [filteredPayments]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Payments</h1>
          <p className="text-neutral-500">Track and manage all customer payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button onClick={() => router.push('/accounting/payments/new')}>
            <Plus className="w-4 h-4 mr-2" /> Record Payment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Today's Collection</p>
                <p className="text-2xl font-bold">${totals.today.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Collected</p>
                <p className="text-2xl font-bold">${totals.total.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Transactions</p>
                <p className="text-2xl font-bold">{totals.count}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by customer, invoice ID..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
            </div>

            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader 
          title="Payment History" 
          subtitle={`${filteredPayments.length} transactions found`}
        />
        <CardBody className="p-0">
          {loading ? (
            <div className="p-8 text-center text-neutral-500">Loading payments...</div>
          ) : filteredPayments.length > 0 ? (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredPayments.map((payment) => (
                <div 
                  key={payment.id}
                  className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/accounting/payments/${payment.id}`)}
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Customer Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                        <User className="w-5 h-5 text-neutral-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-neutral-900 dark:text-white">
                            {payment.customerName}
                          </p>
                          <Badge variant={payment.status === 'completed' ? 'success' : 'warning'}>
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <span>{payment.id}</span>
                          <span>•</span>
                          <span>{payment.customerPhone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Invoice Info */}
                    <div className="hidden md:block">
                      <p className="text-sm text-neutral-500">Invoices</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {payment.invoices.join(', ')}
                      </p>
                    </div>

                    {/* Right: Amount & Method */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">
                          ${payment.amount.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-neutral-500">
                          {methodIcons[payment.method]}
                          <span>{methodLabels[payment.method]}</span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-neutral-500">
                        <p>{formatDate(payment.paymentDate)}</p>
                        {payment.transactionId && (
                          <p className="text-xs">Ref: {payment.transactionId}</p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-neutral-400" />
                    </div>
                  </div>

                  {/* Notes if present */}
                  {payment.notes && (
                    <div className="mt-2 text-sm text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 rounded p-2">
                      Note: {payment.notes}
                    </div>
                  )}

                  {/* Discount/Advance info */}
                  {(payment.discount > 0 || payment.advance > 0) && (
                    <div className="mt-2 flex gap-2">
                      {payment.discount > 0 && (
                        <Badge variant="info">Discount: ${payment.discount}</Badge>
                      )}
                      {payment.advance > 0 && (
                        <Badge variant="success">Advance: ${payment.advance}</Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-neutral-500">
              <Receipt className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p className="font-medium">No payments found</p>
              <p className="text-sm">Try adjusting your filters or record a new payment</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
