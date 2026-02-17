"use client";

import React from "react";
import { UserPlus, Search, Filter, Edit2, Trash2 } from "lucide-react";
import { Card, CardBody, Button, Avatar, Badge } from "@/components";
import { cn } from "@/lib/utils";

export default function UserManagement() {
    const users = [
        { id: 1, name: "Rudra", email: "rudra@netflow.local", role: "Super Admin", status: "Active", avatar: "" },
        { id: 2, name: "Sarah Connor", email: "sarah@netflow.local", role: "Operator", status: "Active", avatar: "" },
        { id: 3, name: "John Doe", email: "john@netflow.local", role: "Viewer", status: "Inactive", avatar: "" },
    ];

    return (
        <div className="space-y-6 animate-slideUp">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold dark:text-white">Staff & Admins</h3>
                    <p className="text-sm text-neutral-500">Manage individuals who have access to this dashboard.</p>
                </div>
                <Button leftIcon={<UserPlus className="w-4 h-4" />}>Add Staff Member</Button>
            </div>

            <Card className="glass overflow-hidden px-0">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-0 rounded-lg text-sm"
                            placeholder="Search staff..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>Filter</Button>
                    </div>
                </div>
                <CardBody className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Last Login</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={user.name} size="sm" />
                                                <div>
                                                    <p className="text-sm font-medium dark:text-white">{user.name}</p>
                                                    <p className="text-xs text-neutral-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={user.role === 'Super Admin' ? 'info' : 'default'} size="sm">
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", user.status === 'Active' ? 'bg-success-500' : 'bg-neutral-400')} />
                                                <span className="text-sm dark:text-neutral-300">{user.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-500">2 hours ago</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0"><Edit2 className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-error-500"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
