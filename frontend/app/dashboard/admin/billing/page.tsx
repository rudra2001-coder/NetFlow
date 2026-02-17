"use client";

import React, { useState, useMemo } from "react";
import {
    CreditCard, Search, Filter, Calendar,
    ArrowUpRight, ArrowDownLeft, Receipt,
    Wallet, Landmark, Smartphone, MoreVertical,
    Download, Printer, Trash2, CheckCircle2,
    TrendingUp, TrendingDown, DollarSign, Globe
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, LineChart, Line
} from "recharts";
import {
    Button, Card, CardBody, CardHeader,
    Input, Badge, Select, Dropdown, Modal
} from "@/components";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Mock Data
// ============================================================================

interface Transaction {
    id: string;
    customer: string;
    amount: number;
    type: "Cash" | "Bkash" | "Nogod" | "Online" | "Bank";
    status: "Completed" | "Pending" | "Failed";
    date: string;
    reference: string;
}

const mockTransactions: Transaction[] = [
    { id: "TX_001", customer: "Rudra", amount: 15.00, type: "Cash", status: "Completed", date: "2024-03-20 10:30", reference: "BILL_442" },
    { id: "TX_002", customer: "John Wick", amount: 45.99, type: "Bkash", status: "Completed", date: "2024-03-20 11:15", reference: "BILL_881" },
    { id: "TX_003", customer: "Sarah Connor", amount: 1.00, type: "Nogod", status: "Completed", date: "2024-03-20 12:45", reference: "VOUCH_12" },
    { id: "TX_004", customer: "Tony Stark", amount: 500.00, type: "Bank", status: "Completed", date: "2024-03-19 09:00", reference: "CORE_77" },
    { id: "TX_005", customer: "Bruce Wayne", amount: 120.50, type: "Online", status: "Pending", date: "2024-03-19 15:30", reference: "BILL_009" },
    { id: "TX_006", customer: "Clark Kent", amount: 3.50, type: "Cash", status: "Completed", date: "2024-03-19 18:20", reference: "VOUCH_44" },
    { id: "TX_007", customer: "Peter Parker", amount: 25.00, type: "Bkash", status: "Failed", date: "2024-03-18 10:00", reference: "ERR_991" },
];

const dailyCollectionData = [
    { day: "Mon", amount: 4500 },
    { day: "Tue", amount: 5200 },
    { day: "Wed", amount: 3800 },
    { day: "Thu", amount: 6400 },
    { day: "Fri", amount: 7800 },
    { day: "Sat", amount: 8200 },
    { day: "Sun", amount: 4100 },
];

// ============================================================================
// Main Page Component
// ============================================================================

export default function BillingPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [daysFilter, setDaysFilter] = useState("7");

    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [showReceipt, setShowReceipt] = useState(false);

    const filteredTransactions = useMemo(() => {
        return mockTransactions.filter(tx => {
            const matchesSearch = tx.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = paymentFilter === "all" || tx.type === paymentFilter;
            return matchesSearch && matchesType;
        });
    }, [searchQuery, paymentFilter]);

    const handleViewReceipt = (tx: Transaction) => {
        setSelectedTx(tx);
        setShowReceipt(true);
    };

    const getPaymentIcon = (type: Transaction["type"]) => {
        switch (type) {
            case "Cash": return <Wallet className="w-4 h-4" />;
            case "Bank": return <Landmark className="w-4 h-4" />;
            case "Online": return <Globe className="w-4 h-4" />;
            case "Bkash":
            case "Nogod": return <Smartphone className="w-4 h-4" />;
            default: return <CreditCard className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="w-7 h-7 text-primary-500" />
                        Billing & Revenue
                    </h1>
                    <p className="text-sm text-neutral-500 font-medium">Monitor daily collections, manage receipts, and track growth.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" leftIcon={<Printer className="w-4 h-4" />} className="hidden md:flex">Print Reports</Button>
                    <Button className="shadow-lg shadow-primary-500/20" leftIcon={<DollarSign className="w-4 h-4" />}>Collect Payment</Button>
                </div>
            </div>

            {/* Daily Collection Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 glass border-0 shadow-xl overflow-hidden">
                    <CardHeader
                        title="Daily Collection Showcase"
                        subtitle={`Revenue trends for the last ${daysFilter} days`}
                        action={
                            <div className="flex items-center gap-2">
                                <Select
                                    value={daysFilter}
                                    onChange={(val) => setDaysFilter(val)}
                                    options={[
                                        { value: "7", label: "Last 7 Days" },
                                        { value: "14", label: "Last 14 Days" },
                                        { value: "30", label: "Last 30 Days" },
                                    ]}
                                />
                            </div>
                        }
                    />
                    <CardBody>
                        <div className="h-64 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyCollectionData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                <div className="space-y-4">
                    <Card className="glass border-0 shadow-lg bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden relative group">
                        <CardBody className="p-6">
                            <div className="relative z-10">
                                <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Today's Collection</p>
                                <h3 className="text-3xl font-black mb-4">$12,480</h3>
                                <div className="flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-2 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                                    <TrendingUp className="w-3 h-3" />
                                    +24% from yesterday
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:rotate-12 transition-transform">
                                <TrendingUp className="w-16 h-16" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="glass border-0 shadow-lg">
                        <CardBody className="p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-success-100 dark:bg-success-900/30 rounded-xl text-success-600">
                                            <Wallet className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest leading-tight">Cash on Hand</p>
                                            <p className="text-lg font-black dark:text-white">$3,240</p>
                                        </div>
                                    </div>
                                    <Badge variant="success" size="sm">Healthy</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
                                            <Smartphone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest leading-tight">MFS (Bkash/Nogod)</p>
                                            <p className="text-lg font-black dark:text-white">$8,120</p>
                                        </div>
                                    </div>
                                    <Badge variant="info" size="sm">+15% week</Badge>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Transactions List & Filters */}
            <Card className="glass border-0 shadow-2xl">
                <CardHeader
                    title="Billing List & Invoices"
                    subtitle="Comprehensive history of all customer payments and collections"
                />
                <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                            placeholder="Search by ID or customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 border-0 bg-neutral-100 dark:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <Select
                            value={paymentFilter}
                            onChange={(val) => setPaymentFilter(val)}
                            options={[
                                { value: "all", label: "Payment Type" },
                                { value: "Cash", label: "Cash" },
                                { value: "Bkash", label: "Bkash" },
                                { value: "Nogod", label: "Nogod" },
                                { value: "Online", label: "Online" },
                                { value: "Bank", label: "Bank" },
                            ]}
                            className="w-full md:w-40"
                        />
                        <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>Advanced</Button>
                        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} className="hidden sm:flex">Export CSV</Button>
                    </div>
                </div>
                <CardBody className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50 dark:bg-neutral-800/30 text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-4">Transaction ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Method</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-all duration-200 group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                                                    <Receipt className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-200">{tx.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-black dark:text-white leading-tight">{tx.customer}</p>
                                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">Ref: {tx.reference}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-neutral-900 dark:text-white">${tx.amount.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                                                    {getPaymentIcon(tx.type)}
                                                </div>
                                                <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300">{tx.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-neutral-500">{tx.date}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant={tx.status === "Completed" ? "success" : tx.status === "Pending" ? "warning" : "error"}
                                                size="sm"
                                                className="rounded-full px-3"
                                            >
                                                {tx.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" onClick={() => handleViewReceipt(tx)} className="p-2 h-9 w-9 hover:bg-white dark:hover:bg-neutral-700 shadow-sm"><Printer className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="sm" className="p-2 h-9 w-9 hover:bg-white dark:hover:bg-neutral-700 shadow-sm"><Download className="w-4 h-4" /></Button>
                                                <Dropdown
                                                    trigger={<Button variant="ghost" size="sm" className="p-2 h-9 w-9"><MoreVertical className="w-4 h-4" /></Button>}
                                                    items={[
                                                        { label: "View Receipt", icon: <Receipt className="w-4 h-4" />, onClick: () => handleViewReceipt(tx) },
                                                        { label: "Email Invoice", icon: <Globe className="w-4 h-4" /> },
                                                        { label: "Mark as Void", icon: <Trash2 className="w-4 h-4" />, danger: true },
                                                    ]}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>

            {/* Receipt Modal */}
            <Modal
                isOpen={showReceipt}
                onClose={() => setShowReceipt(false)}
                title="Transaction Receipt"
                size="md"
            >
                {selectedTx && (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500 opacity-50" />
                            <div className="w-16 h-16 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center shadow-xl mb-4 border-4 border-primary-500/20">
                                <CheckCircle2 className="w-8 h-8 text-success-500" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-1">Total Paid</p>
                            <h2 className="text-4xl font-black text-neutral-900 dark:text-white">${selectedTx.amount.toFixed(2)}</h2>
                            <p className="text-sm font-bold text-success-600 mt-2">Payment Successfully Processed</p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-neutral-400">Transaction ID</p>
                                    <p className="text-sm font-bold">{selectedTx.id}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] font-black uppercase text-neutral-400">Date/Time</p>
                                    <p className="text-sm font-bold">{selectedTx.date}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-neutral-400">Customer</p>
                                    <p className="text-sm font-bold">{selectedTx.customer}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] font-black uppercase text-neutral-400">Payment Method</p>
                                    <p className="text-sm font-bold flex items-center justify-end gap-2">
                                        {getPaymentIcon(selectedTx.type)}
                                        {selectedTx.type}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-neutral-500">Service Reference</span>
                                    <span className="text-sm font-bold italic">{selectedTx.reference}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-neutral-500">Status</span>
                                    <Badge variant="success" size="sm">{selectedTx.status}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6">
                            <Button variant="outline" className="flex-1" leftIcon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>Print Receipt</Button>
                            <Button className="flex-1" leftIcon={<Download className="w-4 h-4" />}>Save as PDF</Button>
                        </div>

                        <p className="text-[10px] text-center text-neutral-400 italic font-medium">
                            Thank you for your payment. This is a system-generated receipt.
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
