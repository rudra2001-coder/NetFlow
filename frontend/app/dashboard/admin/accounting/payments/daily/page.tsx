'use client';

import React, { useState, useMemo } from "react";
import { 
  Calendar, Search, Download, Printer, DollarSign, 
  CreditCard, User, FileText, Square, Check, ChevronDown,
  Mail, MoreVertical
} from "lucide-react";
import { Button, Card, CardBody, CardHeader, Badge, Modal } from "@/components";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Mock Data
// ============================================================================

interface DailyCollection {
  id: string;
  date: string;
  customerName: string;
  username: string;
  phone: string;
  amount: number;
  method: string;
  invoiceId: string;
  collector: string;
  transactionId?: string;
  customerCode: string;
}

const mockCollections: DailyCollection[] = [
  // Today's collections
  { id: 'PAY-001', date: '2026-02-20', customerName: 'Rahim Ahmed', username: 'rahim.isp', phone: '+8801712345678', amount: 450, method: 'cash', invoiceId: 'INV-2026-0201', collector: 'Admin', customerCode: 'C-001' },
  { id: 'PAY-002', date: '2026-02-20', customerName: 'Sarah Smith', username: 'sarah.s', phone: '+8801512345678', amount: 550, method: 'bkash', invoiceId: 'INV-2026-0202', collector: 'Admin', transactionId: 'BK123456', customerCode: 'C-004' },
  { id: 'PAY-003', date: '2026-02-20', customerName: 'David Brown', username: 'david.b', phone: '+8801412345678', amount: 480, method: 'bank_transfer', invoiceId: 'INV-2026-0203', collector: 'John', transactionId: 'ACB789012', customerCode: 'C-007' },
  
  // Yesterday's collections
  { id: 'PAY-004', date: '2026-02-19', customerName: 'Karim Khan', username: 'karim.net', phone: '+8801812345678', amount: 600, method: 'cash', invoiceId: 'INV-2026-0198', collector: 'Admin', customerCode: 'C-002' },
  { id: 'PAY-005', date: '2026-02-19', customerName: 'Lisa Anderson', username: 'lisa.a', phone: '+8801312345678', amount: 380, method: 'nagad', invoiceId: 'INV-2026-0199', collector: 'John', transactionId: 'NG456789', customerCode: 'C-006' },
  { id: 'PAY-006', date: '2026-02-19', customerName: 'Emma Wilson', username: 'emma.w', phone: '+8801712345679', amount: 900, method: 'card', invoiceId: 'INV-2026-0200', collector: 'Admin', transactionId: 'CARD123', customerCode: 'C-008' },
  
  // Feb 18
  { id: 'PAY-007', date: '2026-02-18', customerName: 'Mike Wilson', username: 'mike.w', phone: '+8801612345678', amount: 1200, method: 'bank_transfer', invoiceId: 'INV-2026-0195', collector: 'Admin', transactionId: 'DBL456123', customerCode: 'C-005' },
  { id: 'PAY-008', date: '2026-02-18', customerName: 'John Doe', username: 'john.doe', phone: '+8801912345678', amount: 300, method: 'cash', invoiceId: 'INV-2026-0196', collector: 'Sarah', customerCode: 'C-003' },
  
  // Feb 17
  { id: 'PAY-009', date: '2026-02-17', customerName: 'Robert Taylor', username: 'robert.t', phone: '+8801212345678', amount: 750, method: 'bkash', invoiceId: 'INV-2026-0192', collector: 'John', transactionId: 'BK789123', customerCode: 'C-009' },
  { id: 'PAY-010', date: '2026-02-17', customerName: 'Jennifer Lee', username: 'jennifer.l', phone: '+8801112345678', amount: 420, method: 'cash', invoiceId: 'INV-2026-0193', collector: 'Admin', customerCode: 'C-010' },
  
  // Feb 16
  { id: 'PAY-011', date: '2026-02-16', customerName: 'Thomas Garcia', username: 'thomas.g', phone: '+8801012345678', amount: 680, method: 'nagad', invoiceId: 'INV-2026-0190', collector: 'Sarah', transactionId: 'NG123456', customerCode: 'C-011' },
  { id: 'PAY-012', date: '2026-02-16', customerName: 'Mary Johnson', username: 'mary.j', phone: '+8800912345678', amount: 520, method: 'bank_transfer', invoiceId: 'INV-2026-0191', collector: 'John', transactionId: 'ACB321654', customerCode: 'C-012' },
];

const methodLabels: Record<string, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  bkash: 'bKash',
  nagad: 'Nagad',
  card: 'Card',
};

// ============================================================================
// Main Page Component
// ============================================================================

export default function DailyCollectionPage() {
  const [startDate, setStartDate] = useState('2026-02-16');
  const [endDate, setEndDate] = useState('2026-02-20');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<DailyCollection | null>(null);

  // Filter collections by date range
  const filteredCollections = useMemo(() => {
    return mockCollections.filter(collection => {
      const collectionDate = new Date(collection.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const withinDateRange = collectionDate >= start && collectionDate <= end;
      
      const matchesSearch = 
        collection.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.phone.includes(searchQuery) ||
        collection.invoiceId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMethod = methodFilter === 'all' || collection.method === methodFilter;
      
      return withinDateRange && matchesSearch && matchesMethod;
    });
  }, [startDate, endDate, searchQuery, methodFilter]);

  // Group by date
  const collectionsByDate = useMemo(() => {
    const grouped: Record<string, DailyCollection[]> = {};
    filteredCollections.forEach(collection => {
      if (!grouped[collection.date]) {
        grouped[collection.date] = [];
      }
      grouped[collection.date].push(collection);
    });
    return grouped;
  }, [filteredCollections]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      total: filteredCollections.reduce((sum, c) => sum + c.amount, 0),
      count: filteredCollections.length,
      selectedTotal: selectedCollections.reduce((sum, id) => {
        const col = filteredCollections.find(c => c.id === id);
        return sum + (col?.amount || 0);
      }, 0),
    };
  }, [filteredCollections, selectedCollections]);

  // Quick date presets
  const datePresets = [
    { label: 'Today', start: '2026-02-20', end: '2026-02-20' },
    { label: 'Yesterday', start: '2026-02-19', end: '2026-02-19' },
    { label: 'Last 7 Days', start: '2026-02-14', end: '2026-02-20' },
    { label: 'This Month', start: '2026-02-01', end: '2026-02-20' },
  ];

  // Toggle collection selection
  const toggleCollection = (id: string) => {
    setSelectedCollections(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // Toggle all in current view
  const toggleAll = () => {
    if (selectedCollections.length === filteredCollections.length) {
      setSelectedCollections([]);
    } else {
      setSelectedCollections(filteredCollections.map(c => c.id));
    }
  };

  // Download individual invoice
  const handleDownloadInvoice = (collection: DailyCollection) => {
    setSelectedInvoice(collection);
    setShowInvoiceModal(true);
  };

  // Download bulk invoices
  const handleBulkDownload = () => {
    alert(`Downloading ${selectedCollections.length} invoices...`);
    setSelectedCollections([]);
  };

  // Send invoice via email
  const handleSendEmail = (collection: DailyCollection) => {
    alert(`Sending invoice ${collection.invoiceId} to ${collection.customerName} at ${collection.phone}`);
  };

  // Print invoice
  const handlePrintInvoice = (collection: DailyCollection) => {
    alert(`Printing invoice ${collection.invoiceId}`);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Daily Bill Collection
          </h1>
          <p className="text-sm text-neutral-500">Track daily bill collections with date filters</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedCollections.length > 0 && (
            <Button 
              className="bg-blue-500 hover:bg-blue-600"
              onClick={handleBulkDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Selected ({selectedCollections.length})
            </Button>
          )}
        </div>
      </div>

      {/* Date Filters & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Date Range Selector */}
        <Card className="lg:col-span-2">
          <CardHeader title="Date Range" subtitle="Select date range to view collections" />
          <CardBody className="space-y-4">
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              {datePresets.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setStartDate(preset.start);
                    setEndDate(preset.end);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    startDate === preset.start && endDate === preset.end
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            
            {/* Custom Date Range */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm text-neutral-500 mb-1">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
              <div className="flex-shrink-0">
                <span className="text-neutral-400">→</span>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-neutral-500 mb-1">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
            </div>

            {/* Search & Method Filter */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search customer, invoice..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
              </div>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="card">Card</option>
              </select>
            </div>
          </CardBody>
        </Card>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardBody className="space-y-4">
            <div>
              <p className="text-green-100 text-sm">Total Collection</p>
              <p className="text-3xl font-bold">${totals.total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-green-100 text-sm">Total Transactions</p>
              <p className="text-2xl font-semibold">{totals.count}</p>
            </div>
            {selectedCollections.length > 0 && (
              <div className="pt-3 border-t border-white/20">
                <p className="text-green-100 text-sm">Selected</p>
                <p className="text-xl font-bold">{selectedCollections.length} items (${totals.selectedTotal})</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Collections List by Date */}
      <div className="space-y-4">
        {Object.keys(collectionsByDate).length > 0 ? (
          Object.entries(collectionsByDate)
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
            .map(([date, collections]) => (
              <Card key={date}>
                <CardHeader 
                  title={formatDateDisplay(date)}
                  subtitle={`${collections.length} transactions • $${collections.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}`}
                  action={
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleAll}
                        className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
                      >
                        {selectedCollections.length === filteredCollections.length ? (
                          <><Check className="w-4 h-4" /> Deselect All</>
                        ) : (
                          <><Square className="w-4 h-4" /> Select All</>
                        )}
                      </button>
                      <Badge variant="success">
                        {formatDate(date)}
                      </Badge>
                    </div>
                  }
                />
                <CardBody className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
                        <tr>
                          <th className="px-4 py-3 text-left w-12">
                            <button
                              onClick={toggleAll}
                              className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            >
                              {selectedCollections.length === filteredCollections.length && filteredCollections.length > 0 ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Invoice</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Customer</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Phone</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Method</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Collector</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase">Amount</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {collections.map((collection) => (
                          <tr key={collection.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                            <td className="px-4 py-3">
                              <button
                                onClick={() => toggleCollection(collection.id)}
                                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                              >
                                {selectedCollections.includes(collection.id) ? (
                                  <Check className="w-4 h-4 text-blue-500" />
                                ) : (
                                  <Square className="w-4 h-4 text-neutral-300" />
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-blue-600">{collection.invoiceId}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-sm font-medium text-neutral-900 dark:text-white">{collection.customerName}</p>
                                <p className="text-xs text-neutral-500">{collection.username}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">{collection.phone}</td>
                            <td className="px-4 py-3">
                              <Badge variant="default">{methodLabels[collection.method]}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">{collection.collector}</td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-bold text-green-600">${collection.amount}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                {/* Download Invoice */}
                                <button
                                  onClick={() => handleDownloadInvoice(collection)}
                                  className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600"
                                  title="Download Invoice"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                {/* Print Invoice */}
                                <button
                                  onClick={() => handlePrintInvoice(collection)}
                                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600"
                                  title="Print Invoice"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                                {/* Send Email */}
                                <button
                                  onClick={() => handleSendEmail(collection)}
                                  className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600"
                                  title="Send via Email"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            ))
        ) : (
          <Card>
            <CardBody className="py-12 text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p className="text-neutral-500 font-medium">No collections found</p>
              <p className="text-sm text-neutral-400">Try adjusting your date range or filters</p>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Invoice Preview Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Invoice Preview"
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            {/* Invoice Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">INVOICE</h3>
                <p className="text-sm text-neutral-500">{selectedInvoice.invoiceId}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">NetFlow ISP</p>
                <p className="text-sm text-neutral-500">Billing Department</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500 uppercase">Bill To</p>
                  <p className="font-semibold">{selectedInvoice.customerName}</p>
                  <p className="text-sm text-neutral-600">{selectedInvoice.username}</p>
                  <p className="text-sm text-neutral-600">{selectedInvoice.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500 uppercase">Invoice Date</p>
                  <p className="font-medium">{formatDate(selectedInvoice.date)}</p>
                  <p className="text-xs text-neutral-500 mt-2">Customer Code</p>
                  <p className="font-medium">{selectedInvoice.customerCode}</p>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm text-neutral-500">Description</th>
                  <th className="text-right py-2 text-sm text-neutral-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3">Monthly Internet Service - {formatDate(selectedInvoice.date)}</td>
                  <td className="text-right py-3 font-medium">${selectedInvoice.amount}</td>
                </tr>
                <tr>
                  <td className="py-2 text-right text-neutral-500">Payment Method</td>
                  <td className="text-right py-2">{methodLabels[selectedInvoice.method]}</td>
                </tr>
                {selectedInvoice.transactionId && (
                  <tr>
                    <td className="py-2 text-right text-neutral-500">Transaction ID</td>
                    <td className="text-right py-2 font-mono text-sm">{selectedInvoice.transactionId}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t">
                  <td className="pt-3 text-right font-semibold">Total Paid</td>
                  <td className="pt-3 text-right text-xl font-bold text-green-600">${selectedInvoice.amount}</td>
                </tr>
              </tfoot>
            </table>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>
                Close
              </Button>
              <Button variant="outline">
                <Printer className="w-4 h-4 mr-2" /> Print
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
