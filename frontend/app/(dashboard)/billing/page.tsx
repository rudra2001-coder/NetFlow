"use client";

import React, { useState, useMemo } from "react";
import {
    CreditCard, Search, Filter, Calendar,
    ArrowUpRight, ArrowDownLeft, Receipt,
    Wallet, Landmark, Smartphone, MoreVertical,
    Download, Printer, Trash2, CheckCircle2,
    TrendingUp, TrendingDown, DollarSign, Globe, Play
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
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Advanced Payment State
    const [billData, setBillData] = useState({
        customer: "",
        monthlyAmount: 15,
        paidAmount: 0,
        isYearly: false,
    });

    const calculatedBill = billData.isYearly ? billData.monthlyAmount * 12 : billData.monthlyAmount;
    const balance = billData.paidAmount - calculatedBill;

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

    const handleQuickPay = (tx: Transaction) => {
        setBillData({
            customer: tx.customer,
            monthlyAmount: tx.amount,
            paidAmount: 0,
            isYearly: false,
        });
        setShowPaymentModal(true);
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
        <div className="space-y-6 animate-fadeIn pb-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="w-7 h-7 text-primary-500" />
                        Billing Command Center
                    </h1>
                    <p className="text-sm text-neutral-500 font-medium tracking-tight">Enterprise financial ledger with real-time balance tracking.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" leftIcon={<Printer className="w-4 h-4" />} className="hidden md:flex">Print Reports</Button>
                    <Button
                        className="shadow-lg shadow-primary-500/20 bg-primary-600 hover:bg-primary-700"
                        leftIcon={<DollarSign className="w-4 h-4" />}
                        onClick={() => setShowPaymentModal(true)}
                    >
                        Collect Payment
                    </Button>
                </div>
            </div>

            {/* Daily Collection Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 glass border-0 shadow-xl overflow-hidden">
                    <CardHeader
                        title="Global Revenue Stream"
                        subtitle={`Collection velocity for the last ${daysFilter} days`}
                        action={
                            <div className="flex items-center gap-2">
                                <Select
                                    value={daysFilter}
                                    onChange={(val) => setDaysFilter(val)}
                                    options={[
                                        { value: "7", label: "7D View" },
                                        { value: "14", label: "14D View" },
                                        { value: "30", label: "30D View" },
                                    ]}
                                />
                            </div>
                        }
                    />
                    <CardBody className="p-0">
                        <div className="h-72 w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyCollectionData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888815" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 10, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => `$${v}`} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#3b82f6"
                                        strokeWidth={4}
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
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Total Receivables</p>
                                <h3 className="text-3xl font-black mb-4">$12,480.00</h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                                    <TrendingUp className="w-3 h-3 text-success-400" />
                                    +24% Collection Growth
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:rotate-12 transition-transform">
                                <Landmark className="w-24 h-24" />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="glass border-0 shadow-lg">
                        <CardBody className="p-5">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center group/item hover:bg-neutral-50 dark:hover:bg-neutral-800/50 p-2 rounded-xl transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-success-50 dark:bg-success-900/20 rounded-xl text-success-600">
                                            <Wallet className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest leading-tight">Cash Assets</p>
                                            <p className="text-lg font-black dark:text-white">$3,240.25</p>
                                        </div>
                                    </div>
                                    <Badge variant="success" size="sm" dot>Audited</Badge>
                                </div>
                                <div className="flex justify-between items-center group/item hover:bg-neutral-50 dark:hover:bg-neutral-800/50 p-2 rounded-xl transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                                            <Smartphone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest leading-tight">Digital MFS</p>
                                            <p className="text-lg font-black dark:text-white">$8,120.50</p>
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
                    title="Financial Ledger & Billing activity"
                    subtitle="Filter and manage individual customer sessions and payments"
                />
                <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/10">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                            placeholder="Find transaction or user..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 border-0 bg-white dark:bg-neutral-900 shadow-sm h-11 rounded-2xl"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <Select
                            value={paymentFilter}
                            onChange={(val) => setPaymentFilter(val)}
                            options={[
                                { value: "all", label: "All Methods" },
                                { value: "Cash", label: "Cash" },
                                { value: "Bkash", label: "Bkash" },
                                { value: "Nogod", label: "Nogod" },
                                { value: "Online", label: "Online" },
                                { value: "Bank", label: "Bank" },
                            ]}
                            className="w-full md:w-44"
                        />
                        <Button variant="outline" className="rounded-2xl h-11 px-6 font-bold" leftIcon={<Filter className="w-4 h-4" />}>Filters</Button>
                        <Button variant="outline" className="rounded-2xl h-11 w-11 p-0 border-0 glass shadow-lg"><Download className="w-4 h-4" /></Button>
                    </div>
                </div>
                <CardBody className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50 dark:bg-neutral-800/30 text-neutral-400 text-[10px] font-black uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-800">
                                    <th className="px-6 py-4">Status & Ledger</th>
                                    <th className="px-6 py-4">Customer Identity</th>
                                    <th className="px-6 py-4">Billed Amount</th>
                                    <th className="px-6 py-4">Payment Node</th>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-all duration-300 group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleQuickPay(tx)}
                                                    className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 hover:bg-primary-500 hover:text-white transition-all shadow-sm group/btn"
                                                >
                                                    <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">{tx.id}</span>
                                                    <Badge
                                                        variant={tx.status === "Completed" ? "success" : tx.status === "Pending" ? "warning" : "error"}
                                                        size="sm"
                                                        className="mt-0.5"
                                                    >
                                                        {tx.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-black dark:text-white leading-tight">{tx.customer}</p>
                                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter mt-0.5">Reference: {tx.reference}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-neutral-900 dark:text-white">${tx.amount.toFixed(2)}</span>
                                                <span className="text-[10px] font-bold text-success-600 uppercase tracking-tighter">Current Plan</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:bg-white dark:group-hover:bg-neutral-700 shadow-sm transition-colors">
                                                    {getPaymentIcon(tx.type)}
                                                </div>
                                                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">{tx.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-neutral-500 tabular-nums">{tx.date}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                                                <Button variant="ghost" size="sm" onClick={() => handleViewReceipt(tx)} className="p-2 h-9 w-9 hover:bg-white dark:hover:bg-neutral-700 shadow-sm rounded-xl"><Printer className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="sm" className="p-2 h-9 w-9 hover:bg-white dark:hover:bg-neutral-700 shadow-sm rounded-xl"><Download className="w-4 h-4" /></Button>
                                                <Dropdown
                                                    trigger={<Button variant="ghost" size="sm" className="p-2 h-9 w-9 rounded-xl"><MoreVertical className="w-4 h-4" /></Button>}
                                                    items={[
                                                        { label: "View Detailed Receipt", icon: <Receipt className="w-4 h-4" />, onClick: () => handleViewReceipt(tx) },
                                                        { label: "Email Invoice to Client", icon: <Globe className="w-4 h-4" /> },
                                                        { label: "Void This Transaction", icon: <Trash2 className="w-4 h-4" />, danger: true },
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

            {/* Collective Payment Modal (The Play Action) */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Advanced Bill Collection"
                size="md"
            >
                <div className="space-y-6">
                    <div className="bg-primary-50 dark:bg-primary-900/10 p-5 rounded-3xl border border-primary-500/20 relative overflow-hidden">
                        <div className="relative z-10 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-1">Total Bill To Generate</p>
                                <h2 className="text-4xl font-black text-primary-900 dark:text-white tracking-tighter">${calculatedBill.toFixed(2)}</h2>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-neutral-400 uppercase mb-2">Billing Term</span>
                                <div
                                    className="p-1 bg-white dark:bg-neutral-800 rounded-xl flex gap-1 cursor-pointer shadow-sm border border-neutral-200 dark:border-neutral-700"
                                    onClick={() => setBillData(prev => ({ ...prev, isYearly: !prev.isYearly }))}
                                >
                                    <div className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black transition-all", !billData.isYearly ? "bg-primary-600 text-white shadow-md shadow-primary-500/30" : "text-neutral-500")}>MONTHLY</div>
                                    <div className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black transition-all", billData.isYearly ? "bg-primary-600 text-white shadow-md shadow-primary-500/30" : "text-neutral-500")}>YEARLY</div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        <Input
                            label="Customer Name / Service ID"
                            placeholder="Type to search..."
                            value={billData.customer}
                            onChange={(e) => setBillData(prev => ({ ...prev, customer: e.target.value }))}
                            className="rounded-2xl h-12 bg-neutral-50 dark:bg-neutral-800 border-0"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Unit Price"
                                type="number"
                                value={billData.monthlyAmount}
                                onChange={(e) => setBillData(prev => ({ ...prev, monthlyAmount: parseFloat(e.target.value) || 0 }))}
                                leftIcon={<DollarSign className="w-4 h-4" />}
                                className="rounded-2xl h-12 bg-neutral-50 dark:bg-neutral-800 border-0"
                            />
                            <Input
                                label="Paid Amount"
                                type="number"
                                value={billData.paidAmount}
                                onChange={(e) => setBillData(prev => ({ ...prev, paidAmount: parseFloat(e.target.value) || 0 }))}
                                leftIcon={<CreditCard className="w-4 h-4" />}
                                className="rounded-2xl h-12 bg-neutral-50 dark:bg-neutral-800 border-0"
                            />
                        </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-neutral-900 text-white shadow-2xl relative overflow-hidden group">
                        <div className="flex justify-between items-center relative z-10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Ledger Outcome</p>
                                <h4 className={cn("text-2xl font-black italic", balance >= 0 ? "text-success-400" : "text-error-400")}>
                                    {balance >= 0 ? `+ $${balance.toFixed(2)}` : `- $${Math.abs(balance).toFixed(2)}`}
                                </h4>
                            </div>
                            <div className="text-right">
                                <Badge variant={balance >= 0 ? "success" : "error"} className="rounded-full shadow-lg h-8 px-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    {balance >= 0 ? "ADVANCE CREDIT" : "REMAINING DUE"}
                                </Badge>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-transparent pointer-events-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <Button variant="outline" className="h-12 rounded-2xl font-bold" onClick={() => setShowPaymentModal(false)}>Cancel Action</Button>
                        <Button className="h-12 rounded-2xl font-black shadow-xl shadow-primary-500/20" leftIcon={<CheckCircle2 className="w-4 h-4" />}>Confirm Payment</Button>
                    </div>
                </div>
            </Modal>

            {/* Receipt Modal */}
            <Modal
                isOpen={showReceipt}
                onClose={() => setShowReceipt(false)}
                title="Universal Financial Ledger"
                size="md"
            >
                {selectedTx && (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 dark:bg-neutral-900/50 rounded-[2.5rem] border-2 border-dashed border-neutral-200 dark:border-neutral-700 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-500 via-purple-500 to-info-500 opacity-60" />
                            <div className="w-20 h-20 bg-white dark:bg-neutral-800 rounded-3xl flex items-center justify-center shadow-2xl mb-6 border-4 border-primary-500/10 rotate-3 hover:rotate-0 transition-transform">
                                <CheckCircle2 className="w-10 h-10 text-success-500" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Settlement Proof</p>
                            <h2 className="text-5xl font-black text-neutral-900 dark:text-white tracking-tighter tabular-nums">${selectedTx.amount.toFixed(2)}</h2>
                            <p className="text-xs font-black text-success-600 mt-4 uppercase tracking-widest py-1 px-3 bg-success-50 dark:bg-success-900/20 rounded-full">Transaction Finalized</p>
                        </div>

                        <div className="space-y-5 px-2">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Transaction ID</p>
                                    <p className="text-sm font-black dark:text-white tabular-nums">{selectedTx.id}</p>
                                </div>
                                <div className="space-y-1.5 text-right">
                                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Ledger Entry</p>
                                    <p className="text-sm font-black dark:text-white tabular-nums">{selectedTx.date}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Counterparty</p>
                                    <p className="text-sm font-black dark:text-white">{selectedTx.customer}</p>
                                </div>
                                <div className="space-y-1.5 text-right">
                                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Asset Node</p>
                                    <p className="text-sm font-black dark:text-white flex items-center justify-end gap-2 uppercase italic">
                                        {getPaymentIcon(selectedTx.type)}
                                        {selectedTx.type}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Policy Reference</span>
                                    <span className="text-sm font-black text-primary-600 italic tracking-tighter">{selectedTx.reference}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Operational Status</span>
                                    <Badge variant="success" size="sm" className="rounded-xl px-4 font-black">STABLE</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold" leftIcon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>Print Proof</Button>
                            <Button className="flex-1 h-12 rounded-2xl font-black" leftIcon={<Download className="w-4 h-4" />}>PDF Vault</Button>
                        </div>

                        <p className="text-[10px] text-center text-neutral-400 italic font-bold uppercase tracking-tighter opacity-70">
                            Professional Grade Financial Document • Generated by NetFlow Core Engine
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
