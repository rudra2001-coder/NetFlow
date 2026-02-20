'use client';

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard, Search, Download, Printer, DollarSign, User, Phone,
  MapPin, Package, Clock, Wifi, Server, FileText, CheckCircle,
  X, MoreVertical, ChevronDown, Upload, Users, Map, CreditCardIcon,
  Star, Calendar, TrendingUp, Wallet, AlertCircle, Square, Check
} from "lucide-react";
import { Button, Card, CardBody, CardHeader, Badge, Modal } from "@/components";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Mock Data
// ============================================================================

interface CustomerBilling {
  id: string;
  customerCode: string;
  loginId: string;
  ipAddress: string;
  customerName: string;
  username: string;
  phone: string;
  zone: string;
  district: string;
  thana: string;
  customerType: 'Home' | 'Business';
  connectionType: 'Fiber' | 'UTP' | 'Wireless';
  package: string;
  speed: string;
  monthlyAmount: number;
  receivedAmount: number;
  vat: number;
  dueAmount: number;
  advanceAmount: number;
  expiryDate: string;
  paymentDate: string;
  server: string;
  manualStatus: boolean;
  billingStatus: 'Paid' | 'Unpaid' | 'Partial';
  isVIP: boolean;
}

const mockCustomers: CustomerBilling[] = [
  { id: '1', customerCode: 'C-001', loginId: 'rahim.isp', ipAddress: '10.0.1.101', customerName: 'Rahim Ahmed', username: 'rahim.isp', phone: '+8801712345678', zone: 'Gulshan', district: 'Dhaka', thana: 'Gulshan', customerType: 'Home', connectionType: 'Fiber', package: 'Home 10Mbps', speed: '10 Mbps', monthlyAmount: 450, receivedAmount: 450, vat: 45, dueAmount: 0, advanceAmount: 0, expiryDate: '2026-03-15', paymentDate: '2026-02-01', server: 'SRV-01', manualStatus: true, billingStatus: 'Paid', isVIP: false },
  { id: '2', customerCode: 'C-002', loginId: 'karim.net', ipAddress: '10.0.1.102', customerName: 'Karim Khan', username: 'karim.net', phone: '+8801812345678', zone: 'Banani', district: 'Dhaka', thana: 'Banani', customerType: 'Business', connectionType: 'Fiber', package: 'Business 20Mbps', speed: '20 Mbps', monthlyAmount: 600, receivedAmount: 0, vat: 60, dueAmount: 660, advanceAmount: 0, expiryDate: '2026-02-20', paymentDate: '', server: 'SRV-01', manualStatus: true, billingStatus: 'Unpaid', isVIP: true },
  { id: '3', customerCode: 'C-003', loginId: 'john.doe', ipAddress: '10.0.1.103', customerName: 'John Doe', username: 'john.doe', phone: '+8801912345678', zone: 'Uttara', district: 'Dhaka', thana: 'Uttara', customerType: 'Home', connectionType: 'UTP', package: 'Home 5Mbps', speed: '5 Mbps', monthlyAmount: 300, receivedAmount: 150, vat: 30, dueAmount: 180, advanceAmount: 0, expiryDate: '2026-02-10', paymentDate: '2026-01-25', server: 'SRV-02', manualStatus: true, billingStatus: 'Partial', isVIP: false },
  { id: '4', customerCode: 'C-004', loginId: 'sarah.s', ipAddress: '10.0.1.104', customerName: 'Sarah Smith', username: 'sarah.s', phone: '+8801512345678', zone: 'Dhanmondi', district: 'Dhaka', thana: 'Dhanmondi', customerType: 'Home', connectionType: 'Fiber', package: 'Home 15Mbps', speed: '15 Mbps', monthlyAmount: 550, receivedAmount: 550, vat: 55, dueAmount: 0, advanceAmount: 200, expiryDate: '2026-03-01', paymentDate: '2026-02-01', server: 'SRV-01', manualStatus: true, billingStatus: 'Paid', isVIP: true },
  { id: '5', customerCode: 'C-005', loginId: 'mike.w', ipAddress: '10.0.1.105', customerName: 'Mike Wilson', username: 'mike.w', phone: '+8801612345678', zone: 'Mirpur', district: 'Dhaka', thana: 'Mirpur', customerType: 'Business', connectionType: 'Fiber', package: 'Business 50Mbps', speed: '50 Mbps', monthlyAmount: 1200, receivedAmount: 0, vat: 120, dueAmount: 1320, advanceAmount: 0, expiryDate: '2026-02-15', paymentDate: '', server: 'SRV-03', manualStatus: false, billingStatus: 'Unpaid', isVIP: false },
  { id: '6', customerCode: 'C-006', loginId: 'lisa.a', ipAddress: '10.0.1.106', customerName: 'Lisa Anderson', username: 'lisa.a', phone: '+8801312345678', zone: 'Gulshan', district: 'Dhaka', thana: 'Gulshan', customerType: 'Home', connectionType: 'Wireless', package: 'Home 8Mbps', speed: '8 Mbps', monthlyAmount: 380, receivedAmount: 380, vat: 38, dueAmount: 0, advanceAmount: 0, expiryDate: '2026-02-25', paymentDate: '2026-02-05', server: 'SRV-02', manualStatus: true, billingStatus: 'Paid', isVIP: false },
  { id: '7', customerCode: 'C-007', loginId: 'david.b', ipAddress: '10.0.1.107', customerName: 'David Brown', username: 'david.b', phone: '+8801412345678', zone: 'Baridhara', district: 'Dhaka', thana: 'Baridhara', customerType: 'Home', connectionType: 'Fiber', package: 'Home 12Mbps', speed: '12 Mbps', monthlyAmount: 480, receivedAmount: 0, vat: 48, dueAmount: 528, advanceAmount: 0, expiryDate: '2026-02-18', paymentDate: '', server: 'SRV-01', manualStatus: true, billingStatus: 'Unpaid', isVIP: false },
  { id: '8', customerCode: 'C-008', loginId: 'emma.w', ipAddress: '10.0.1.108', customerName: 'Emma Wilson', username: 'emma.w', phone: '+8801712345679', zone: 'Banani', district: 'Dhaka', thana: 'Banani', customerType: 'Business', connectionType: 'Fiber', package: 'Business 30Mbps', speed: '30 Mbps', monthlyAmount: 900, receivedAmount: 900, vat: 90, dueAmount: 0, advanceAmount: 500, expiryDate: '2026-03-10', paymentDate: '2026-02-10', server: 'SRV-03', manualStatus: true, billingStatus: 'Paid', isVIP: true },
];

// ============================================================================
// Main Page Component
// ============================================================================

export default function BillingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerBilling | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState<string | null>(null);
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    method: 'cash',
    receivedAmount: '',
    discountAmount: '0',
    advanceAmount: '0',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0],
    sendSMS: false,
    newExpiryDate: '',
    changeExpiry: false,
  });

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return mockCustomers.filter(customer => {
      const matchesSearch = 
        customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.customerCode.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || customer.billingStatus === statusFilter;
      const matchesZone = zoneFilter === 'all' || customer.zone === zoneFilter;
      
      return matchesSearch && matchesStatus && matchesZone;
    });
  }, [searchQuery, statusFilter, zoneFilter]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      totalCustomers: mockCustomers.length,
      paidClients: mockCustomers.filter(c => c.billingStatus === 'Paid').length,
      unpaidClients: mockCustomers.filter(c => c.billingStatus === 'Unpaid').length,
      totalDue: mockCustomers.reduce((sum, c) => sum + c.dueAmount, 0),
      totalReceived: mockCustomers.reduce((sum, c) => sum + c.receivedAmount, 0),
      totalBilled: mockCustomers.reduce((sum, c) => sum + c.monthlyAmount + c.vat, 0),
      totalAdvance: mockCustomers.reduce((sum, c) => sum + c.advanceAmount, 0),
      monthlyBill: mockCustomers.reduce((sum, c) => sum + c.monthlyAmount, 0),
    };
  }, []);

  // Get unique zones
  const zones = useMemo(() => Array.from(new Set(mockCustomers.map(c => c.zone))), []);

  // Toggle customer selection
  const toggleCustomer = (id: string) => {
    setSelectedCustomers(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // Toggle all customers
  const toggleAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  // Bulk pay all selected
  const handleBulkPayAll = () => {
    alert(`Processing payment for ${selectedCustomers.length} customers`);
    setSelectedCustomers([]);
  };

  // Open payment modal
  const handlePayClick = (customer: CustomerBilling) => {
    setSelectedCustomer(customer);
    setPaymentForm({
      method: 'cash',
      receivedAmount: customer.dueAmount > 0 ? customer.dueAmount.toString() : customer.monthlyAmount.toString(),
      discountAmount: '0',
      advanceAmount: '0',
      notes: '',
      paymentDate: new Date().toISOString().split('T')[0],
      sendSMS: false,
      newExpiryDate: customer.expiryDate,
      changeExpiry: false,
    });
    setShowPaymentModal(true);
  };

  // Handle payment submit
  const handlePaymentSubmit = () => {
    console.log('Payment submitted:', { customer: selectedCustomer, ...paymentForm });
    setShowPaymentModal(false);
    alert(`Payment of $${paymentForm.receivedAmount} recorded for ${selectedCustomer?.customerName}!`);
  };

  // Get billing status badge
  const getStatusBadge = (status: CustomerBilling['billingStatus']) => {
    switch (status) {
      case 'Paid': return <Badge variant="success">Paid</Badge>;
      case 'Unpaid': return <Badge variant="error">Unpaid</Badge>;
      case 'Partial': return <Badge variant="warning">Partial</Badge>;
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Billing Management
          </h1>
          <p className="text-sm text-neutral-500">Manage customer bills, payments, and due collections</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/accounting/payments/daily')}>
            <Calendar className="w-4 h-4 mr-2" /> Daily Collection
          </Button>
        </div>
      </div>

      {/* Summary Cards - 7 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-200" />
              <p className="text-green-100 text-xs">Paid Client</p>
            </div>
            <p className="text-2xl font-bold">{totals.paidClients}</p>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-200" />
              <p className="text-red-100 text-xs">Unpaid Client</p>
            </div>
            <p className="text-2xl font-bold">{totals.unpaidClients}</p>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-emerald-200" />
              <p className="text-emerald-100 text-xs">Received Bill</p>
            </div>
            <p className="text-2xl font-bold">${totals.totalReceived.toLocaleString()}</p>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-200" />
              <p className="text-orange-100 text-xs">Due Amount</p>
            </div>
            <p className="text-2xl font-bold">${totals.totalDue.toLocaleString()}</p>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-blue-200" />
              <p className="text-blue-100 text-xs">Generated Bill</p>
            </div>
            <p className="text-2xl font-bold">${totals.totalBilled.toLocaleString()}</p>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CreditCardIcon className="w-4 h-4 text-purple-200" />
              <p className="text-purple-100 text-xs">Advance Amount</p>
            </div>
            <p className="text-2xl font-bold">${totals.totalAdvance.toLocaleString()}</p>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-indigo-200" />
              <p className="text-indigo-100 text-xs">Monthly Bill</p>
            </div>
            <p className="text-2xl font-bold">${totals.monthlyBill.toLocaleString()}</p>
          </CardBody>
        </Card>
      </div>

      {/* Action Button Panel - Bulk Operations */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-wrap gap-2">
            {/* Export & Sync */}
            <div className="flex gap-2 border-r border-neutral-200 dark:border-neutral-700 pr-4">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-1" /> Generate Excel
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" /> Generate PDF
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-1" /> Sync Clients
              </Button>
            </div>

            {/* Bulk Client Management */}
            <div className="flex gap-2 border-r border-neutral-200 dark:border-neutral-700 pr-4">
              <Button variant="outline" size="sm" disabled={selectedCustomers.length === 0}>
                <X className="w-4 h-4 mr-1" /> Disable Selected
              </Button>
              <Button variant="outline" size="sm" disabled={selectedCustomers.length === 0}>
                <CheckCircle className="w-4 h-4 mr-1" /> Enable Selected
              </Button>
              <Button variant="outline" size="sm" disabled={selectedCustomers.length === 0}>
                <Users className="w-4 h-4 mr-1" /> Assign Employee
              </Button>
            </div>

            {/* Bulk Location Change */}
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setShowBulkMenu(showBulkMenu === 'location' ? null : 'location')}>
                <Map className="w-4 h-4 mr-1" /> Bulk Location
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
              {showBulkMenu === 'location' && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-10 py-2 min-w-[160px]">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">Bulk Zone Change</button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">Bulk District Change</button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">Bulk Thana Change</button>
                </div>
              )}
            </div>

            {/* Billing Operations */}
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setShowBulkMenu(showBulkMenu === 'billing' ? null : 'billing')}>
                <CreditCard className="w-4 h-4 mr-1" /> Billing Ops
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
              {showBulkMenu === 'billing' && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-10 py-2 min-w-[180px]">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">Bulk Status Change</button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">Bulk Billing Date Extend</button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">Bulk Profile Change</button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">Download Invoice</button>
                </div>
              )}
            </div>

            {/* VIP Controls */}
            <div className="flex gap-2 border-l border-neutral-200 dark:border-neutral-700 pl-4">
              <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-600" disabled={selectedCustomers.length === 0}>
                <Star className="w-4 h-4 mr-1" /> Add to VIP
              </Button>
              <Button variant="outline" size="sm" disabled={selectedCustomers.length === 0}>
                <Star className="w-4 h-4 mr-1" /> Remove from VIP
              </Button>
            </div>

            {/* Bulk Pay All */}
            <div className="flex gap-2 border-l border-neutral-200 dark:border-neutral-700 pl-4 ml-auto">
              <Button 
                className="bg-green-500 hover:bg-green-600" 
                size="sm" 
                disabled={selectedCustomers.length === 0}
                onClick={handleBulkPayAll}
              >
                <CreditCard className="w-4 h-4 mr-1" /> 
                Pay All ({selectedCustomers.length})
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, username, phone, code, zone..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            >
              <option value="all">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
            </select>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            >
              <option value="all">All Zones</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Data Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-3 py-3 text-left">
                    <button
                      onClick={toggleAll}
                      className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      {selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0 ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">C.Code</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">ID/IP</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Cus. Name</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Mobile</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Zone</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Type</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Conn.</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Package</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Speed</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Ex.Date</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-neutral-500 uppercase">M.Bill</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-neutral-500 uppercase">Received</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-neutral-500 uppercase">VAT</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-neutral-500 uppercase">Balance</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-neutral-500 uppercase">Advance</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Pay Date</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Server</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">M.Status</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">B.Status</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-3 py-3">
                      <button
                        onClick={() => toggleCustomer(customer.id)}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      >
                        {selectedCustomers.includes(customer.id) ? (
                          <Check className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Square className="w-4 h-4 text-neutral-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        {customer.isVIP && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                        <span className="text-sm font-medium text-neutral-900">{customer.customerCode}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-neutral-600">
                      <div>{customer.loginId}</div>
                      <div className="text-xs text-neutral-400">{customer.ipAddress}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-neutral-900">{customer.customerName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-neutral-600">{customer.phone}</td>
                    <td className="px-3 py-3 text-sm text-neutral-600">{customer.zone}</td>
                    <td className="px-3 py-3 text-sm text-neutral-600">{customer.customerType}</td>
                    <td className="px-3 py-3 text-sm text-neutral-600">{customer.connectionType}</td>
                    <td className="px-3 py-3 text-sm text-neutral-600">{customer.package}</td>
                    <td className="px-3 py-3 text-sm text-neutral-600">{customer.speed}</td>
                    <td className="px-3 py-3 text-sm">
                      <span className={cn(
                        new Date(customer.expiryDate) < new Date() ? "text-red-600 font-medium" : ""
                      )}>
                        {formatDate(customer.expiryDate)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-right font-medium">${customer.monthlyAmount}</td>
                    <td className="px-3 py-3 text-sm text-right text-green-600">${customer.receivedAmount}</td>
                    <td className="px-3 py-3 text-sm text-right">${customer.vat}</td>
                    <td className="px-3 py-3 text-sm text-right font-bold text-orange-600">
                      ${customer.dueAmount}
                    </td>
                    <td className="px-3 py-3 text-sm text-right text-purple-600">${customer.advanceAmount}</td>
                    <td className="px-3 py-3 text-sm text-neutral-600">{formatDate(customer.paymentDate)}</td>
                    <td className="px-3 py-3 text-sm text-neutral-600">{customer.server}</td>
                    <td className="px-3 py-3 text-center">
                      <button className={cn(
                        "w-8 h-5 rounded-full transition-colors",
                        customer.manualStatus ? "bg-green-500" : "bg-neutral-300"
                      )}>
                        <div className={cn(
                          "w-4 h-4 rounded-full bg-white transform transition-transform",
                          customer.manualStatus ? "translate-x-3.5" : "translate-x-0.5"
                        )} />
                      </button>
                    </td>
                    <td className="px-3 py-3 text-center">{getStatusBadge(customer.billingStatus)}</td>
                    <td className="px-3 py-3 text-center">
                      <Button 
                        size="sm" 
                        onClick={() => handlePayClick(customer)}
                        className={customer.dueAmount > 0 ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"}
                      >
                        {customer.dueAmount > 0 ? 'Pay Due' : 'Pay'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Payment Modal */}
      <Modal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{selectedCustomer.customerName}</p>
                    <p className="text-sm text-neutral-500">{selectedCustomer.username} • {selectedCustomer.phone}</p>
                    <p className="text-sm text-neutral-500">{selectedCustomer.package} • {selectedCustomer.zone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-500">Due Amount</p>
                  <p className="text-2xl font-bold text-orange-600">${selectedCustomer.dueAmount}</p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {[
                  { value: 'cash', label: 'Cash' },
                  { value: 'bank_transfer', label: 'Bank' },
                  { value: 'bkash', label: 'bKash' },
                  { value: 'nagad', label: 'Nagad' },
                  { value: 'card', label: 'Card' },
                ].map(method => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentForm({...paymentForm, method: method.value})}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                      paymentForm.method === method.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-neutral-200 dark:border-neutral-700"
                    )}
                  >
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Received Amount *</label>
                <input
                  type="number"
                  value={paymentForm.receivedAmount}
                  onChange={(e) => setPaymentForm({...paymentForm, receivedAmount: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Discount</label>
                <input
                  type="number"
                  value={paymentForm.discountAmount}
                  onChange={(e) => setPaymentForm({...paymentForm, discountAmount: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Advance</label>
                <input
                  type="number"
                  value={paymentForm.advanceAmount}
                  onChange={(e) => setPaymentForm({...paymentForm, advanceAmount: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border"
                  min="0"
                />
              </div>
            </div>

            {/* Payment Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payment Date</label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={paymentForm.sendSMS}
                  onChange={(e) => setPaymentForm({...paymentForm, sendSMS: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm">Send SMS to customer</span>
              </div>
            </div>

            {/* Change Expiry */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentForm.changeExpiry}
                  onChange={(e) => setPaymentForm({...paymentForm, changeExpiry: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Change Expiry Date</span>
              </label>
              {paymentForm.changeExpiry && (
                <input
                  type="date"
                  value={paymentForm.newExpiryDate}
                  onChange={(e) => setPaymentForm({...paymentForm, newExpiryDate: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border mt-2"
                />
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border"
              />
            </div>

            {/* Summary */}
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Total Due:</span>
                <span className="font-medium">${selectedCustomer.dueAmount}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2 mt-2">
                <span className="font-medium">Total Paid:</span>
                <span className="font-bold text-green-600">
                  ${((parseFloat(paymentForm.receivedAmount) || 0) + (parseFloat(paymentForm.discountAmount) || 0)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
              <Button onClick={handlePaymentSubmit}>Record Payment</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
