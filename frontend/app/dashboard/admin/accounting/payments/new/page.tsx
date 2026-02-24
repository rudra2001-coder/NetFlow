'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Select, Badge } from '@/components';
import { getStoredToken } from '@/lib/auth/authVerifier';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, DollarSign, Calendar, User, FileText, 
  Search, Percent, Save, X, CheckCircle, AlertCircle,
  Banknote, Building2, Smartphone, CreditCardIcon, Receipt
} from 'lucide-react';

// Mock customer data - in production, fetch from API
interface Customer {
  id: string;
  name: string;
  phone: string;
  username: string;
  dueAmount: number;
  pendingInvoices: { id: string; amount: number; dueDate: string; month: string }[];
}

const mockCustomers: Customer[] = [
  { id: 'CUS001', name: 'Rahim Ahmed', phone: '+8801712345678', username: 'rahim.isp', dueAmount: 450, pendingInvoices: [
    { id: 'INV-2026-001', amount: 450, dueDate: '2026-02-20', month: 'February 2026' }
  ]},
  { id: 'CUS002', name: 'Karim Khan', phone: '+8801812345678', username: 'karim.net', dueAmount: 1200, pendingInvoices: [
    { id: 'INV-2026-002', amount: 600, dueDate: '2026-02-15', month: 'February 2026' },
    { id: 'INV-2026-003', amount: 600, dueDate: '2026-01-15', month: 'January 2026' }
  ]},
  { id: 'CUS003', name: 'John Doe', phone: '+8801912345678', username: 'john.doe', dueAmount: 890, pendingInvoices: [
    { id: 'INV-2026-004', amount: 890, dueDate: '2026-02-10', month: 'February 2026' }
  ]},
  { id: 'CUS004', name: 'Sarah Smith', phone: '+8801512345678', username: 'sarah.s', dueAmount: 0, pendingInvoices: [] },
  { id: 'CUS005', name: 'Mike Wilson', phone: '+8801612345678', username: 'mike.w', dueAmount: 2100, pendingInvoices: [
    { id: 'INV-2026-005', amount: 700, dueDate: '2026-02-20', month: 'February 2026' },
    { id: 'INV-2026-006', amount: 700, dueDate: '2026-01-20', month: 'January 2026' },
    { id: 'INV-2025-012', amount: 700, dueDate: '2025-12-20', month: 'December 2025' }
  ]},
];

// Payment methods with icons
const paymentMethods = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
  { value: 'bkash', label: 'bKash', icon: Smartphone },
  { value: 'nagad', label: 'Nagad', icon: Smartphone },
  { value: 'card', label: 'Debit/Credit Card', icon: CreditCardIcon },
  { value: 'online', label: 'Online Payment', icon: CreditCard },
  { value: 'other', label: 'Other', icon: Receipt },
];

export default function NewPaymentPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [form, setForm] = useState({
    method: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    receivedAmount: '',
    discountAmount: '0',
    advanceAmount: '0',
    notes: '',
    collectorName: '',
    transactionId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return mockCustomers;
    const q = searchQuery.toLowerCase();
    return mockCustomers.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.username.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Calculate totals
  const selectedInvoiceTotal = useMemo(() => {
    if (!selectedCustomer) return 0;
    return selectedCustomer.pendingInvoices
      .filter(inv => selectedInvoices.includes(inv.id))
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [selectedCustomer, selectedInvoices]);

  const totalDue = selectedCustomer?.dueAmount || 0;
  const received = parseFloat(form.receivedAmount) || 0;
  const discount = parseFloat(form.discountAmount) || 0;
  const advance = parseFloat(form.advanceAmount) || 0;
  const totalPaid = received + discount;
  const change = totalPaid > selectedInvoiceTotal ? totalPaid - selectedInvoiceTotal : 0;

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchQuery(customer.name);
    // Auto-select all pending invoices
    setSelectedInvoices(customer.pendingInvoices.map(inv => inv.id));
  };

  const toggleInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleMethodChange = (value: string) => {
    setForm({ ...form, method: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }
    if (selectedInvoices.length === 0) {
      setError('Please select at least one invoice to pay');
      return;
    }
    if (received < selectedInvoiceTotal - discount) {
      setError('Received amount is less than total invoice amount minus discount');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getStoredToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        invoices: selectedInvoices,
        method: form.method,
        paymentDate: form.paymentDate,
        receivedAmount: received,
        discountAmount: discount,
        advanceAmount: advance,
        totalInvoiceAmount: selectedInvoiceTotal,
        notes: form.notes,
        collectorName: form.collectorName,
        transactionId: form.transactionId,
      };

      // In production, this would call the actual API
      // const res = await fetch('/api/accounting/payments', {
      //   method: 'POST',
      //   headers,
      //   body: JSON.stringify(payload),
      // });
      
      // Simulate success for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(`Payment of $${received} recorded successfully! Change: $${change.toFixed(2)}`);
      
      // Reset form after success
      setTimeout(() => {
        router.push('/accounting/payments');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setSelectedInvoices([]);
    setSearchQuery('');
    setForm({
      method: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      receivedAmount: '',
      discountAmount: '0',
      advanceAmount: '0',
      notes: '',
      collectorName: '',
      transactionId: '',
    });
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Record Payment</h1>
          <p className="text-neutral-500">Process customer bill payments with full tracking</p>
        </div>
        <Button variant="ghost" onClick={() => router.push('/accounting/payments')}>
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-700 dark:text-green-400">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700 dark:text-red-400">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Customer Selection */}
        <Card>
          <CardHeader 
            title="Step 1: Select Customer" 
            subtitle="Search by name, phone, or username"
            action={<Badge variant="default">Required</Badge>}
          />
          <CardBody className="space-y-4">
            {/* Customer Search */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!e.target.value) setSelectedCustomer(null);
                  }}
                  placeholder="Search customer by name, phone, or username..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Customer Dropdown */}
              {searchQuery && !selectedCustomer && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(customer => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => handleCustomerSelect(customer)}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{customer.name}</p>
                          <p className="text-sm text-neutral-500">{customer.username} • {customer.phone}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-medium ${customer.dueAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            ${customer.dueAmount.toFixed(2)}
                          </span>
                          <p className="text-xs text-neutral-500">Due</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-center text-neutral-500">No customers found</div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Customer Info */}
            {selectedCustomer && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">{selectedCustomer.name}</p>
                      <p className="text-sm text-neutral-500">{selectedCustomer.username} • {selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                    Change
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Step 2: Invoice Selection */}
        {selectedCustomer && (
          <Card>
            <CardHeader 
              title="Step 2: Select Invoices" 
              subtitle={`Total Due: $${totalDue.toFixed(2)}`}
              action={<Badge variant={selectedInvoices.length > 0 ? "success" : "warning"}>{selectedInvoices.length} selected</Badge>}
            />
            <CardBody>
              {selectedCustomer.pendingInvoices.length > 0 ? (
                <div className="space-y-2">
                  {selectedCustomer.pendingInvoices.map(invoice => (
                    <label
                      key={invoice.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedInvoices.includes(invoice.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => toggleInvoice(invoice.id)}
                          className="w-5 h-5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{invoice.id}</p>
                          <p className="text-sm text-neutral-500">{invoice.month}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900 dark:text-white">${invoice.amount.toFixed(2)}</p>
                        <p className="text-xs text-neutral-500">Due: {invoice.dueDate}</p>
                      </div>
                    </label>
                  ))}
                  
                  {/* Select All / Clear All */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedInvoices(selectedCustomer.pendingInvoices.map(inv => inv.id))}
                    >
                      Select All
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedInvoices([])}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="font-medium">No pending invoices</p>
                  <p className="text-sm">This customer has no outstanding bills</p>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Step 3: Payment Details */}
        {selectedInvoices.length > 0 && (
          <Card>
            <CardHeader 
              title="Step 3: Payment Details" 
              subtitle="Enter payment information"
            />
            <CardBody className="space-y-6">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {paymentMethods.map(method => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => handleMethodChange(method.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                          form.method === method.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Date & Collector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="date"
                      name="paymentDate"
                      value={form.paymentDate}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Collector Name
                  </label>
                  <input
                    type="text"
                    name="collectorName"
                    value={form.collectorName}
                    onChange={handleChange}
                    placeholder="Enter collector name"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Transaction ID (for digital payments) */}
              {['bank_transfer', 'bkash', 'nagad', 'card', 'online'].includes(form.method) && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Transaction ID / Reference No.
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    value={form.transactionId}
                    onChange={handleChange}
                    placeholder={`Enter ${paymentMethods.find(m => m.value === form.method)?.label} transaction ID`}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Amount Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Received Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="number"
                      name="receivedAmount"
                      value={form.receivedAmount}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Discount Amount
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="number"
                      name="discountAmount"
                      value={form.discountAmount}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Advance / Extra
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="number"
                      name="advanceAmount"
                      value={form.advanceAmount}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Add any additional notes..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Payment Summary */}
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Total Invoice Amount:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">${selectedInvoiceTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Received Amount:</span>
                    <span className="font-semibold text-green-600">+${received.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Discount:</span>
                    <span className="font-semibold text-blue-600">-${discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Advance:</span>
                    <span className="font-semibold text-purple-600">+${advance.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2 mt-2 flex justify-between">
                    <span className="font-medium text-neutral-900 dark:text-white">Total Paid:</span>
                    <span className="font-bold text-green-600">${totalPaid.toFixed(2)}</span>
                  </div>
                  {change > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span className="font-medium">Change to Return:</span>
                      <span className="font-bold">${change.toFixed(2)}</span>
                    </div>
                  )}
                  {totalPaid < selectedInvoiceTotal && (
                    <div className="flex justify-between text-red-600">
                      <span className="font-medium">Remaining:</span>
                      <span className="font-bold">${(selectedInvoiceTotal - totalPaid).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Submit Button */}
        {selectedInvoices.length > 0 && (
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={resetForm}>
              Reset
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[150px]">
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Record Payment
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
