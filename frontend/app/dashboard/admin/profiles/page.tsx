"use client";

import React, { useState } from "react";
import {
    Tag, Plus, Search, Filter, Edit2, Trash2,
    Zap, Clock, CreditCard, Shield, Globe,
    ArrowUpRight, ArrowDownLeft, Check, TrendingUp, TrendingDown,
    Activity, Users, PieChart as PieChartIcon
} from "lucide-react";
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import {
    Button, Card, CardBody, CardHeader,
    Input, Badge, Modal, Select, Progress
} from "@/components";
import { cn } from "@/lib/utils";

// Types for Internet Packages (Profiles)
interface InternetPackage {
    id: string;
    name: string;
    type: "PPP" | "Hotspot";
    speedLimit: string;
    price: number;
    validity: string;
    sharingLimit: number;
    activeUsers: number;
    status: "active" | "archived";
    color: string;
}

const mockPackages: InternetPackage[] = [
    {
        id: "pkg_1",
        name: "Standard Home",
        type: "PPP",
        speedLimit: "10M/10M",
        price: 15.00,
        validity: "30 Days",
        sharingLimit: 1,
        activeUsers: 450,
        status: "active",
        color: "bg-blue-500",
    },
    {
        id: "pkg_2",
        name: "Business Pro",
        type: "PPP",
        speedLimit: "50M/50M",
        price: 45.99,
        validity: "30 Days",
        sharingLimit: 1,
        activeUsers: 120,
        status: "active",
        color: "bg-purple-500",
    },
    {
        id: "pkg_3",
        name: "Hotspot 1Hr",
        type: "Hotspot",
        speedLimit: "2M/2M",
        price: 1.00,
        validity: "1 Hour",
        sharingLimit: 1,
        activeUsers: 85,
        status: "active",
        color: "bg-orange-500",
    },
    {
        id: "pkg_4",
        name: "Hotspot Daily",
        type: "Hotspot",
        speedLimit: "5M/5M",
        price: 3.50,
        validity: "24 Hours",
        sharingLimit: 1,
        activeUsers: 210,
        status: "active",
        color: "bg-emerald-500",
    },
];

export default function ProfilesPage() {
    const [packages] = useState<InternetPackage[]>(mockPackages);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [showAddModal, setShowAddModal] = useState(false);

    const filteredPackages = packages.filter(pkg => {
        const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || pkg.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const distributionData = [
        { name: "Standard Home", value: 450, color: "#3b82f6" },
        { name: "Business Pro", value: 120, color: "#a855f7" },
        { name: "Hotspot 1Hr", value: 85, color: "#f97316" },
        { name: "Hotspot Daily", value: 210, color: "#10b981" },
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Tag className="w-6 h-6 text-primary-500" />
                        Internet Packages
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Define service profiles, pricing, and billing constraints.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        leftIcon={<Activity className="w-4 h-4" />}
                    >
                        Usage Reports
                    </Button>
                    <Button
                        leftIcon={<Plus className="w-4 h-4" />}
                        onClick={() => setShowAddModal(true)}
                        className="shadow-lg shadow-primary-500/20"
                    >
                        Create Package
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Stats Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="glass border-0 shadow-sm relative overflow-hidden group">
                        <CardBody className="py-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                                    <Globe className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500 font-bold uppercase tracking-wider">Active Subscribers</p>
                                    <p className="text-4xl font-black text-neutral-900 dark:text-white">865</p>
                                    <div className="flex items-center gap-1 text-success-600 text-xs font-bold mt-1">
                                        <TrendingUp className="w-3 h-3" />
                                        +12% from last month
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="glass border-0 shadow-sm relative overflow-hidden group">
                        <CardBody className="py-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                                    <CreditCard className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500 font-bold uppercase tracking-wider">Estimated Revenue</p>
                                    <p className="text-4xl font-black text-neutral-900 dark:text-white">$14.2k</p>
                                    <div className="flex items-center gap-1 text-success-600 text-xs font-bold mt-1">
                                        <TrendingUp className="w-3 h-3" />
                                        +$2.4k increase
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="glass border-0 shadow-sm relative overflow-hidden group col-span-1 sm:col-span-2">
                        <CardBody className="py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform">
                                    <Zap className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500 font-bold uppercase tracking-wider">Peak Bandwidth Allocated</p>
                                    <p className="text-4xl font-black text-neutral-900 dark:text-white">8.2 Gbps</p>
                                    <p className="text-xs text-neutral-400 mt-1 font-medium italic">Based on total package limits</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <p className="text-xs text-neutral-500 font-bold uppercase mb-1">Upload</p>
                                    <p className="text-lg font-black text-primary-500 leading-none">3.1G</p>
                                </div>
                                <div className="w-[1px] h-10 bg-neutral-200 dark:bg-neutral-800" />
                                <div className="text-center">
                                    <p className="text-xs text-neutral-500 font-bold uppercase mb-1">Download</p>
                                    <p className="text-lg font-black text-info-500 leading-none">5.1G</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Distribution Chart */}
                <Card className="glass border-0 shadow-xl overflow-hidden min-h-[300px]">
                    <CardHeader title="User Distribution" subtitle="Active users per package type" />
                    <CardBody className="p-0">
                        <div className="h-64 mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend verticalAlign="bottom" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Filters */}
            <Card className="glass border-0 shadow-sm">
                <CardBody className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                placeholder="Search packages by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 border-0 bg-neutral-100 dark:bg-neutral-800"
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                value={typeFilter}
                                onChange={(val) => setTypeFilter(val)}
                                options={[
                                    { value: "all", label: "All Types" },
                                    { value: "PPP", label: "PPPoE" },
                                    { value: "Hotspot", label: "Hotspot" },
                                ]}
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPackages.map((pkg) => (
                    <Card key={pkg.id} className="glass border-0 shadow-xl overflow-hidden group hover:scale-[1.01] transition-all duration-300">
                        <div className={cn("h-2 w-full", pkg.color)} />
                        <CardBody className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <Badge variant={pkg.type === "PPP" ? "info" : "warning"} size="sm" className="mb-2 uppercase tracking-tighter">
                                        {pkg.type} Profile
                                    </Badge>
                                    <h3 className="text-xl font-black text-neutral-900 dark:text-white">{pkg.name}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-primary-600 dark:text-primary-400">${pkg.price}</p>
                                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">{pkg.validity}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                                        <Zap className="w-3 h-3" />
                                        Speed Limit
                                    </div>
                                    <p className="text-sm font-black dark:text-neutral-200">{pkg.speedLimit}</p>
                                </div>
                                <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                                        <Clock className="w-3 h-3" />
                                        Validity
                                    </div>
                                    <p className="text-sm font-black dark:text-neutral-200">{pkg.validity}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-500">Active Subscribers</span>
                                    <span className="font-bold dark:text-white">{pkg.activeUsers}</span>
                                </div>
                                <Progress value={(pkg.activeUsers / 500) * 100} size="sm" variant="info" />
                            </div>

                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                                <div className="flex items-center gap-2 text-xs text-neutral-500">
                                    <Shield className="w-3 h-3 text-success-500" />
                                    Shared Limit: {pkg.sharingLimit}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" className="p-2 h-8 w-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="p-2 h-8 w-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-error-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}

                {/* Create New Dummy Card */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="group relative h-full min-h-[250px] border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all duration-300"
                >
                    <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-2xl group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                        <Plus className="w-8 h-8 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                    <span className="text-sm font-bold text-neutral-500 group-hover:text-primary-600 transition-colors">Create New Package</span>
                </button>
            </div>

            {/* Add Package Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Create Service Package"
                size="lg"
            >
                <form className="space-y-5 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <Input label="Package Name" placeholder="e.g., Premium Home" required />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <Select
                                label="Service Type"
                                options={[
                                    { value: "PPP", label: "PPPoE" },
                                    { value: "Hotspot", label: "Hotspot" },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <div className="relative">
                                <Input label="Billing Amount" type="number" placeholder="0.00" required />
                                <span className="absolute right-3 top-[34px] text-neutral-400 font-bold">$</span>
                            </div>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <Select
                                label="Billing Cycle"
                                options={[
                                    { value: "1hr", label: "1 Hour" },
                                    { value: "24hr", label: "24 Hours" },
                                    { value: "30day", label: "30 Days" },
                                    { value: "yearly", label: "Yearly" },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <Input label="Download Limit (Mbps)" placeholder="10" type="number" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <Input label="Upload Limit (Mbps)" placeholder="10" type="number" />
                        </div>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl space-y-4">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Advanced Constraints</p>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Shared Users Limit" type="number" defaultValue={1} />
                            <Input label="IP Pool" placeholder="main_pool" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button type="submit" className="shadow-lg shadow-primary-500/20">Save Package</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
